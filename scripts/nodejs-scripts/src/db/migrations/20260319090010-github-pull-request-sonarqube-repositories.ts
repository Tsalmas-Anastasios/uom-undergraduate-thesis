import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('github_pull_request_sonarqube_repositories', {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        recId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
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
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: queryInterface.sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: queryInterface.sequelize.literal('CURRENT_TIMESTAMP'),
        },
    });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('github_pull_request_sonarqube_repositories');
}
