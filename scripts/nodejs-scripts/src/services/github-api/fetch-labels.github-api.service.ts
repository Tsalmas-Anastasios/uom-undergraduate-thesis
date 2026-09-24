import type { GitHub } from '../../models/index.model.ts';
import { httpClient } from '../../utils/index.utilities.ts';

export class FetchLabelsGithubApiService {
    async list(filters: {
        username: string;
        repositoryName: string;
        page?: number;
    }): Promise<GitHub.Model.Label[]> {
        const response = await httpClient.github.client.get<GitHub.Model.Label[]>(
            `/repos/${filters.username}/${filters.repositoryName}/labels?per_page=100&page=${filters.page || 1}`
        );

        return response.data;
    }
}
