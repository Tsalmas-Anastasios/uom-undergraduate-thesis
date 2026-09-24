import { DataTypes, Model } from 'sequelize';

import type {
    GitHubPullRequestSonarqubeResult,
    GitHubPullRequestSonarqubeResultCreation,
} from '../../models/index.model.ts';
import { database } from '../../utils/index.utilities.ts';

export class GitHubPullRequestSonarqubeResultModel
    extends Model<GitHubPullRequestSonarqubeResult, GitHubPullRequestSonarqubeResultCreation>
    implements GitHubPullRequestSonarqubeResult
{
    declare public id: number;
    declare public recId: string;
    declare public jobId: number;
    declare public repositoryJobId: number;
    declare public classificationJobId: number;
    declare public username: string;
    declare public repositoryName: string;
    declare public repositoryUrl: string;
    declare public localClonePath: string | undefined;
    declare public pullRequestNumber: number;
    declare public pullRequestTitle: string;
    declare public pullRequestUrl: string;
    declare public pullRequestState: string;
    declare public pullRequestMerged: boolean;
    declare public baseBranchName: string | undefined;
    declare public headBranchName: string | undefined;
    declare public analysisRole: string;
    declare public commitHash: string;
    declare public commitSequence: number;
    declare public firstPullRequestCommitHash: string | undefined;
    declare public closingCommitHash: string | undefined;
    declare public sonarProjectKey: string;
    declare public sonarProjectName: string;
    declare public sonarDashboardUrl: string | undefined;
    declare public sonarTaskId: string | undefined;
    declare public sonarAnalysisId: string | undefined;
    declare public qualityGateStatus: string | undefined;
    declare public bugs: number;
    declare public vulnerabilities: number;
    declare public codeSmells: number;
    declare public securityHotspots: number;
    declare public coverage: number | undefined;
    declare public duplicatedLinesDensity: number | undefined;
    declare public ncloc: number;
    declare public complexity: number;
    declare public cognitiveComplexity: number;
    declare public softwareQualityReliabilityIssues: number;
    declare public softwareQualityMaintainabilityIssues: number;
    declare public softwareQualitySecurityIssues: number;
    declare public measuresJson: Record<string, unknown>;
    declare public issuesSummaryJson: Record<string, unknown>;
    declare public securityHotspotsSummaryJson: Record<string, unknown>;
    declare public qualityGateJson: Record<string, unknown>;
    declare public scannerContextJson: Record<string, unknown>;
    declare public deleted: boolean;
    declare public createdAt: string | Date;
    declare public updatedAt: string | Date;
}

GitHubPullRequestSonarqubeResultModel.init(
    {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        recId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
        },
        jobId: { type: DataTypes.INTEGER, allowNull: false },
        repositoryJobId: { type: DataTypes.INTEGER, allowNull: false },
        classificationJobId: { type: DataTypes.INTEGER, allowNull: false },
        username: { type: DataTypes.STRING(255), allowNull: false },
        repositoryName: { type: DataTypes.STRING(255), allowNull: false },
        repositoryUrl: { type: DataTypes.TEXT, allowNull: false },
        localClonePath: { type: DataTypes.TEXT, allowNull: true },
        pullRequestNumber: { type: DataTypes.INTEGER, allowNull: false },
        pullRequestTitle: { type: DataTypes.TEXT, allowNull: false },
        pullRequestUrl: { type: DataTypes.TEXT, allowNull: false },
        pullRequestState: { type: DataTypes.STRING(50), allowNull: false },
        pullRequestMerged: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        baseBranchName: { type: DataTypes.STRING(255), allowNull: true },
        headBranchName: { type: DataTypes.STRING(255), allowNull: true },
        analysisRole: { type: DataTypes.STRING(50), allowNull: false },
        commitHash: { type: DataTypes.STRING(255), allowNull: false },
        commitSequence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        firstPullRequestCommitHash: { type: DataTypes.STRING(255), allowNull: true },
        closingCommitHash: { type: DataTypes.STRING(255), allowNull: true },
        sonarProjectKey: { type: DataTypes.STRING(255), allowNull: false },
        sonarProjectName: { type: DataTypes.STRING(255), allowNull: false },
        sonarDashboardUrl: { type: DataTypes.TEXT, allowNull: true },
        sonarTaskId: { type: DataTypes.STRING(255), allowNull: true },
        sonarAnalysisId: { type: DataTypes.STRING(255), allowNull: true },
        qualityGateStatus: { type: DataTypes.STRING(100), allowNull: true },
        bugs: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        vulnerabilities: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        codeSmells: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        securityHotspots: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        coverage: { type: DataTypes.FLOAT, allowNull: true },
        duplicatedLinesDensity: { type: DataTypes.FLOAT, allowNull: true },
        ncloc: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        complexity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        cognitiveComplexity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        softwareQualityReliabilityIssues: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        softwareQualityMaintainabilityIssues: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        softwareQualitySecurityIssues: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        measuresJson: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        issuesSummaryJson: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        securityHotspotsSummaryJson: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        qualityGateJson: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        scannerContextJson: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize: database,
        tableName: 'github_pull_request_sonarqube_results',
        timestamps: true,
    }
);
