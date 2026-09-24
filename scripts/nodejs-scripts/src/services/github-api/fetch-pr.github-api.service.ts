import type { GitHub } from '../../models/index.model.ts';
import { httpClient } from '../../utils/index.utilities.ts';

export interface GitHubPullRequestDetailsResponse {
    number: number;
    title: string;
    html_url: string;
    state: string;
    merged: boolean;
    merge_commit_sha?: string;
    base?: {
        ref?: string;
        sha?: string;
    };
    head?: {
        ref?: string;
        sha?: string;
    };
}

export interface GitHubPullRequestCommitItem {
    sha: string;
    parents?: { sha: string }[];
}

export interface GitHubPullRequestListItem {
    number: number;
}

export interface GitHubPullRequestFileModel {
    sha: string;
    filename: string;
    status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | string;
    additions: number;
    deletions: number;
    changes: number;
    blob_url?: string;
    raw_url?: string;
    contents_url?: string;
    patch?: string;
    previous_filename?: string;
}

export class FetchPullRequestsGithubApiService {
    async search(
        filters: GitHub.Filters.GitHubGetPullRequestsFilters
    ): Promise<GitHub.Model.SearchIssuesResponse> {
        const filtersString = this.getFiltersString(filters);
        const response = await httpClient.github.client.get<GitHub.Model.SearchIssuesResponse>(
            `/search/issues?q=${filtersString}&page=${filters.page ?? 1}&per_page=${filters.perPage ?? 30}`
        );

        return response.data;
    }

    async getDetails(parameters: {
        username: string;
        repositoryName: string;
        pullRequestNumber: number;
    }): Promise<GitHubPullRequestDetailsResponse> {
        const response = await httpClient.github.client.get<GitHubPullRequestDetailsResponse>(
            `/repos/${parameters.username}/${parameters.repositoryName}/pulls/${parameters.pullRequestNumber}`
        );

        return response.data;
    }

    public async getFiles(parameters: {
        username: string;
        repositoryName: string;
        pullRequestNumber: number;
    }): Promise<GitHubPullRequestFileModel[]> {
        console.log(
            '[GitHubApiService][pullRequests.fetch.getFiles] Starting with parameters:',
            parameters
        );

        const token = process.env.GITHUB_API__TOKEN?.trim();

        if (!token) {
            throw new Error('GITHUB_API__TOKEN is required to fetch pull request files.');
        }

        const results: GitHubPullRequestFileModel[] = [];
        let page = 1;

        while (true) {
            console.log('[GitHubApiService][pullRequests.fetch.getFiles] Fetching page:', page);

            const response = await fetch(
                `https://api.github.com/repos/${encodeURIComponent(parameters.username)}/${encodeURIComponent(parameters.repositoryName)}/pulls/${parameters.pullRequestNumber}/files?per_page=100&page=${page}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/vnd.github+json',
                        Authorization: `Bearer ${token}`,
                        'X-GitHub-Api-Version': '2022-11-28',
                    },
                }
            );

            if (!response.ok) {
                const body = await response.text();
                throw new Error(
                    `GitHub pull request files request failed with status ${response.status}. Body: ${body}`
                );
            }

            const pageItems = (await response.json()) as GitHubPullRequestFileModel[];

            console.log('[GitHubApiService][pullRequests.fetch.getFiles] Page fetched:', {
                page,
                count: pageItems.length,
            });

            results.push(...pageItems);

            if (pageItems.length < 100) {
                break;
            }

            page += 1;
        }

        console.log(
            '[GitHubApiService][pullRequests.fetch.getFiles] Completed. Files fetched:',
            results.length
        );

        return results;
    }

    async getCommits(parameters: {
        username: string;
        repositoryName: string;
        pullRequestNumber: number;
    }): Promise<GitHubPullRequestCommitItem[]> {
        const commits: GitHubPullRequestCommitItem[] = [];
        let page = 1;

        while (true) {
            const response = await httpClient.github.client.get<GitHubPullRequestCommitItem[]>(
                `/repos/${parameters.username}/${parameters.repositoryName}/pulls/${parameters.pullRequestNumber}/commits?per_page=100&page=${page}`
            );

            const items = Array.isArray(response.data) ? response.data : [];
            if (items.length === 0) {
                break;
            }

            commits.push(...items);
            if (items.length < 100) {
                break;
            }

            page += 1;
        }

        return commits;
    }

    async listForRepository(parameters: {
        username: string;
        repositoryName: string;
        page: number;
        perPage: number;
    }): Promise<GitHubPullRequestListItem[]> {
        const response = await httpClient.github.client.get<GitHubPullRequestListItem[]>(
            `/repos/${parameters.username}/${parameters.repositoryName}/pulls?state=all&sort=created&direction=desc&per_page=${parameters.perPage}&page=${parameters.page}`
        );

        return Array.isArray(response.data) ? response.data : [];
    }

    getFiltersString(filters: GitHub.Filters.GitHubGetPullRequestsFilters): string {
        const qualifiers: string[] = ['is:pr'];

        if (!filters?.allPullRequests) qualifiers.push('state:open');

        if (filters?.username && filters?.repositoryName)
            qualifiers.push(`repo:${filters.username}/${filters.repositoryName}`);
        else if (filters?.username) qualifiers.push(`user:${filters.username}`);

        if (filters?.label && filters.label.length > 0) {
            for (const label of filters.label) {
                qualifiers.push(`label:"${label}"`);
            }
        }

        return qualifiers.join('+');
    }
}
