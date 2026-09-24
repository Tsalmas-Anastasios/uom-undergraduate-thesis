import { DataTypes, Model } from 'sequelize';

import type {
    GitHubPullRequestClassificationResult,
    GitHubPullRequestClassificationResultCreation,
} from '../../models/index.model.ts';
import { database } from '../../utils/index.utilities.ts';

export class GitHubPullRequestClassificationResultModel
    extends Model<
        GitHubPullRequestClassificationResult,
        GitHubPullRequestClassificationResultCreation
    >
    implements GitHubPullRequestClassificationResult
{
    declare public id: number;
    declare public recId: string;
    declare public jobId: number;
    declare public username: string;
    declare public repositoryName: string;
    declare public repositoryUrl: string;
    declare public pullRequestUrl: string;
    declare public pullRequestTitle: string;
    declare public pullRequestNumber: number;
    declare public category: string[];
    declare public overallConfidence: number;
    declare public codeQualityAffected: number;
    declare public codeQualityConfidence: number;
    declare public codeSecurityAffected: number;
    declare public codeSecurityConfidence: number;
    declare public softwareQualityAffected: number;
    declare public softwareQualityConfidence: number;
    declare public softwareSecurityAffected: number;
    declare public softwareSecurityConfidence: number;
    declare public deleted: boolean;
    declare public createdAt: string | Date;
    declare public updatedAt: string | Date;
}

GitHubPullRequestClassificationResultModel.init(
    {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        recId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
        },
        jobId: { type: DataTypes.INTEGER, allowNull: false },
        username: { type: DataTypes.STRING(255), allowNull: false },
        repositoryName: { type: DataTypes.STRING(255), allowNull: false },
        repositoryUrl: { type: DataTypes.TEXT, allowNull: false },
        pullRequestUrl: { type: DataTypes.TEXT, allowNull: false },
        pullRequestTitle: { type: DataTypes.TEXT, allowNull: false },
        pullRequestNumber: { type: DataTypes.INTEGER, allowNull: false },
        category: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
        overallConfidence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        codeQualityAffected: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        codeQualityConfidence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        codeSecurityAffected: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        codeSecurityConfidence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        softwareQualityAffected: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        softwareQualityConfidence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        softwareSecurityAffected: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        softwareSecurityConfidence: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize: database,
        tableName: 'github_pull_request_classification_results',
        timestamps: true,
    }
);
