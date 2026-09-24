import { Op, Transaction } from 'sequelize';

import { GitHubPullRequestReportJobModel } from '../db/models/github-pull-request-report-job.sequelize.ts';
import { GitHubPullRequestReportRepositoryModel } from '../db/models/github-pull-request-report-repository.sequelize.ts';
import { GitHubPullRequestReportResultModel } from '../db/models/github-pull-request-report-result.sequelize.ts';
import { GitHubPullRequestsReportService } from '../services/github-reports/pull-requests-report.service.ts';
import { database, errorUtilities } from '../utils/index.utilities.ts';

export class GitHubPullRequestsReportJobRunner {
    #intervalId: NodeJS.Timeout | undefined = undefined;
    #isProcessing = false;
    #service = new GitHubPullRequestsReportService();
    #intervalMs: number;
    #staleJobMs: number;

    constructor(intervalMs = Number(process.env.GITHUB_REPORT_JOB_INTERVAL_MS ?? '60000')) {
        this.#intervalMs = Number.isNaN(intervalMs) ? 60_000 : intervalMs;
        const staleMs = Number(process.env.GITHUB_REPORT_JOB_STALE_MS ?? '900000');
        this.#staleJobMs = Number.isNaN(staleMs) ? 900_000 : staleMs;
    }

    start(): void {
        if (this.#intervalId) return;
        this.#intervalId = setInterval(() => {
            this.runOnce();
        }, this.#intervalMs);
        this.runOnce();
    }

    stop(): void {
        if (this.#intervalId) {
            clearInterval(this.#intervalId);
            this.#intervalId = undefined;
        }
    }

    private async runOnce(): Promise<void> {
        if (this.#isProcessing) return;
        this.#isProcessing = true;

        try {
            const job = await database.transaction(
                { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
                async (transaction) => {
                    const staleBefore = new Date(Date.now() - this.#staleJobMs);
                    const pendingJob = await GitHubPullRequestReportJobModel.findOne({
                        where: {
                            completed: false,
                            deleted: false,
                            [Op.or]: [
                                { startedAt: { [Op.is]: undefined } },
                                { startedAt: { [Op.lt]: staleBefore } },
                            ],
                        },
                        order: [['createdAt', 'ASC']],
                        lock: transaction.LOCK.UPDATE,
                        skipLocked: true,
                        transaction,
                    });

                    if (!pendingJob) return;

                    pendingJob.startedAt = new Date();
                    await pendingJob.save({ transaction });
                    return pendingJob;
                }
            );

            if (!job) return;

            try {
                const existingRepositories = await GitHubPullRequestReportRepositoryModel.findAll({
                    where: { jobId: job.id, deleted: false },
                    order: [['createdAt', 'ASC']],
                });

                let repositories = existingRepositories.map((repository) => ({
                    username: repository.username,
                    name: repository.repositoryName,
                    investigated: repository.investigated,
                }));

                if (repositories.length === 0) {
                    const fetchedRepositories = await this.#service.fetchRepositoriesWithRetry(
                        job.usernames
                    );

                    if (fetchedRepositories.length > 0) {
                        await GitHubPullRequestReportRepositoryModel.bulkCreate(
                            fetchedRepositories.map((repository) => ({
                                jobId: job.id,
                                repositoryName: repository.name,
                                username: repository.username,
                                investigated: false,
                                deleted: false,
                            }))
                        );
                    }

                    repositories = fetchedRepositories.map((repository) => ({
                        username: repository.username,
                        name: repository.name,
                        investigated: false,
                    }));
                }

                for (const repository of repositories) {
                    if (repository.investigated) {
                        continue;
                    }

                    const repositoryData = await this.#service.buildRepositoryData(
                        repository,
                        job.effectiveLabels
                    );

                    await GitHubPullRequestReportResultModel.create({
                        jobId: job.id,
                        repositoryName: repositoryData.repositoryName,
                        username: repositoryData.username,
                        repositoryUrl: repositoryData.repositoryUrl,
                        pullRequests: repositoryData.pullRequests,
                        deleted: false,
                    });

                    await GitHubPullRequestReportRepositoryModel.update(
                        { investigated: true },
                        {
                            where: {
                                jobId: job.id,
                                repositoryName: repository.name,
                                username: repository.username,
                            },
                        }
                    );
                }

                const results = await GitHubPullRequestReportResultModel.findAll({
                    where: { jobId: job.id, deleted: false },
                    order: [['createdAt', 'ASC']],
                });

                const repositoriesData = results.map((result) => ({
                    repositoryName: result.repositoryName,
                    username: result.username,
                    repositoryUrl: result.repositoryUrl,
                    pullRequests: result.pullRequests,
                }));

                const excelFilePath =
                    repositoriesData.length === 0
                        ? ''
                        : await this.#service.exportToExcelFromResults(
                              job.effectiveLabels,
                              repositoriesData
                          );

                job.reportFilePath = excelFilePath || undefined;
                job.completed = true;
                job.completedAt = new Date();
                job.errorMessage = undefined;
                await job.save();
            } catch (error) {
                job.errorMessage = errorUtilities.getErrorMessage(error);
                await job.save();
            }
        } finally {
            this.#isProcessing = false;
        }
    }
}
