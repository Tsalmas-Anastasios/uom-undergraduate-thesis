import fs from 'node:fs/promises';
import path from 'node:path';

import axios from 'axios';
import ExcelJS from 'exceljs';

import { GitHubPullRequestClassificationResultModel } from '../../db/models/github-pull-request-classification-result.sequelize.ts';
import { appPrompts } from '../../prompts/app.prompts.ts';
import {
    errorUtilities,
    gitHubHelperUtilities,
    promptTemplateUtilities,
} from '../../utils/index.utilities.ts';
import { githubApiService, openWebUIChatCompletionsService } from '../index.service.ts';
import { pullRequestsClassificationParserService } from './pull-requests-classification-parser.service.ts';

interface RepositoryRow {
    username: string;
    name: string;
    investigated?: boolean;
}

interface PullRequestItem {
    number?: number;
    title?: string;
    html_url?: string;
}

export class GitHubPullRequestsClassificationService {
    private readonly plainHttpClient = axios.create({
        timeout: 20_000,
        responseType: 'text',
        headers: {
            Accept: 'text/plain',
            'User-Agent': 'applied-informatics-uom-bachelor-thesis',
        },
    });

    async fetchRepositoriesWithRetry(usernames: string[]): Promise<RepositoryRow[]> {
        while (true) {
            try {
                return await githubApiService.repositories.fetch.getRepositoriesForUsers({
                    usernames,
                });
            } catch (error) {
                if (await errorUtilities.handleGitHubRateLimit(error)) {
                    continue;
                }

                throw error;
            }
        }
    }

    async classifyRepositoryPullRequests(parameters: {
        jobId: number;
        modelName: string;
        repository: RepositoryRow;
    }): Promise<number> {
        const maxPerRepoRaw = Number(
            process.env.GITHUB_PR_CLASSIFICATION_MAX_PRS_PER_REPO ?? '200'
        );
        const maxPerRepo = Number.isNaN(maxPerRepoRaw) ? 200 : maxPerRepoRaw;
        const owner = parameters.repository.username;
        const repo = parameters.repository.name;
        const repositoryUrl = gitHubHelperUtilities.getRepositoryUrl({ owner, repo });

        let page = 1;
        let processed = 0;
        while (processed < maxPerRepo) {
            const remaining = Math.max(1, Math.min(100, maxPerRepo - processed));
            const searchResponse = await this.searchPullRequestsWithRetry({
                username: owner,
                repositoryName: repo,
                allPullRequests: true,
                page,
                perPage: remaining,
            });

            const items = searchResponse?.items as PullRequestItem[] | undefined;
            if (!items || items.length === 0) {
                break;
            }

            for (const pullRequest of items) {
                if (processed >= maxPerRepo) {
                    break;
                }

                const pullRequestUrl = pullRequest.html_url || '';
                const pullRequestChanges = await this.fetchPullRequestChanges(pullRequestUrl);
                const userPrompt = promptTemplateUtilities.parseTemplate({
                    promptName: 'GITHUB_PR_JSON_CLASSIFIER_USER_TEMPLATE',
                    parameters: {
                        ['repo_url']: repositoryUrl,
                        ['pr_url']: pullRequestUrl,
                        ['pr_diff_content']: pullRequestChanges.diff,
                        ['pr_patch_content']: pullRequestChanges.patch,
                    },
                });

                const parsedResult = await (async () => {
                    try {
                        const completion = await openWebUIChatCompletionsService.complete({
                            model: parameters.modelName,
                            systemPrompt: appPrompts.GITHUB_PR_JSON_CLASSIFIER_SYSTEM_PROMPT,
                            userPrompt,
                            webSearch: false,
                        });

                        return pullRequestsClassificationParserService.parse(completion.text);
                    } catch (error) {
                        console.log('ERROR:', error);
                        return pullRequestsClassificationParserService.parse('');
                    }
                })();

                await GitHubPullRequestClassificationResultModel.create({
                    jobId: parameters.jobId,
                    username: owner,
                    repositoryName: repo,
                    repositoryUrl,
                    pullRequestUrl,
                    pullRequestTitle: pullRequest.title || '',
                    pullRequestNumber: pullRequest.number || 0,
                    category: parsedResult.category,
                    overallConfidence: parsedResult.percentage,
                    codeQualityAffected:
                        parsedResult.affectedCategories.codeQuality.affectedPercentage,
                    codeQualityConfidence: parsedResult.affectedCategories.codeQuality.percentage,
                    codeSecurityAffected:
                        parsedResult.affectedCategories.codeSecurity.affectedPercentage,
                    codeSecurityConfidence: parsedResult.affectedCategories.codeSecurity.percentage,
                    softwareQualityAffected:
                        parsedResult.affectedCategories.softwareQuality.affectedPercentage,
                    softwareQualityConfidence:
                        parsedResult.affectedCategories.softwareQuality.percentage,
                    softwareSecurityAffected:
                        parsedResult.affectedCategories.softwareSecurity.affectedPercentage,
                    softwareSecurityConfidence:
                        parsedResult.affectedCategories.softwareSecurity.percentage,
                    deleted: false,
                });

                processed += 1;
            }

            page += 1;
        }

        return processed;
    }

