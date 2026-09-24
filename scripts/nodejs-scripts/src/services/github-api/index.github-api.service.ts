import { FetchLabelsGithubApiService } from './fetch-labels.github-api.service.ts';
import { FetchPullRequestsGithubApiService } from './fetch-pr.github-api.service.ts';
import { FetchRepoGithubApiService } from './fetch-repo.github-api.service.ts';

export class GithubApiService {
    public pullRequests: {
        fetch: FetchPullRequestsGithubApiService;
    };
    public repositories: {
        fetch: FetchRepoGithubApiService;
    };
    public labels: {
        fetch: FetchLabelsGithubApiService;
    };

    constructor() {
        this.pullRequests = {
            fetch: new FetchPullRequestsGithubApiService(),
        };
        this.repositories = {
            fetch: new FetchRepoGithubApiService(),
        };
        this.labels = {
            fetch: new FetchLabelsGithubApiService(),
        };
    }
}

export const githubApiService = new GithubApiService();
