import express from 'express';

import { IndexController } from '../controllers/index.controller.ts';
import type { RoutesDefinition } from '../interfaces/routes-definition.interface.ts';

export class IndexRoutes implements RoutesDefinition {
    #app: express.Application;
    #controller: IndexController;

    constructor(app: express.Application) {
        this.#app = app;
        this.#controller = new IndexController();
    }

    public createRoutes(): void {
        this.#app.route('/').get(this.#controller.index.bind(this.#controller));
    }
}
