import { GitHubPullRequestSonarqubeJobModel } from '../../db/models/github-pull-request-sonarqube-job.sequelize.ts';
import { GitHubPullRequestSonarqubeRepositoryModel } from '../../db/models/github-pull-request-sonarqube-repository.sequelize.ts';
import { GitHubPullRequestSonarqubeResultModel } from '../../db/models/github-pull-request-sonarqube-result.sequelize.ts';
import { errorUtilities, gitHubHelperUtilities } from '../../utils/index.utilities.ts';
import { gitWorkspaceService } from '../git/git-workspace.service.ts';
import { githubApiService } from '../index.service.ts';
import { sonarqubeApiService } from '../sonarqube/sonarqube-api.service.ts';
import { sonarqubeScannerService } from '../sonarqube/sonarqube-scanner.service.ts';

interface PullRequestListItem {
    number?: number;
}

interface SnapshotResolution {
    oldestPullRequestCommitHash: string;
    baseSnapshotHash: string;
    closedSnapshotHash: string;
}

export class GitHubPullRequestsSonarqubeService {
    public async processRepository(parameters: {
        job: GitHubPullRequestSonarqubeJobModel;
        repository: GitHubPullRequestSonarqubeRepositoryModel;
    }): Promise<void> {
        const cloneRootPath =
            parameters.job.cloneRootPath ||
            process.env.SONARQUBE_CLONE_ROOT ||
            'archives/sonarqube';

        console.log('STARTING.....', parameters.repository.repositoryName);

        const repositoryInfo = await githubApiService.repositories.fetch.getRepository({
            username: parameters.repository.username,
            repositoryName: parameters.repository.repositoryName,
        });

        console.log('REPOSITORY INFORMATION:', repositoryInfo);

        const repositoryUrl =
            repositoryInfo.clone_url ||
            repositoryInfo.html_url ||
            parameters.repository.repositoryUrl ||
            gitHubHelperUtilities.getRepositoryUrl({
                owner: parameters.repository.username,
                repo: parameters.repository.repositoryName,
            });

        const clonePath = await gitWorkspaceService.ensureRepository({
            cloneRootPath,
            owner: parameters.repository.username,
            repo: parameters.repository.repositoryName,
            repositoryUrl,
        });

        await GitHubPullRequestSonarqubeRepositoryModel.update(
            {
                localClonePath: clonePath,
                repositoryUrl,
                defaultBranch: repositoryInfo.default_branch || undefined,
            },
            { where: { id: parameters.repository.id } }
        );

        const pullRequests = await this.fetchRepositoryPullRequests({
            owner: parameters.repository.username,
            repositoryName: parameters.repository.repositoryName,
            maxPullRequestsPerRepository:
                parameters.job.maxPullRequestsPerRepository ||
                Number(process.env.GITHUB_PR_SONARQUBE_MAX_PRS_PER_REPOSITORY ?? '200'),
        });

        for (const item of pullRequests) {
            console.log('ITEM:', item);
            if (!item.number) {
                continue;
            }

            try {
                console.log('STARTING PROCESSING ITEM', item.number);
                await this.processPullRequest({
                    job: parameters.job,
                    repository: parameters.repository,
                    clonePath,
                    pullRequestNumber: item.number,
                });

                console.log('PULL REQUEST PROCESSED');
            } catch (error) {
                console.log('ERROR PROCESSING PULL REQUEST', item.number);
                console.log(error);

                await GitHubPullRequestSonarqubeResultModel.create({
                    jobId: parameters.job.id,
                    repositoryJobId: parameters.repository.id,
                    classificationJobId: parameters.job.classificationJobId,
                    username: parameters.repository.username,
                    repositoryName: parameters.repository.repositoryName,
                    repositoryUrl,
                    localClonePath: clonePath,
                    pullRequestNumber: item.number,
                    pullRequestTitle: 'PROCESSING_ERROR',
                    pullRequestUrl: '',
                    pullRequestState: 'closed',
                    pullRequestMerged: false,
                    baseBranchName: undefined,
                    headBranchName: undefined,
                    analysisRole: 'pr_closed',
                    commitHash: 'n/a',
                    commitSequence: 0,
                    firstPullRequestCommitHash: undefined,
                    closingCommitHash: undefined,
                    sonarProjectKey: this.buildProjectKey(
                        parameters.repository.username,
                        parameters.repository.repositoryName,
                        item.number
                    ),
                    sonarProjectName: this.buildProjectName(
                        parameters.repository.username,
                        parameters.repository.repositoryName,
                        item.number
                    ),
                    sonarDashboardUrl: undefined,
                    sonarTaskId: undefined,
                    sonarAnalysisId: undefined,
                    qualityGateStatus: 'ERROR',
                    bugs: 0,
                    vulnerabilities: 0,
                    codeSmells: 0,
                    securityHotspots: 0,
                    coverage: undefined,
                    duplicatedLinesDensity: undefined,
                    ncloc: 0,
                    complexity: 0,
                    cognitiveComplexity: 0,
                    softwareQualityReliabilityIssues: 0,
                    softwareQualityMaintainabilityIssues: 0,
                    softwareQualitySecurityIssues: 0,
                    measuresJson: {},
                    issuesSummaryJson: {},
                    securityHotspotsSummaryJson: {},
                    qualityGateJson: {},
                    scannerContextJson: {
                        error: errorUtilities.getErrorMessage(error),
                    },
                    deleted: false,
                });
            }
        }
    }

