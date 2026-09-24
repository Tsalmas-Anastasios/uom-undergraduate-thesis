import { inspect } from 'node:util';

import { Sequelize } from 'sequelize';

import { appConfig } from '../config/index.config.ts';

export const database: Sequelize = new Sequelize({
    dialect: 'postgres',
    host: appConfig.database.host,
    port: appConfig.database.port,
    database: appConfig.database.database,
    username: appConfig.database.username,
    password: appConfig.database.password,
    // logging: appConfig.database.logging,
});

export async function assertDatabaseConnection(): Promise<void> {
    try {
        await database.authenticate();
    } catch (error) {
        const inspected =
            error instanceof Error
                ? error.message || inspect(error, { depth: 5, showHidden: true })
                : inspect(error, { depth: 5, showHidden: true });
        const message = inspected || 'Unknown database connection error';
        console.error('Unable to connect to the database:', message);
        throw new Error(message);
    }
}
