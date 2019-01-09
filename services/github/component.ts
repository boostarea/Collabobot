import { BaseComponent, IApp } from "../../types/basicTypes";
import { GithubConnectionPool } from "../../utils/github/GitHubConnectionPool";
import { GithubServiceConfig } from "./config";

export default class GithubService extends BaseComponent {
    client: GithubConnectionPool;
    private config: GithubServiceConfig;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.config = this.app.config.getConfig(GithubServiceConfig);
        this.client = new GithubConnectionPool();
        let option = {
            tokens: [ this.app.config.token ],
            logger: this.logger.error,
            maxConcurrentNumber: this.config.maxConcurrentNumber ? this.config.maxConcurrentNumber : undefined
        };
        this.client.init(option);
        this.logger.debug(`${this.name} init done.`);
    }

}