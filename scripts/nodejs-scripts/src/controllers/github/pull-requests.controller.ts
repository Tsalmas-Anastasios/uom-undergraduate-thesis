import express from 'express';
import { Op } from 'sequelize';

import { GitHubPullRequestClassificationJobModel } from '../../db/models/github-pull-request-classification-job.sequelize.ts';
import { GitHubPullRequestClassificationRepositoryModel } from '../../db/models/github-pull-request-classification-repository.sequelize.ts';
import { GitHubPullRequestClassificationResultModel } from '../../db/models/github-pull-request-classification-result.sequelize.ts';
import { GitHubPullRequestReportJobModel } from '../../db/models/github-pull-request-report-job.sequelize.ts';
import { GitHubPullRequestReportRepositoryModel } from '../../db/models/github-pull-request-report-repository.sequelize.ts';
import { GitHubPullRequestReportResultModel } from '../../db/models/github-pull-request-report-result.sequelize.ts';
import { GitHubPullRequestSonarqubeJobModel } from '../../db/models/github-pull-request-sonarqube-job.sequelize.ts';
import { GitHubPullRequestSonarqubeRepositoryModel } from '../../db/models/github-pull-request-sonarqube-repository.sequelize.ts';
import { GitHubPullRequestSonarqubeResultModel } from '../../db/models/github-pull-request-sonarqube-result.sequelize.ts';
import { errorUtilities, gitHubHelperUtilities } from '../../utils/index.utilities.ts';
import { BaseController } from '../base.controller.ts';

const DEFAULT_PAGE_SIZE = 50;

