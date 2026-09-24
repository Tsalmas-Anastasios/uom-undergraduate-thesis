import { AxiosConfig } from './axios.config.ts';
import { DatabaseConfig } from './database.config.ts';

export class AppConfig {
    public readonly database: DatabaseConfig;
    public readonly apis: {
        external: {
            github: AxiosConfig;
            openwebui: {
                core: AxiosConfig;
            };
        };
    };

    public readonly github: {
        repositoryBaseUrl: string;
    };

    constructor() {
        this.database = new DatabaseConfig();
        this.apis = {
            external: {
                github: new AxiosConfig({
                    baseUrl: process.env.GITHUB_API__URL || '',
                    timeout: Number(process.env.GITHUB_API__TIMEOUT) || 5000,
                    authorizationToken: process.env.GITHUB_API__TOKEN || '',
                }),
                openwebui: {
                    core: new AxiosConfig({
                        baseUrl: process.env.OPENWEBUI__CORE_API__URL || '',
                        timeout: Number(process.env.OPENWEBUI__CORE_API__TIMEOUT) || 500_000_000,
                        authorizationToken: process.env.OPENWEBUI__CORE_API__TOKEN || '',
                    }),
                },
            },
        };

        this.github = {
            repositoryBaseUrl: 'https://github.com/{owner}/{repo}',
        };
    }
}

export const appConfig = new AppConfig();
