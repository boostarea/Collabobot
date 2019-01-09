import express, { Handler, Server } from "express";
import * as bodyParser from "body-parser";
import { BaseComponent, IApp } from "../../types/basicTypes";
import { WebServiceConfig } from "./config";

export default class WebService extends BaseComponent {

    private express: Server;
    private config: WebServiceConfig;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.express = express();
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: true }));
        this.config = this.app.config.getConfig(WebServiceConfig);
        this.logger.debug(`${this.name} init done.`);
    }

    run(): void {
        this.express.listen(this.config.port, () => {
            this.logger.debug(`Start web service at ${this.config.port}`);
        });
    }

    public get(path: string, handler: Handler): void {
        this.logger.debug(`New get path listened, path=${path}`);
        this.express.get(path, handler);
    }

    public post(path: string, handler: Handler): void {
        this.logger.debug(`New post path listened, path=${path}`)
        this.express.post(path, handler);
    }

}