    private async fetchPullRequestChanges(pullRequestUrl: string): Promise<{
        diff: string;
        patch: string;
    }> {
        if (!pullRequestUrl) {
            return { diff: '', patch: '' };
        }

        const maxContentLengthRaw = Number(
            process.env.GITHUB_PR_CLASSIFICATION_DIFF_PATCH_MAX_CHARS ?? '120000'
        );
        const maxContentLength = Number.isNaN(maxContentLengthRaw)
            ? 500_000_000
            : maxContentLengthRaw;

        const [diffResponse, patchResponse] = await Promise.allSettled([
            this.plainHttpClient.get<string>(`${pullRequestUrl}.diff`),
            this.plainHttpClient.get<string>(`${pullRequestUrl}.patch`),
        ]);

        const diff =
            diffResponse.status === 'fulfilled'
                ? String(diffResponse.value.data || '').slice(0, maxContentLength)
                : '';
        const patch =
            patchResponse.status === 'fulfilled'
                ? String(patchResponse.value.data || '').slice(0, maxContentLength)
                : '';

        return { diff, patch };
    }

    async exportToExcel(parameters: { jobId: number }): Promise<string> {
        const rows = await GitHubPullRequestClassificationResultModel.findAll({
            where: { jobId: parameters.jobId, deleted: false },
            order: [['createdAt', 'ASC']],
        });

        if (rows.length === 0) {
            return '';
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('PR Classification');

        worksheet.columns = [
            { header: 'Username', key: 'username', width: 24 },
            { header: 'Repository Name', key: 'repositoryName', width: 28 },
            { header: 'Repository URL', key: 'repositoryUrl', width: 48 },
            { header: 'PR Number', key: 'pullRequestNumber', width: 14 },
            { header: 'PR Title', key: 'pullRequestTitle', width: 50 },
            { header: 'PR URL', key: 'pullRequestUrl', width: 50 },
            { header: 'Category', key: 'category', width: 26 },
            { header: 'overallConfidence', key: 'overallConfidence', width: 20 },
            { header: 'codeQualityAffected', key: 'codeQualityAffected', width: 20 },
            { header: 'codeQualityConfidence', key: 'codeQualityConfidence', width: 20 },
            { header: 'codeSecurityAffected', key: 'codeSecurityAffected', width: 20 },
            { header: 'codeSecurityConfidence', key: 'codeSecurityConfidence', width: 20 },
            { header: 'softwareQualityAffected', key: 'softwareQualityAffected', width: 22 },
            { header: 'softwareQualityConfidence', key: 'softwareQualityConfidence', width: 24 },
            { header: 'softwareSecurityAffected', key: 'softwareSecurityAffected', width: 24 },
            {
                header: 'softwareSecurityConfidence',
                key: 'softwareSecurityConfidence',
                width: 26,
            },
        ];

        worksheet.addRows(
            rows.map((row) => ({
                username: row.username,
                repositoryName: row.repositoryName,
                repositoryUrl: row.repositoryUrl,
                pullRequestNumber: row.pullRequestNumber,
                pullRequestTitle: row.pullRequestTitle,
                pullRequestUrl: row.pullRequestUrl,
                category: row.category.join(', '),
                overallConfidence: row.overallConfidence,
                codeQualityAffected: row.codeQualityAffected,
                codeQualityConfidence: row.codeQualityConfidence,
                codeSecurityAffected: row.codeSecurityAffected,
                codeSecurityConfidence: row.codeSecurityConfidence,
                softwareQualityAffected: row.softwareQualityAffected,
                softwareQualityConfidence: row.softwareQualityConfidence,
                softwareSecurityAffected: row.softwareSecurityAffected,
                softwareSecurityConfidence: row.softwareSecurityConfidence,
            }))
        );

        const exportDirectory = path.join(
            process.cwd(),
            'exports',
            'reports',
            'pull_request_classification'
        );
        await fs.mkdir(exportDirectory, { recursive: true });
        const filePath = path.join(exportDirectory, `pr_classification_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }

    private async searchPullRequestsWithRetry(parameters: {
        username: string;
        repositoryName: string;
        allPullRequests: boolean;
        page: number;
        perPage: number;
    }) {
        while (true) {
            try {
                return await githubApiService.pullRequests.fetch.search(parameters);
            } catch (error) {
                if (await errorUtilities.handleGitHubRateLimit(error)) {
                    continue;
                }

                return;
            }
        }
    }
}

export const gitHubPullRequestsClassificationService =
    new GitHubPullRequestsClassificationService();
