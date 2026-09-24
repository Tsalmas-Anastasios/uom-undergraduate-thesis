import dotenv from 'dotenv';
// load env variables
dotenv.config();

export class DatabaseConfig {
    public readonly dialect: string;
    // public readonly logging: false,
    public readonly migrationStorage: string;
    public readonly migrationStorageTableName: string;
    public readonly seederStorage: string;
    public readonly seederStorageTableName: string;
    public readonly host: string;
    public readonly port: number;
    public readonly username: string;
    public readonly password: string;
    public readonly database: string;

    constructor() {
        this.dialect = process.env.DB_DIALECT || 'postgres';
        this.migrationStorage = process.env.DB_MIGRATION_STORAGE || 'sequelize';
        this.migrationStorageTableName =
            process.env.DB_MIGRATION_STORAGE_TABLE_NAME || 'sequelize_migrations';
        this.seederStorage = process.env.DB_SEEDER_STORAGE || 'sequelize';
        this.seederStorageTableName =
            process.env.DB_SEEDER_STORAGE_TABLE_NAME || 'sequelize_seeders';
        this.host = process.env.POSTGRES_HOST || 'localhost';
        this.port = Number(process.env.POSTGRES_PORT) || 5432;
        this.username = process.env.POSTGRES_USER || 'chirp_app_user';
        this.password = process.env.POSTGRES_PASSWORD || 'password';
        this.database = process.env.POSTGRES_DB || 'chirp_app_db_dev';
    }
}

export default new DatabaseConfig();
