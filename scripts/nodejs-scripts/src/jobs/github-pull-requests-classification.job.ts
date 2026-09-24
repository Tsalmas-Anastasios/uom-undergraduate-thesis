import { Op, Transaction } from 'sequelize';

import { GitHubPullRequestClassificationJobModel } from '../db/models/github-pull-request-classification-job.sequelize.ts';
import { GitHubPullRequestClassificationRepositoryModel } from '../db/models/github-pull-request-classification-repository.sequelize.ts';
import { gitHubPullRequestsClassificationService } from '../services/github-reports/pull-requests-classification.service.ts';
import { database, errorUtilities } from '../utils/index.utilities.ts';

export class GitHubPullRequestsClassificationJobRunner {
    #intervalId: NodeJS.Timeout | undefined = undefined;
    #isProcessing = false;
    #intervalMs: number;
    #staleJobMs: number;

    constructor(
        intervalMs = Number(process.env.GITHUB_PR_CLASSIFICATION_JOB_INTERVAL_MS ?? '60000')
    ) {
        this.#intervalMs = Number.isNaN(intervalMs) ? 60_000 : intervalMs;
        const staleMs = Number(process.env.GITHUB_PR_CLASSIFICATION_JOB_STALE_MS ?? '900000');
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
        if (!this.#intervalId) return;
        clearInterval(this.#intervalId);
        this.#intervalId = undefined;
    }

    private async runOnce(): Promise<void> {
        if (this.#isProcessing) return;
        this.#isProcessing = true;

        try {
            const job = await database.transaction(
                { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
                async (transaction) => {
                    const staleBefore = new Date(Date.now() - this.#staleJobMs);
                    const pendingJob = await GitHubPullRequestClassificationJobModel.findOne({
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

                    if (!pendingJob) {
                        return;
                    }

                    pendingJob.startedAt = new Date();
                    await pendingJob.save({ transaction });
                    return pendingJob;
                }
            );

            if (!job) return;

            try {
                const existingRepositories =
                    await GitHubPullRequestClassificationRepositoryModel.findAll({
                        where: { jobId: job.id, deleted: false },
                        order: [['createdAt', 'ASC']],
                    });

                let repositories: {
                    username: string;
                    name: string;
                    investigated: boolean;
                }[] = existingRepositories.map((repository) => ({
                    username: repository.username,
                    name: repository.repositoryName,
                    investigated: repository.investigated,
                }));

                if (repositories.length === 0) {
                    const fetchedRepositories =
                        await gitHubPullRequestsClassificationService.fetchRepositoriesWithRetry(
                            job.usernames
                        );

                    if (fetchedRepositories.length > 0) {
                        await GitHubPullRequestClassificationRepositoryModel.bulkCreate(
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
                        ...repository,
                        investigated: repository.investigated ?? false,
                    }));
                }

                for (const repository of repositories) {
                    if (repository.investigated) {
                        continue;
                    }

                    await gitHubPullRequestsClassificationService.classifyRepositoryPullRequests({
                        jobId: job.id,
                        modelName: job.modelName,
                        repository,
                    });

                    await GitHubPullRequestClassificationRepositoryModel.update(
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

                const reportFilePath = await gitHubPullRequestsClassificationService.exportToExcel({
                    jobId: job.id,
                });

                job.reportFilePath = reportFilePath || undefined;
                job.completed = true;
                job.completedAt = new Date();
                job.errorMessage = undefined;
                await job.save();
            } catch (error) {
                job.errorMessage = errorUtilities.getErrorMessage(error);
                await job.save();
            }
        } catch (error) {
            console.error(
                '[GitHubPullRequestsClassificationJobRunner]',
                errorUtilities.getErrorMessage(error)
            );
        } finally {
            this.#isProcessing = false;
        }
    }
}