    private async processPullRequest(parameters: {
        job: GitHubPullRequestSonarqubeJobModel;
        repository: GitHubPullRequestSonarqubeRepositoryModel;
        clonePath: string;
        pullRequestNumber: number;
    }): Promise<void> {
        const details = await githubApiService.pullRequests.fetch.getDetails({
            username: parameters.repository.username,
            repositoryName: parameters.repository.repositoryName,
            pullRequestNumber: parameters.pullRequestNumber,
        });
        console.log('DETAILS LOADED');

        if (!this.shouldProcessPullRequest(details, parameters.job)) {
            console.log('NOT PROCESSING');
            return;
        }

        console.log('START GETTING SNAPSHOTS');
        const snapshots = await this.resolveSnapshots({
            owner: parameters.repository.username,
            repositoryName: parameters.repository.repositoryName,
            pullRequestNumber: parameters.pullRequestNumber,
            pullRequestDetails: details,
        });
        console.log('SNAPSHOTS FETCHED -', snapshots);

        console.log('FETCHING CHANGED FILES - START');
        const pullRequestFiles = await githubApiService.pullRequests.fetch.getFiles({
            username: parameters.repository.username,
            repositoryName: parameters.repository.repositoryName,
            pullRequestNumber: parameters.pullRequestNumber,
        });

        const changedFiles = pullRequestFiles
            .map((file) => file.filename)
            .filter((filename): filename is string => Boolean(filename));

        console.log('FETCHING CHANGED FILES - END', {
            count: changedFiles.length,
            changedFiles,
        });

        if (!snapshots) {
            console.log('MISSING_SNAPSHOT -', parameters.repository.repositoryName);
            await GitHubPullRequestSonarqubeResultModel.create({
                jobId: parameters.job.id,
                repositoryJobId: parameters.repository.id,
                classificationJobId: parameters.job.classificationJobId,
                username: parameters.repository.username,
                repositoryName: parameters.repository.repositoryName,
                repositoryUrl: parameters.repository.repositoryUrl,
                localClonePath: parameters.clonePath,
                pullRequestNumber: details.number,
                pullRequestTitle: details.title || 'Snapshot resolution failed',
                pullRequestUrl: details.html_url || '',
                pullRequestState: details.state || '',
                pullRequestMerged: Boolean(details.merged),
                baseBranchName: details.base?.ref,
                headBranchName: details.head?.ref,
                analysisRole: 'pr_base',
                commitHash: 'n/a',
                commitSequence: 0,
                firstPullRequestCommitHash: undefined,
                closingCommitHash: undefined,
                sonarProjectKey: this.buildProjectKey(
                    parameters.repository.username,
                    parameters.repository.repositoryName,
                    details.number
                ),
                sonarProjectName: this.buildProjectName(
                    parameters.repository.username,
                    parameters.repository.repositoryName,
                    details.number
                ),
                sonarDashboardUrl: undefined,
                sonarTaskId: undefined,
                sonarAnalysisId: undefined,
                qualityGateStatus: 'SKIPPED_MISSING_SNAPSHOT',
                bugs: 0,
                vulnerabilities: 0,
                codeSmells: 0,
                securityHotspots: 0,
                coverage: undefined,
                duplicatedLinesDensity: undefined,
                ncloc: 0,
                complexity: 0,
                cognitiveComplexity: 0,
                softwareQualityReliabilityIssues: 0,
                softwareQualityMaintainabilityIssues: 0,
                softwareQualitySecurityIssues: 0,
                measuresJson: {},
                issuesSummaryJson: {},
                securityHotspotsSummaryJson: {},
                qualityGateJson: {},
                scannerContextJson: {
                    reason: 'Could not resolve base/closed snapshots for PR',
                    changedFiles,
                },
                deleted: false,
            });
            return;
        }

        console.log('BUILD PROJECT KEY - START');
        const projectKey = this.buildProjectKey(
            parameters.repository.username,
            parameters.repository.repositoryName,
            details.number
        );
        console.log('BUILD PROJECT KEY - END');

        console.log('BUILD PROJECT NAME - START');
        const projectName = this.buildProjectName(
            parameters.repository.username,
            parameters.repository.repositoryName,
            details.number
        );
        console.log('BUILD PROJECT NAME - END');

        console.log('SCANNING - START');
        await this.scanAndPersist({
            job: parameters.job,
            repository: parameters.repository,
            clonePath: parameters.clonePath,
            details,
            snapshotHash: snapshots.baseSnapshotHash,
            firstPullRequestCommitHash: snapshots.oldestPullRequestCommitHash,
            closingCommitHash: snapshots.closedSnapshotHash,
            analysisRole: 'pr_base',
            projectKey,
            projectName,
            changedFiles,
        });
        console.log('SCANNING - END 111111111111111111');

        console.log('SCANNING - END 222222222222222222');
        await this.scanAndPersist({
            job: parameters.job,
            repository: parameters.repository,
            clonePath: parameters.clonePath,
            details,
            snapshotHash: snapshots.closedSnapshotHash,
            firstPullRequestCommitHash: snapshots.oldestPullRequestCommitHash,
            closingCommitHash: snapshots.closedSnapshotHash,
            analysisRole: 'pr_closed',
            projectKey,
            projectName,
            changedFiles,
        });
        console.log('SCANNING - END');
    }

