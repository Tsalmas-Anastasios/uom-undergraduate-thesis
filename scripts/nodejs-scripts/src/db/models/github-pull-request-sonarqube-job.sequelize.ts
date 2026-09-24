import { DataTypes, Model } from 'sequelize';

import type {
    GitHubPullRequestSonarqubeJob,
    GitHubPullRequestSonarqubeJobCreation,
} from '../../models/index.model.ts';
import { database } from '../../utils/index.utilities.ts';

export class GitHubPullRequestSonarqubeJobModel
    extends Model<GitHubPullRequestSonarqubeJob, GitHubPullRequestSonarqubeJobCreation>
    implements GitHubPullRequestSonarqubeJob
{
    declare public id: number;
    declare public recId: string;
    declare public classificationJobId: number;
    declare public onlyMerged: boolean;
    declare public includeClosedUnmerged: boolean;
    declare public maxPullRequestsPerRepository: number | undefined;
    declare public cloneRootPath: string | undefined;
    declare public completed: boolean;
    declare public deleted: boolean;
    declare public startedAt: string | Date | undefined;
    declare public completedAt: string | Date | undefined;
    declare public errorMessage: string | undefined;
    declare public createdAt: string | Date;
    declare public updatedAt: string | Date;
}

GitHubPullRequestSonarqubeJobModel.init(
    {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        recId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
        },
        classificationJobId: { type: DataTypes.INTEGER, allowNull: false },
        onlyMerged: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        includeClosedUnmerged: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        maxPullRequestsPerRepository: { type: DataTypes.INTEGER, allowNull: true },
        cloneRootPath: { type: DataTypes.TEXT, allowNull: true },
        completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        startedAt: { type: DataTypes.DATE, allowNull: true },
        completedAt: { type: DataTypes.DATE, allowNull: true },
        errorMessage: { type: DataTypes.TEXT, allowNull: true },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize: database,
        tableName: 'github_pull_request_sonarqube_jobs',
        timestamps: true,
    }
);
