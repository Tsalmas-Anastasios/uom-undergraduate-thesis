import express from 'express';

import { GitHubRepositoriesController } from '../../controllers/github/repositories.controller.ts';
import { RoutesDefinition } from '../../interfaces/routes-definition.interface.ts';

export class GitHubRepositoriesRoutes implements RoutesDefinition {
    #app: express.Application;
    #controller: GitHubRepositoriesController;
    constructor(app: express.Application) {
        this.#app = app;
        this.#controller = new GitHubRepositoriesController();
    }

    public createRoutes(): void {
        this.#app
            .route('/github/repositories')
            .get(this.#controller.getRepositories.bind(this.#controller));
    }
}
