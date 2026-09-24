import { DataTypes, Model } from 'sequelize';

import type {
    GitHubPullRequestReportRepository,
    GitHubPullRequestReportRepositoryCreation,
} from '../../models/index.model.ts';
import { database } from '../../utils/index.utilities.ts';

export class GitHubPullRequestReportRepositoryModel
    extends Model<GitHubPullRequestReportRepository, GitHubPullRequestReportRepositoryCreation>
    implements GitHubPullRequestReportRepository
{
    declare public id: number;
    declare public recId: string;
    declare public jobId: number;
    declare public repositoryName: string;
    declare public username: string;
    declare public investigated: boolean;
    declare public deleted: boolean;
    declare public createdAt: string | Date;
    declare public updatedAt: string | Date;
}

GitHubPullRequestReportRepositoryModel.init(
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
        investigated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        tableName: 'github_pull_request_report_repositories',
        timestamps: true,
    }
);