    private async scanAndPersist(parameters: {
        job: GitHubPullRequestSonarqubeJobModel;
        repository: GitHubPullRequestSonarqubeRepositoryModel;
        clonePath: string;
        details: {
            number: number;
            title: string;
            html_url: string;
            state: string;
            merged: boolean;
            base?: { ref?: string; sha?: string };
            head?: { ref?: string; sha?: string };
        };
        snapshotHash: string;
        firstPullRequestCommitHash: string;
        closingCommitHash: string;
        analysisRole: 'pr_base' | 'pr_closed';
        projectKey: string;
        projectName: string;
        changedFiles?: string[];
    }): Promise<void> {
        console.log('CHECKOUT TO COMMIT - START');
        await gitWorkspaceService.checkoutCommit({
            clonePath: parameters.clonePath,
            commitHash: parameters.snapshotHash,
        });
        console.log('CHECKOUT TO COMMIT - END');

        console.log('FETCHING SCANNER RESULT - START');
        const scannerResult = await sonarqubeScannerService.scan({
            projectKey: parameters.projectKey,
            projectName: parameters.projectName,
            sourcePath: parameters.clonePath,
            changedFiles: parameters.changedFiles,
        });
        console.log('FETCHING SCANNER RESULT - END');

        console.log('TASK - START');
        let analysisId = undefined as string | undefined;
        if (scannerResult.taskId) {
            console.log('TASK FOUND - START WAITING');
            const taskResult = await sonarqubeApiService.waitForTask(scannerResult.taskId);
            analysisId = taskResult.analysisId;
            console.log('TASK FOUND - END WAITING');
        }
        console.log('TASK - END');

        console.log('FETCHING SUMMARY - START');
        const summary = await sonarqubeApiService.getSummary({ projectKey: parameters.projectKey });
        console.log('FETCHING SUMMARY - END');

        await GitHubPullRequestSonarqubeResultModel.create({
            jobId: parameters.job.id,
            repositoryJobId: parameters.repository.id,
            classificationJobId: parameters.job.classificationJobId,
            username: parameters.repository.username,
            repositoryName: parameters.repository.repositoryName,
            repositoryUrl: parameters.repository.repositoryUrl,
            localClonePath: parameters.clonePath,
            pullRequestNumber: parameters.details.number,
            pullRequestTitle: parameters.details.title || '',
            pullRequestUrl: parameters.details.html_url || '',
            pullRequestState: parameters.details.state || '',
            pullRequestMerged: Boolean(parameters.details.merged),
            baseBranchName: parameters.details.base?.ref,
            headBranchName: parameters.details.head?.ref,
            analysisRole: parameters.analysisRole,
            commitHash: parameters.snapshotHash,
            commitSequence: 0,
            firstPullRequestCommitHash: parameters.firstPullRequestCommitHash,
            closingCommitHash: parameters.closingCommitHash,
            sonarProjectKey: parameters.projectKey,
            sonarProjectName: parameters.projectName,
            sonarDashboardUrl: scannerResult.dashboardUrl,
            sonarTaskId: scannerResult.taskId,
            sonarAnalysisId: analysisId || summary.sonarAnalysisId,
            qualityGateStatus: summary.qualityGateStatus,
            bugs: summary.bugs,
            vulnerabilities: summary.vulnerabilities,
            codeSmells: summary.codeSmells,
            securityHotspots: summary.securityHotspots,
            coverage: summary.coverage,
            duplicatedLinesDensity: summary.duplicatedLinesDensity,
            ncloc: summary.ncloc,
            complexity: summary.complexity,
            cognitiveComplexity: summary.cognitiveComplexity,
            softwareQualityReliabilityIssues: summary.softwareQualityReliabilityIssues,
            softwareQualityMaintainabilityIssues: summary.softwareQualityMaintainabilityIssues,
            softwareQualitySecurityIssues: summary.softwareQualitySecurityIssues,
            measuresJson: summary.measuresJson,
            issuesSummaryJson: summary.issuesSummaryJson,
            securityHotspotsSummaryJson: summary.securityHotspotsSummaryJson,
            qualityGateJson: summary.qualityGateJson,
            scannerContextJson: {
                rawOutput: scannerResult.rawOutput,
                taskId: scannerResult.taskId,
                dashboardUrl: scannerResult.dashboardUrl,
                analysisRole: parameters.analysisRole,
                changedFiles: parameters.changedFiles ?? [],
            },
            deleted: false,
        });

        console.log('DONE');

        await this.sleep(5000);
        console.log('SLEPT - CONTINUING TO NEXT PR');
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private shouldProcessPullRequest(
        details: { state: string; merged: boolean },
        job: GitHubPullRequestSonarqubeJobModel
    ): boolean {
        const merged = Boolean(details.merged);
        const closedUnmerged = details.state === 'closed' && !merged;

        if (job.onlyMerged) {
            return merged;
        }

        if (merged) {
            return true;
        }

        if (closedUnmerged && job.includeClosedUnmerged) {
            return true;
        }

        return false;
    }

    private async resolveSnapshots(parameters: {
        owner: string;
        repositoryName: string;
        pullRequestNumber: number;
        pullRequestDetails: {
            merged: boolean;
            merge_commit_sha?: string;
            head?: { sha?: string };
        };
    }): Promise<SnapshotResolution | undefined> {
        const commits = await githubApiService.pullRequests.fetch.getCommits({
            username: parameters.owner,
            repositoryName: parameters.repositoryName,
            pullRequestNumber: parameters.pullRequestNumber,
        });

        const oldest = commits[0];
        const oldestPullRequestCommitHash = oldest?.sha || '';
        const firstParent = oldest?.parents?.[0]?.sha || '';

        if (!oldestPullRequestCommitHash || !firstParent) {
            return;
        }

        const closedSnapshotHash = parameters.pullRequestDetails.merged
            ? parameters.pullRequestDetails.merge_commit_sha || ''
            : parameters.pullRequestDetails.head?.sha || '';

        if (!closedSnapshotHash) {
            return;
        }

        return {
            oldestPullRequestCommitHash,
            baseSnapshotHash: firstParent,
            closedSnapshotHash,
        };
    }

    private async fetchRepositoryPullRequests(parameters: {
        owner: string;
        repositoryName: string;
        maxPullRequestsPerRepository: number;
    }): Promise<PullRequestListItem[]> {
        const items: PullRequestListItem[] = [];
        let page = 1;
        while (items.length < parameters.maxPullRequestsPerRepository) {
            console.log(
                `Fetching pull requests for ${parameters.owner}/${parameters.repositoryName} - page ${page}`
            );
            const perPage = Math.max(
                1,
                Math.min(100, parameters.maxPullRequestsPerRepository - items.length)
            );
            const response = await githubApiService.pullRequests.fetch.listForRepository({
                username: parameters.owner,
                repositoryName: parameters.repositoryName,
                page,
                perPage,
            });

            const current = response || [];
            if (current.length === 0) {
                break;
            }

            for (const item of current) {
                if (items.length >= parameters.maxPullRequestsPerRepository) {
                    break;
                }

                items.push(item);
            }

            page += 1;
        }
        console.log('TOTAL PULL REQUESTS FETCHED:', items.length);
        return items;
    }

    private buildProjectKey(owner: string, repo: string, number: number): string {
        return `ghpr:${owner}:${repo}:pr:${number}`;
    }

    private buildProjectName(owner: string, repo: string, number: number): string {
        return `GitHub PR ${owner}/${repo}#${number}`;
    }
}

export const gitHubPullRequestsSonarqubeService = new GitHubPullRequestsSonarqubeService();
