import express from 'express';

import { GitHubPullRequestsController } from '../../controllers/github/pull-requests.controller.ts';
import { RoutesDefinition } from '../../interfaces/routes-definition.interface.ts';

export class GitHubPullRequestsRoutes implements RoutesDefinition {
    #app: express.Application;
    #controller: GitHubPullRequestsController;
    constructor(app: express.Application) {
        this.#app = app;
        this.#controller = new GitHubPullRequestsController();
    }

    public createRoutes(): void {
        this.#app
            .route('/github/pull-requests')
            .post(this.#controller.getPullRequests.bind(this.#controller));

        this.#app
            .route('/github/pull-requests/jobs')
            .get(this.#controller.listJobs.bind(this.#controller));

        this.#app
            .route('/github/pull-requests/jobs/:recId')
            .get(this.#controller.getJobStatus.bind(this.#controller));

        this.#app
            .route('/github/pull-requests/jobs/:recId/delete')
            .patch(this.#controller.softDeleteJob.bind(this.#controller));

        this.#app
            .route('/github/pull-requests/classification')
            .post(this.#controller.queueClassificationJob.bind(this.#controller));

        this.#app
            .route('/github/pull-requests/classification/jobs')
            .get(this.#controller.listClassificationJobs.bind(this.#controller));

        this.#app
            .route('/github/pull-requests/classification/jobs/:recId')
            .get(this.#controller.getClassificationJobStatus.bind(this.#controller));

        this.#app
            .route('/github/pull-requests/classification/jobs/:recId/delete')
            .patch(this.#controller.softDeleteClassificationJob.bind(this.#controller));

        this.#app
            .route('/github/pull-requests/sonarqube')
            .post(this.#controller.queueSonarqubeJob.bind(this.#controller));

        this.#app
            .route('/github/pull-requests/sonarqube/jobs')
            .get(this.#controller.listSonarqubeJobs.bind(this.#controller));

        this.#app
            .route('/github/pull-requests/sonarqube/jobs/:recId')
            .get(this.#controller.getSonarqubeJobStatus.bind(this.#controller));

        this.#app
            .route('/github/pull-requests/sonarqube/jobs/:recId/delete')
            .patch(this.#controller.softDeleteSonarqubeJob.bind(this.#controller));
    }
}
