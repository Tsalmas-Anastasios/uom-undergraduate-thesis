import { Op, Transaction } from 'sequelize';

import { GitHubPullRequestSonarqubeJobModel } from '../db/models/github-pull-request-sonarqube-job.sequelize.ts';
import { GitHubPullRequestSonarqubeRepositoryModel } from '../db/models/github-pull-request-sonarqube-repository.sequelize.ts';
import { gitHubPullRequestsSonarqubeService } from '../services/github-reports/pull-requests-sonarqube.service.ts';
import { database, errorUtilities } from '../utils/index.utilities.ts';

export class GitHubPullRequestsSonarqubeJobRunner {
    #intervalId: NodeJS.Timeout | undefined = undefined;
    #isProcessing = false;
    #intervalMs: number;
    #staleJobMs: number;

    constructor(intervalMs = Number(process.env.GITHUB_PR_SONARQUBE_JOB_INTERVAL_MS ?? '60000')) {
        this.#intervalMs = Number.isNaN(intervalMs) ? 60_000 : intervalMs;
        const staleMs = Number(process.env.GITHUB_PR_SONARQUBE_JOB_STALE_MS ?? '900000');
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
                    const pendingJob = await GitHubPullRequestSonarqubeJobModel.findOne({
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
            console.log(job);
            if (!job) return;

            try {
                const repositories = await GitHubPullRequestSonarqubeRepositoryModel.findAll({
                    where: { jobId: job.id, deleted: false },
                    order: [['createdAt', 'ASC']],
                });
                console.log(repositories);
                for (const repository of repositories) {
                    if (repository.investigated) {
                        continue;
                    }
                    console.log(repository, '- NOT INVESTIGATED YET');
                    await gitHubPullRequestsSonarqubeService.processRepository({
                        job,
                        repository,
                    });
                    console.log(repository.repositoryName, '- PROCESSED');
                    repository.investigated = true;

                    await repository.save();
                }

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
