import { BaseComponent, IApp } from "../../types/basicTypes";
import { CommandlineServiceConfig } from "./config";
import { Request, Response } from "express";
import commands from './commands';

export default class CommandlineService extends BaseComponent {

    private config: CommandlineServiceConfig;
    private handlers: Map<string, (params: any, res: Response) => void>;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.config = this.app.config.getConfig(CommandlineServiceConfig);
        this.initHandler();
    }

    run(): void {
        this.app.webService.get(this.config.listenPath, (req: Request, res: Response) => {
            let query = req.query;
            let command = query[this.config.cmdFieldName];
            if (!command) {
                return res.json(this.config.invalidRequestRet);
            }
            if (!this.handlers.has(command)) {
                return res.json(this.config.invalidCommandRet);
            }
            delete query[this.config.cmdFieldName];
            this.handlers.get(command).call(this, query, res);
        });
    }

    initHandler(): void {
        this.handlers = new Map<string, (params: any, res: Response) => void>();
        this.handlers.set(commands.repoData, this.repoData);
        this.handlers.set(commands.tokenStatus, this.tokenStatus);
    }

    repoData(params: any, res: Response): void {
        if (!this.app.dataService.ready) {
            res.json({ error: "Data not ready, try request later." });
            return;
        }
        res.json(this.app.dataService.repoData);
    }

    tokenStatus(params: any, res: Response): void {
        res.json(this.app.githubService.client.getTokenStatus());
    }
}
