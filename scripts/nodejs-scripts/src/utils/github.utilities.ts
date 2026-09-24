import { appConfig } from '../config/index.config.ts';

class GitHubHelperUtilities {
    getRepositoryUrl(parameters: { owner: string; repo: string }): string {
        return appConfig.github.repositoryBaseUrl
            .replace('{owner}', parameters.owner)
            .replace('{repo}', parameters.repo);
    }
}

export const gitHubHelperUtilities = new GitHubHelperUtilities();