export class GitHubPullRequestsController extends BaseController {
    public async getPullRequests(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response | undefined> {
        const usernames = this.parseUniqueStrings(request.body?.usernames);
        const labels = this.parseUniqueStrings(request.body?.labels);
        const effectiveLabels = this.getEffectiveLabels(labels);
        if (usernames.length === 0) {
            return response
                .status(400)
                .send({ message: 'At least one username must be provided in the request body.' });
        }

        try {
            const job = await GitHubPullRequestReportJobModel.create({
                usernames,
                labelsRequested: labels,
                effectiveLabels,
            });

            return response.status(202).json({
                message: 'Report job queued',
                job: {
                    recId: job.recId,
                    completed: job.completed,
                    deleted: job.deleted,
                    createdAt: job.createdAt,
                    effectiveLabels: job.effectiveLabels,
                },
            });
        } catch (error) {
            const message = errorUtilities.getErrorMessage(error);
            return response.status(500).json({ message });
        }
    }

    public async queueClassificationJob(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response | undefined> {
        const usernames = this.parseUniqueStrings(request.body?.usernames);
        if (usernames.length === 0) {
            return response
                .status(400)
                .send({ message: 'At least one username must be provided in the request body.' });
        }

        const modelName =
            request.body?.modelName?.toString().trim() ||
            process.env.OPENWEBUI__CORE_CHAT_MODEL ||
            '';
        if (!modelName) {
            return response.status(400).send({
                message:
                    'Model name is required (request body modelName or OPENWEBUI__CORE_CHAT_MODEL env).',
            });
        }

        try {
            const job = await GitHubPullRequestClassificationJobModel.create({
                usernames,
                modelName,
            });

            return response.status(202).json({
                message: 'Classification job queued',
                job,
            });
        } catch (error) {
            const message = errorUtilities.getErrorMessage(error);
            return response.status(500).json({ message });
        }
    }

    public async queueSonarqubeJob(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        const classificationJobId = Number(request.body?.classificationJobId);
        if (!Number.isInteger(classificationJobId) || classificationJobId <= 0) {
            return response
                .status(400)
                .json({ message: 'classificationJobId must be a valid number.' });
        }

        const classificationJob = await GitHubPullRequestClassificationJobModel.findOne({
            where: { id: classificationJobId },
        });
        if (!classificationJob || classificationJob.deleted) {
            return response.status(404).json({ message: 'Classification job not found.' });
        }

        const onlyMerged = request.body?.onlyMerged === true;
        const includeClosedUnmerged = request.body?.includeClosedUnmerged !== false;
        const maxPullRequestsPerRepositoryRaw = Number(request.body?.maxPullRequestsPerRepository);
        const maxPullRequestsPerRepository =
            Number.isInteger(maxPullRequestsPerRepositoryRaw) && maxPullRequestsPerRepositoryRaw > 0
                ? maxPullRequestsPerRepositoryRaw
                : undefined;

        const cloneRootPathRaw = request.body?.cloneRootPath?.toString().trim();
        const cloneRootPath = cloneRootPathRaw || process.env.SONARQUBE_CLONE_ROOT || undefined;

        try {
            const job = await GitHubPullRequestSonarqubeJobModel.create({
                classificationJobId,
                onlyMerged,
                includeClosedUnmerged,
                maxPullRequestsPerRepository,
                cloneRootPath,
            });

            const classificationRepositories =
                await GitHubPullRequestClassificationRepositoryModel.findAll({
                    where: {
                        jobId: classificationJobId,
                        deleted: false,
                    },
                    order: [['createdAt', 'ASC']],
                });

            if (classificationRepositories.length > 0) {
                await GitHubPullRequestSonarqubeRepositoryModel.bulkCreate(
                    classificationRepositories.map((repository) => ({
                        jobId: job.id,
                        sourceClassificationJobId: classificationJobId,
                        sourceClassificationRepositoryId: repository.id,
                        username: repository.username,
                        repositoryName: repository.repositoryName,
                        repositoryUrl: gitHubHelperUtilities.getRepositoryUrl({
                            owner: repository.username,
                            repo: repository.repositoryName,
                        }),
                        localClonePath: undefined,
                        defaultBranch: undefined,
                        investigated: false,
                        deleted: false,
                    }))
                );
            }

            return response.status(202).json({
                message: 'SonarQube job queued',
                job,
                repositoriesCopied: classificationRepositories.length,
            });
        } catch (error) {
            return response.status(500).json({ message: errorUtilities.getErrorMessage(error) });
        }
    }

    public async getClassificationJobStatus(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        const recId = request.params?.recId?.toString();
        if (!recId) {
            return response.status(400).json({ message: 'Job recId is required.' });
        }

        const job = await GitHubPullRequestClassificationJobModel.findOne({ where: { recId } });
        if (!job) {
            return response.status(404).json({ message: 'Job not found.' });
        }

        const { page, pageSize, offset, limit } = this.getPagination(request);
        const [results, totalRepositories, completedRepositories] = await Promise.all([
            GitHubPullRequestClassificationResultModel.findAll({
                where: { jobId: job.id, deleted: false },
                order: [['createdAt', 'ASC']],
                offset,
                limit,
            }),
            GitHubPullRequestClassificationRepositoryModel.count({
                where: { jobId: job.id, deleted: false },
            }),
            GitHubPullRequestClassificationRepositoryModel.count({
                where: {
                    jobId: job.id,
                    deleted: false,
                    investigated: { [Op.is]: true },
                },
            }),
        ]);

        const percentage =
            totalRepositories === 0
                ? 0
                : Number(((completedRepositories / totalRepositories) * 100).toFixed(2));

        return response.status(200).json({
            job,
            progress: {
                total: totalRepositories,
                completed: completedRepositories,
                percentage,
            },
            pagination: { page, pageSize },
            results,
        });
    }

    public async getSonarqubeJobStatus(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        const recId = request.params?.recId?.toString();
        if (!recId) {
            return response.status(400).json({ message: 'Job recId is required.' });
        }

        const job = await GitHubPullRequestSonarqubeJobModel.findOne({ where: { recId } });
        if (!job) {
            return response.status(404).json({ message: 'Job not found.' });
        }

        const { page, pageSize, offset, limit } = this.getPagination(request);
        const [results, totalRepositories, completedRepositories] = await Promise.all([
            GitHubPullRequestSonarqubeResultModel.findAll({
                where: { jobId: job.id, deleted: false },
                order: [['createdAt', 'ASC']],
                offset,
                limit,
            }),
            GitHubPullRequestSonarqubeRepositoryModel.count({
                where: { jobId: job.id, deleted: false },
            }),
            GitHubPullRequestSonarqubeRepositoryModel.count({
                where: {
                    jobId: job.id,
                    deleted: false,
                    investigated: { [Op.is]: true },
                },
            }),
        ]);

        const percentage =
            totalRepositories === 0
                ? 0
                : Number(((completedRepositories / totalRepositories) * 100).toFixed(2));

        return response.status(200).json({
            job,
            progress: {
                total: totalRepositories,
                completed: completedRepositories,
                percentage,
            },
            pagination: { page, pageSize },
            results,
        });
    }

    public async listClassificationJobs(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        const { page, pageSize, offset, limit } = this.getPagination(request);
        const jobs = await GitHubPullRequestClassificationJobModel.findAll({
            where: { deleted: false },
            order: [['createdAt', 'DESC']],
            offset,
            limit,
        });

        return response.status(200).json({ jobs, pagination: { page, pageSize } });
    }

    public async listSonarqubeJobs(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        const { page, pageSize, offset, limit } = this.getPagination(request);
        const jobs = await GitHubPullRequestSonarqubeJobModel.findAll({
            where: { deleted: false },
            order: [['createdAt', 'DESC']],
            offset,
            limit,
        });

        return response.status(200).json({ jobs, pagination: { page, pageSize } });
    }

    public async softDeleteClassificationJob(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        const recId = request.params?.recId?.toString();
        if (!recId) {
            return response.status(400).json({ message: 'Job recId is required.' });
        }

        const job = await GitHubPullRequestClassificationJobModel.findOne({ where: { recId } });
        if (!job) {
            return response.status(404).json({ message: 'Job not found.' });
        }

        job.deleted = true;
        await job.save();
        await GitHubPullRequestClassificationResultModel.update(
            { deleted: true },
            { where: { jobId: job.id } }
        );

        return response.status(200).json({ message: 'Job marked as deleted.', job });
    }

    public async softDeleteSonarqubeJob(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        const recId = request.params?.recId?.toString();
        if (!recId) {
            return response.status(400).json({ message: 'Job recId is required.' });
        }

        const job = await GitHubPullRequestSonarqubeJobModel.findOne({ where: { recId } });
        if (!job) {
            return response.status(404).json({ message: 'Job not found.' });
        }

        job.deleted = true;
        await job.save();
        await GitHubPullRequestSonarqubeResultModel.update(
            { deleted: true },
            { where: { jobId: job.id } }
        );

        return response.status(200).json({ message: 'Job marked as deleted.', job });
    }

    public async getJobStatus(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        const recId = request.params?.recId?.toString();
        if (!recId) {
            return response.status(400).json({ message: 'Job recId is required.' });
        }

        const job = await GitHubPullRequestReportJobModel.findOne({ where: { recId } });
        if (!job) {
            return response.status(404).json({ message: 'Job not found.' });
        }

        const { page, pageSize, offset, limit } = this.getPagination(request);
        const [results, totalRepositories, completedRepositories] = await Promise.all([
            GitHubPullRequestReportResultModel.findAll({
                where: { jobId: job.id, deleted: false },
                order: [['createdAt', 'ASC']],
                offset,
                limit,
            }),
            GitHubPullRequestReportRepositoryModel.count({
                where: { jobId: job.id, deleted: false },
            }),
            GitHubPullRequestReportRepositoryModel.count({
                where: {
                    jobId: job.id,
                    deleted: false,
                    investigated: { [Op.is]: true },
                },
            }),
        ]);

        const percentage =
            totalRepositories === 0
                ? 0
                : Number(((completedRepositories / totalRepositories) * 100).toFixed(2));

        return response.status(200).json({
            job,
            progress: {
                total: totalRepositories,
                completed: completedRepositories,
                percentage,
            },
            pagination: { page, pageSize },
            results,
        });
    }

    public async listJobs(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        const { page, pageSize, offset, limit } = this.getPagination(request);
        const jobs = await GitHubPullRequestReportJobModel.findAll({
            where: { deleted: false },
            order: [['createdAt', 'DESC']],
            offset,
            limit,
        });

        return response.status(200).json({
            jobs,
            pagination: { page, pageSize },
        });
    }

    public async softDeleteJob(
        request: express.Request,
        response: express.Response
    ): Promise<express.Response> {
        const recId = request.params?.recId?.toString();
        if (!recId) {
            return response.status(400).json({ message: 'Job recId is required.' });
        }

        const job = await GitHubPullRequestReportJobModel.findOne({ where: { recId } });
        if (!job) {
            return response.status(404).json({ message: 'Job not found.' });
        }

        job.deleted = true;
        await job.save();
        await GitHubPullRequestReportResultModel.update(
            { deleted: true },
            { where: { jobId: job.id } }
        );

        return response.status(200).json({ message: 'Job marked as deleted.', job });
    }

    private parseUniqueStrings(values: unknown): string[] {
        const items = Array.isArray(values) ? values : [];
        return [...new Set(items.map((item) => item?.toString().trim()).filter(Boolean))];
    }

    private getEffectiveLabels(labels: string[]): string[] {
        return labels.length > 0 ? labels : ['security', 'vulnerability'];
    }

    private getPagination(request: express.Request): {
        page: number;
        pageSize: number;
        offset: number;
        limit: number;
    } {
        const page = Math.max(1, Number(request.query?.page ?? '1'));
        const pageSize = Math.max(1, Number(request.query?.pageSize ?? DEFAULT_PAGE_SIZE));
        const limit = Number.isNaN(pageSize) ? DEFAULT_PAGE_SIZE : pageSize;
        const offset = Number.isNaN(page) ? 0 : (page - 1) * limit;
        return { page, pageSize: limit, offset, limit };
    }
}
