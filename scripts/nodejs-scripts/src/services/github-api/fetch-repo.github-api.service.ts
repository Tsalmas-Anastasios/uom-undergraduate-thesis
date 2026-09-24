import type { GitHub } from '../../models/index.model.ts';
import { generalUtilities, httpClient } from '../../utils/index.utilities.ts';

export class FetchRepoGithubApiService {
    async getRepositories(parameters: {
        username: string;
        perPage?: number;
        page?: number;
    }): Promise<GitHub.Model.Repository[]> {
        let pageInserted = true;
        if (!parameters?.page) {
            parameters.page = 1;
            pageInserted = false;
        }
        if (!parameters?.perPage) parameters.perPage = 100;

        const repositories: GitHub.Model.Repository[] = [];
        while (true) {
            const response = await httpClient.github.client.get<GitHub.Model.Repository[]>(
                `/users/${parameters.username}/repos?per_page=${parameters.perPage}&page=${parameters.page}`
            );

            if (response?.status && response.status !== 403) {
                const remaining = response.headers['x-ratelimit-remaining'];
                const reset = response.headers['x-ratelimit-reset'];
                if (remaining === '0' && reset) {
                    const waitMs = Math.max(0, Number(reset) * 1000 - Date.now());
                    await generalUtilities.sleep(Math.min(waitMs, 30_000));
                    continue;
                }
            }

            const fetchedRepositories = response.data;
            if (!Array.isArray(fetchedRepositories) || fetchedRepositories.length === 0) break;

            repositories.push(...fetchedRepositories);

            if (pageInserted || fetchedRepositories.length < parameters.perPage) break;

            parameters.page++;
        }

        return repositories;
    }

    async getRepository(parameters: {
        username: string;
        repositoryName: string;
    }): Promise<GitHub.Model.Repository> {
        const response = await httpClient.github.client.get<GitHub.Model.Repository>(
            `/repos/${parameters.username}/${parameters.repositoryName}`
        );

        return response.data;
    }

    async getRepositoriesForUsers(parameters: {
        usernames: string[];
    }): Promise<{ username: string; name: string }[]> {
        const repositories: { username: string; name: string }[] = [];

        for (const username of parameters.usernames) {
            const userRepositories = await this.getRepositories({ username });
            for (const repository of userRepositories) {
                repositories.push({
                    username: repository.owner?.login ?? username,
                    name: repository.name,
                });
            }
        }

        return repositories;
    }
}
