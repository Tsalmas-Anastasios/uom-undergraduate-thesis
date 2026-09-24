import { DataTypes, Model } from 'sequelize';

import type {
    GitHubPullRequestReportJob,
    GitHubPullRequestReportJobCreation,
} from '../../models/index.model.ts';
import { database } from '../../utils/index.utilities.ts';

export class GitHubPullRequestReportJobModel
    extends Model<GitHubPullRequestReportJob, GitHubPullRequestReportJobCreation>
    implements GitHubPullRequestReportJob
{
    declare public id: number;
    declare public recId: string;
    declare public usernames: string[];
    declare public labelsRequested: string[];
    declare public effectiveLabels: string[];
    declare public completed: boolean;
    declare public deleted: boolean;
    declare public startedAt: string | Date | undefined;
    declare public completedAt: string | Date | undefined;
    declare public errorMessage: string | undefined;
    declare public reportFilePath: string | undefined;
    declare public createdAt: string | Date;
    declare public updatedAt: string | Date;
}

GitHubPullRequestReportJobModel.init(
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
        usernames: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        labelsRequested: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        effectiveLabels: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        startedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        reportFilePath: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize: database,
        tableName: 'github_pull_request_report_jobs',
        timestamps: true,
    }
);
