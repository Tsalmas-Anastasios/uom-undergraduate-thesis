import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('github_pull_request_classification_results', {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        recId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
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
        softwareSecurityConfidence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
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
    await queryInterface.dropTable('github_pull_request_classification_results');
}
