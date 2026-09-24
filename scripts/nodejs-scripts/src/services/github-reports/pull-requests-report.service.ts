import fs from 'node:fs/promises';
import path from 'node:path';

import ExcelJS from 'exceljs';

import { GitHub } from '../../models/index.model.ts';
import { errorUtilities, gitHubHelperUtilities } from '../../utils/index.utilities.ts';
import { githubApiService } from '../index.service.ts';

export interface RepositoriesDataResponse {
    repositoryName: string;
    username: string;
    repositoryUrl: string;
    pullRequests: {
        total: number;
        [key: string]: number;
    };
}

export class GitHubPullRequestsReportService {
    async runReport(parameters: {
        usernames: string[];
        effectiveLabels: string[];
    }): Promise<{ repositoriesData: RepositoriesDataResponse[]; excelFilePath: string }> {
        const repositories = await this.fetchRepositoriesWithRetry(parameters.usernames);

        if (repositories.length === 0) {
            return { repositoriesData: [], excelFilePath: '' };
        }

        const repositoriesData: RepositoriesDataResponse[] = [];
        for (const repository of repositories) {
            repositoriesData.push(
                await this.buildRepositoryData(repository, parameters.effectiveLabels)
            );
        }

        const excelFilePath = await this.exportToExcelWithRetry(
            parameters.effectiveLabels,
            repositoriesData
        );

        return { repositoriesData, excelFilePath };
    }

