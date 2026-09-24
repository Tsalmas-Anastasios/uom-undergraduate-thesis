import { DataTypes, Model } from 'sequelize';

import type {
    GitHubPullRequestClassificationJob,
    GitHubPullRequestClassificationJobCreation,
} from '../../models/index.model.ts';
import { database } from '../../utils/index.utilities.ts';

export class GitHubPullRequestClassificationJobModel
    extends Model<GitHubPullRequestClassificationJob, GitHubPullRequestClassificationJobCreation>
    implements GitHubPullRequestClassificationJob
{
    declare public id: number;
    declare public recId: string;
    declare public usernames: string[];
    declare public modelName: string;
    declare public completed: boolean;
    declare public deleted: boolean;
    declare public startedAt: string | Date | undefined;
    declare public completedAt: string | Date | undefined;
    declare public errorMessage: string | undefined;
    declare public reportFilePath: string | undefined;
    declare public createdAt: string | Date;
    declare public updatedAt: string | Date;
}

GitHubPullRequestClassificationJobModel.init(
    {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        recId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
        },
        usernames: { type: DataTypes.JSONB, allowNull: false },
        modelName: { type: DataTypes.STRING(255), allowNull: false },
        completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        startedAt: { type: DataTypes.DATE, allowNull: true },
        completedAt: { type: DataTypes.DATE, allowNull: true },
        errorMessage: { type: DataTypes.TEXT, allowNull: true },
        reportFilePath: { type: DataTypes.TEXT, allowNull: true },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize: database,
        tableName: 'github_pull_request_classification_jobs',
        timestamps: true,
    }
);
