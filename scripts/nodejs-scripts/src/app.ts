import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspect } from 'node:util';

import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import expressSession from 'express-session';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

import { appConfig } from './config/index.config.ts';
import { GitHubPullRequestsClassificationJobRunner } from './jobs/github-pull-requests-classification.job.ts';
import { GitHubPullRequestsReportJobRunner } from './jobs/github-pull-requests-report.job.ts';
import { GitHubPullRequestsSonarqubeJobRunner } from './jobs/github-pull-requests-sonarqube.job.ts';
import type { Account } from './models/index.model.ts';
// routes --- START
import { GitHubPullRequestsRoutes } from './routes/github/pull-requests.routes.ts';
import { GitHubRepositoriesRoutes } from './routes/github/repositories.routes.ts';
import { IndexRoutes } from './routes/index.routes.ts';
import { assertDatabaseConnection } from './utils/database.utilities.ts';
// routes --- END

// load env variables
dotenv.config();

const appDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

const logStartupError = (error: unknown, origin: string): void => {
    if (error instanceof Error) {
        console.error(`[${origin}]`, error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        return;
    }

    console.error(`[${origin}]`, inspect(error, { depth: 5, showHidden: true }));
};

// declare the session schema
declare module 'express-session' {
    export interface SessionData {
        accountId: string;
        account: Account;
        createdAt: string | Date;
    }
}

class App {
    #app: express.Application;
    #jobRunner: GitHubPullRequestsReportJobRunner;
    #classificationJobRunner: GitHubPullRequestsClassificationJobRunner;
    #sonarqubeJobRunner: GitHubPullRequestsSonarqubeJobRunner;
    #shouldUseDatabase: boolean;

    constructor() {
        this.#app = express();
        this.#app.set('PORT', process.env.SERVER_PORT || 8080);
        this.#jobRunner = new GitHubPullRequestsReportJobRunner();
        this.#classificationJobRunner = new GitHubPullRequestsClassificationJobRunner();
        this.#sonarqubeJobRunner = new GitHubPullRequestsSonarqubeJobRunner();
        this.#shouldUseDatabase = process.env.DB_ASSERT_ON_STARTUP !== 'false';
    }

    async config(): Promise<void> {
        await import('./db/models/index.sequelize.ts');

        this.#app.use(express.json({ limit: '32mb' })); // support application/json type post data
        this.#app.use(express.urlencoded({ extended: false, limit: '32mb' })); // support application/x-www-form-urlencoded post data

        const sessionOptions: expressSession.SessionOptions = {
            name: 'chirp.sid',
            secret: process.env.SESSION_SECRET || 'supersecret',
            resave: true,
            cookie: {
                httpOnly: true,
                secure: true,
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                sameSite: 'none',
                priority: 'high',
            },
            saveUninitialized: false,
            genid: (_request: express.Request) => uuidv4(),
        };

        if (this.#shouldUseDatabase) {
            sessionOptions.store = new (connectPgSimple(expressSession))({
                pool: new pg.Pool({
                    host: appConfig.database.host,
                    user: appConfig.database.username,
                    database: appConfig.database.database,
                    password: appConfig.database.password,
                    port: appConfig.database.port,
                    keepAlive: true,
                    max: 10,
                    idleTimeoutMillis: 30_000,
                    connectionTimeoutMillis: 2000,
                    maxLifetimeSeconds: 60,
                }),
                schemaName: 'public',
                tableName: 'user_sessions',
                createTableIfMissing: true,
            });
        }

        this.#app.use(expressSession(sessionOptions));

        this.#app.use(
            cors({
                origin: [
                    'http://localhost:3000',
                    'https://localhost:3000',
                    'https://127.0.0.1:3000',
                ],
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                credentials: true,
                allowedHeaders: [
                    'Content-Type',
                    'Authorization',
                    'Accept',
                    'X-Content-Type-Options',
                ],
            })
        );

        this.#app.use(
            '/filestorage',
            express.static(path.join(appDirectoryPath, '../static/filestorage'), {
                fallthrough: false,
            })
        );

        this.#app.use(
            (_request: express.Request, response: express.Response, next: express.NextFunction) => {
                response.setHeader(
                    'Access-Control-Allow-Headers',
                    'Origin, X-Requested-With, Authorization, Content-Type, X-Content-Type-Options'
                );

                next();
            }
        );

        if (this.#shouldUseDatabase) {
            await assertDatabaseConnection();
        }

        // run the server here (local https)
        const httpsServer = https.createServer(
            {
                key: fs.readFileSync(path.join(appDirectoryPath, 'config/certs', 'server.key')),
                cert: fs.readFileSync(path.join(appDirectoryPath, 'config/certs', 'server.cert')),
            },
            this.#app
        );

        httpsServer.listen(this.#app.get('PORT'), () => {
            console.error(`Server running on port ${this.#app.get('PORT')}`);
            if (this.#shouldUseDatabase) {
                this.#jobRunner.start();
                this.#classificationJobRunner.start();
                this.#sonarqubeJobRunner.start();
            }
        });
    }

    routes(): void {
        new IndexRoutes(this.#app).createRoutes();
        new GitHubPullRequestsRoutes(this.#app).createRoutes();
        new GitHubRepositoriesRoutes(this.#app).createRoutes();
    }
}

const app = new App();
try {
    await app.config();
    app.routes();
} catch (error) {
    logStartupError(error, 'startup');
    throw error;
}
