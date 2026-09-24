import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('github_pull_request_classification_jobs', {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        recId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
        },
        usernames: { type: DataTypes.JSONB, allowNull: false },
        modelName: { type: DataTypes.STRING(255), allowNull: false },
        completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        startedAt: { type: DataTypes.DATE, allowNull: true },
        completedAt: { type: DataTypes.DATE, allowNull: true },
        errorMessage: { type: DataTypes.TEXT, allowNull: true },
        reportFilePath: { type: DataTypes.TEXT, allowNull: true },
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
    await queryInterface.dropTable('github_pull_request_classification_jobs');
}
