import { BaseComponent, IApp } from "../../types/basicTypes";
import { GithubConnectionPool } from "../../utils/github/GitHubConnectionPool";
import { GithubServiceConfig } from "./config";

export default class GithubService extends BaseComponent {
    client: GithubConnectionPool;
    dataFetchClient: GithubConnectionPool;
    private config: GithubServiceConfig;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.config = this.app.config.getConfig(GithubServiceConfig);
        this.client = new GithubConnectionPool();
        this.client.init({
            tokens: [this.app.config.token],
            logger: this.logger.error,
            maxConcurrentReqNumber: this.config.maxConcurrentReqNumber ? this.config.maxConcurrentReqNumber : undefined
        });

        if (this.app.config.optionalTokens.length > 0) {
            this.dataFetchClient = new GithubConnectionPool();
            this.dataFetchClient.init({
                tokens: this.app.config.optionalTokens,
                logger: this.logger.error,
                maxConcurrentReqNumber: this.config.maxConcurrentReqNumber ? this.config.maxConcurrentReqNumber : undefined
            });
        }

        this.logger.debug(`${this.name} init done.`);
    }

}
