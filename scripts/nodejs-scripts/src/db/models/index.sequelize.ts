import { AccountModel } from './account.sequelize.ts';
import { GitHubPullRequestClassificationJobModel } from './github-pull-request-classification-job.sequelize.ts';
import { GitHubPullRequestClassificationRepositoryModel } from './github-pull-request-classification-repository.sequelize.ts';
import { GitHubPullRequestClassificationResultModel } from './github-pull-request-classification-result.sequelize.ts';
import { GitHubPullRequestReportJobModel } from './github-pull-request-report-job.sequelize.ts';
import { GitHubPullRequestReportRepositoryModel } from './github-pull-request-report-repository.sequelize.ts';
import { GitHubPullRequestReportResultModel } from './github-pull-request-report-result.sequelize.ts';
import { GitHubPullRequestSonarqubeJobModel } from './github-pull-request-sonarqube-job.sequelize.ts';
import { GitHubPullRequestSonarqubeRepositoryModel } from './github-pull-request-sonarqube-repository.sequelize.ts';
import { GitHubPullRequestSonarqubeResultModel } from './github-pull-request-sonarqube-result.sequelize.ts';

export const sequelizeModels = {
    AccountModel,
    GitHubPullRequestClassificationJobModel,
    GitHubPullRequestClassificationRepositoryModel,
    GitHubPullRequestClassificationResultModel,
    GitHubPullRequestReportJobModel,
    GitHubPullRequestReportRepositoryModel,
    GitHubPullRequestReportResultModel,
    GitHubPullRequestSonarqubeJobModel,
    GitHubPullRequestSonarqubeRepositoryModel,
    GitHubPullRequestSonarqubeResultModel,
};