    async fetchRepositoriesWithRetry(
        usernames: string[]
    ): Promise<{ username: string; name: string }[]> {
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

    async buildRepositoryData(
        repositoryItem: { username: string; name: string },
        effectiveLabels: string[]
    ): Promise<RepositoriesDataResponse> {
        const repository: {
            owner: string;
            name: string;
        } = {
            owner: repositoryItem?.username || '',
            name: repositoryItem?.name || '',
        };

        const currentLabels = await this.fetchMatchingLabels(repository, effectiveLabels);
        const pullRequestsResults = await this.fetchPullRequestsResults(
            repository,
            effectiveLabels,
            currentLabels
        );

        const repositoryData: RepositoriesDataResponse = {
            repositoryName: repository.name,
            username: repository.owner,
            repositoryUrl: gitHubHelperUtilities.getRepositoryUrl({
                owner: repository.owner,
                repo: repository.name,
            }),
            pullRequests: pullRequestsResults,
        };

        return repositoryData;
    }

    async exportToExcelFromResults(
        labels: string[],
        repositoriesData: RepositoriesDataResponse[]
    ): Promise<string> {
        return this.exportToExcelWithRetry(labels, repositoriesData);
    }

    private async fetchMatchingLabels(
        repository: { owner: string; name: string },
        effectiveLabels: string[]
    ): Promise<string[]> {
        const currentLabels: string[] = [];
        let page = 1;
        while (true) {
            const temporaryLabels = await this.fetchLabelsPage(repository, page);
            if (!temporaryLabels) break;

            for (const label of temporaryLabels) {
                for (const requestLabel of effectiveLabels) {
                    if (label?.name?.toLowerCase()?.includes(requestLabel.toLowerCase())) {
                        currentLabels.push(label.name);
                        break;
                    }
                }
            }

            if (temporaryLabels.length === 0) break;
            page++;
        }

        return currentLabels;
    }

    private async fetchLabelsPage(
        repository: { owner: string; name: string },
        page: number
    ): Promise<GitHub.Model.Label[] | undefined> {
        while (true) {
            try {
                return await githubApiService.labels.fetch.list({
                    username: repository.owner,
                    repositoryName: repository.name,
                    page,
                });
            } catch (error) {
                if (await errorUtilities.handleGitHubRateLimit(error)) {
                    continue;
                }

                return undefined;
            }
        }
    }

    private async fetchPullRequestsResults(
        repository: { owner: string; name: string },
        effectiveLabels: string[],
        matchedLabels: string[]
    ): Promise<{ [key: string]: number; total: number }> {
        const searchPromises: Promise<GitHub.Model.SearchIssuesResponse>[] = [
            githubApiService.pullRequests.fetch.search({
                username: repository.owner,
                repositoryName: repository.name,
                allPullRequests: true,
            }),
        ];

        for (const label of effectiveLabels) {
            searchPromises.push(
                githubApiService.pullRequests.fetch.search({
                    username: repository.owner,
                    repositoryName: repository.name,
                    label: [label],
                    allPullRequests: true,
                })
            );
        }

        const promiseResults = await this.resolvePullRequestsSearch(searchPromises);
        const labelCount = await this.countPullRequestsForLabels(repository, matchedLabels);

        const pullRequestsResults: { [key: string]: number; total: number } = { total: 0 };
        pullRequestsResults.total = promiseResults?.[0]?.total_count || 0;
        pullRequestsResults.totalWithContainingSecurityWords = labelCount;

        if (promiseResults) {
            for (let index = 1; index < promiseResults.length; index++) {
                const label = effectiveLabels[index - 1];
                if (label !== undefined) {
                    pullRequestsResults[`with_label_${label}`] =
                        promiseResults[index]?.total_count || 0;
                }
            }
        }

        return pullRequestsResults;
    }

    private async resolvePullRequestsSearch(
        searchPromises: Promise<GitHub.Model.SearchIssuesResponse>[]
    ): Promise<GitHub.Model.SearchIssuesResponse[] | undefined> {
        while (true) {
            try {
                return await Promise.all(searchPromises);
            } catch (error) {
                if (await errorUtilities.handleGitHubRateLimit(error)) {
                    continue;
                }

                return undefined;
            }
        }
    }

    private async countPullRequestsForLabels(
        repository: { owner: string; name: string },
        labels: string[]
    ): Promise<number> {
        let labelCount = 0;
        for (const label of labels) {
            const searchResult = await this.searchPullRequests({
                username: repository.owner,
                repositoryName: repository.name,
                label: [label],
                allPullRequests: true,
            });
            labelCount += searchResult?.total_count ?? 0;
        }

        return labelCount;
    }

    private async searchPullRequests(
        parameters: GitHub.Filters.GitHubGetPullRequestsFilters
    ): Promise<GitHub.Model.SearchIssuesResponse | undefined> {
        while (true) {
            try {
                return await githubApiService.pullRequests.fetch.search(parameters);
            } catch (error) {
                if (await errorUtilities.handleGitHubRateLimit(error)) {
                    continue;
                }

                return undefined;
            }
        }
    }

    private async exportToExcelWithRetry(
        labels: string[],
        repositoriesData: RepositoriesDataResponse[]
    ): Promise<string> {
        while (true) {
            try {
                return await this.exportToExcel(labels, repositoriesData);
            } catch (error) {
                const errorMessage = errorUtilities.getErrorMessage(error);
                if (errorMessage) continue;
            }
        }
    }

    private async exportToExcel(
        labels: string[],
        repositoriesData: RepositoriesDataResponse[]
    ): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Pull Requests data');

        // generate columns here
        const excelColumns = [
            { header: 'Repository Name', key: 'repositoryName', width: 30 },
            { header: 'Username', key: 'username', width: 30 },
            { header: 'Repository URL', key: 'repositoryUrl', width: 50 },
            { header: 'Total Pull Requests', key: 'totalPullRequests', width: 20 },
            {
                header: 'Total Pull Requests that contains word "security" or "vulnerability"',
                key: 'totalWithContainingSecurityWords',
                width: 20,
            },
        ];
        for (const label of labels) {
            excelColumns.push({
                header: `Pull Requests with label: ${label}`,
                key: `with_label_${label}`,
                width: 25,
            });
        }
        worksheet.columns = excelColumns;

        // add data here
        const excelData = repositoriesData.map((repoData) => {
            const rowData: Record<string, string | number> = {
                repositoryName: repoData.repositoryName,
                username: repoData.username,
                repositoryUrl: repoData.repositoryUrl,
                totalPullRequests: repoData.pullRequests.total,
                totalWithContainingSecurityWords:
                    repoData.pullRequests.totalWithContainingSecurityWords?.toString() || '0',
            };
            for (const label of labels) {
                rowData[`with_label_${label}`] = repoData.pullRequests[`with_label_${label}`] || 0;
            }
            return rowData;
        });
        worksheet.addRows(excelData);

        const exportDirectory = path.join(process.cwd(), 'exports', 'reports', 'pull_requests');
        await fs.mkdir(exportDirectory, { recursive: true });
        const fileName = `pull_requests_data_${Date.now()}.xlsx`;
        const filePath = path.join(exportDirectory, fileName);
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }
}
