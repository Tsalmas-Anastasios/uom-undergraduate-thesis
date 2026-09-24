import express from 'express';

import { BaseController } from './base.controller.ts';

export class IndexController extends BaseController {
    public index(_request: express.Request, response: express.Response): express.Response {
        return response
            .status(200)
            .send({ message: 'Hi, you are unauthorized to have access in this system!' });
    }
}
