export interface GitHubGetPullRequestsFilters {
    username?: string;
    repositoryName?: string;
    label?: string[];
    allPullRequests?: boolean;
    page?: number;
    perPage?: number;
}
