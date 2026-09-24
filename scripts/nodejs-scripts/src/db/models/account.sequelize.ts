import { DataTypes, Model } from 'sequelize';

import { AccountTypeEnum } from '../../enums/account-type.enum.ts';
import type { Account } from '../../models/index.model.ts';
import type { AccountType } from '../../types/index.type.ts';
import { database } from '../../utils/index.utilities.ts';

export class AccountModel extends Model<Account> implements Account {
    declare public accountId: string;
    declare public username: string;
    declare public email: string;
    declare public password: string;
    declare public firstName: string;
    declare public lastName: string;
    declare public profileImageUrl?: string;
    declare public accountType: AccountType;
    declare public createdAt: string | Date;
    declare public updatedAt: string | Date;
}

AccountModel.init(
    {
        accountId: { type: DataTypes.UUID, primaryKey: true, autoIncrement: true },
        username: { type: DataTypes.STRING, allowNull: false, unique: true },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        profileImageUrl: { type: DataTypes.STRING, allowNull: true },
        accountType: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: AccountTypeEnum.TWIPPER,
            validate: {
                isIn: [[AccountTypeEnum.TWIPPER, AccountTypeEnum.CHIRPER]],
            },
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize: database,
        tableName: 'accounts',
        timestamps: true,
    }
);
