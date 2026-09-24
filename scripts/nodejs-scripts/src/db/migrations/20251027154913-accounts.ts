import { DataTypes, QueryInterface } from 'sequelize';

import { AccountTypeEnum } from '../../enums/index.enum.ts';

export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('accounts', {
        accountId: {
            type: DataTypes.UUID,
            defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
            allowNull: false,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        profileImageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        accountType: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: AccountTypeEnum.TWIPPER,
            validate: {
                isIn: [[AccountTypeEnum.TWIPPER, AccountTypeEnum.CHIRPER]],
            },
        },
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
    await queryInterface.dropTable('accounts');
}
