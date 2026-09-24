import express from 'express';

import { BaseController } from '../controllers/base.controller';

export interface RoutesDefinition {
    app?: express.Application;
    controller?: BaseController;
    createRoutes(): void;
}
