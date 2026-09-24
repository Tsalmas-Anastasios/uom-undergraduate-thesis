import { DataTypes, Model } from 'sequelize';

import type {
    GitHubPullRequestSonarqubeRepository,
    GitHubPullRequestSonarqubeRepositoryCreation,
} from '../../models/index.model.ts';
import { database } from '../../utils/index.utilities.ts';

export class GitHubPullRequestSonarqubeRepositoryModel
    extends Model<
        GitHubPullRequestSonarqubeRepository,
        GitHubPullRequestSonarqubeRepositoryCreation
    >
    implements GitHubPullRequestSonarqubeRepository
{
    declare public id: number;
    declare public recId: string;
    declare public jobId: number;
    declare public sourceClassificationJobId: number;
    declare public sourceClassificationRepositoryId: number | undefined;
    declare public username: string;
    declare public repositoryName: string;
    declare public repositoryUrl: string;
    declare public localClonePath: string | undefined;
    declare public defaultBranch: string | undefined;
    declare public investigated: boolean;
    declare public deleted: boolean;
    declare public createdAt: string | Date;
    declare public updatedAt: string | Date;
}

GitHubPullRequestSonarqubeRepositoryModel.init(
    {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        recId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
        },
        jobId: { type: DataTypes.INTEGER, allowNull: false },
        sourceClassificationJobId: { type: DataTypes.INTEGER, allowNull: false },
        sourceClassificationRepositoryId: { type: DataTypes.INTEGER, allowNull: true },
        username: { type: DataTypes.STRING(255), allowNull: false },
        repositoryName: { type: DataTypes.STRING(255), allowNull: false },
        repositoryUrl: { type: DataTypes.TEXT, allowNull: false },
        localClonePath: { type: DataTypes.TEXT, allowNull: true },
        defaultBranch: { type: DataTypes.STRING(255), allowNull: true },
        investigated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize: database,
        tableName: 'github_pull_request_sonarqube_repositories',
        timestamps: true,
    }
);
