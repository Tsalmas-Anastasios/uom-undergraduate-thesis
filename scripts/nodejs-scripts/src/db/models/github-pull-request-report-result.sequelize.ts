import { DataTypes, Model } from 'sequelize';

import type {
    GitHubPullRequestReportResult,
    GitHubPullRequestReportResultCreation,
} from '../../models/index.model.ts';
import { database } from '../../utils/index.utilities.ts';

export class GitHubPullRequestReportResultModel
    extends Model<GitHubPullRequestReportResult, GitHubPullRequestReportResultCreation>
    implements GitHubPullRequestReportResult
{
    declare public id: number;
    declare public recId: string;
    declare public jobId: number;
    declare public repositoryName: string;
    declare public username: string;
    declare public repositoryUrl: string;
    declare public pullRequests: {
        total: number;
        [key: string]: number;
    };
    declare public deleted: boolean;
    declare public createdAt: string | Date;
    declare public updatedAt: string | Date;
}

GitHubPullRequestReportResultModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        recId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
        },
        jobId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        repositoryName: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        username: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        repositoryUrl: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        pullRequests: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize: database,
        tableName: 'github_pull_request_report_results',
        timestamps: true,
    }
);
