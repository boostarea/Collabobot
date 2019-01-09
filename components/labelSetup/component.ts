import { BaseComponent, IApp } from "../../types/basicTypes";
import { LabelSetupComponentConfig } from "./config";

export default class LabelSetupComponent extends BaseComponent {
    private config: LabelSetupComponentConfig;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.config = this.app.config.getConfig(LabelSetupComponentConfig);
        this.logger.debug(`LabelSetupComponent init done.`);
    }

    run(): void {
        this.setup();
    }

    public async setup(): Promise<void> {
        let labels = this.config.labels;
        if (this.config.customLabels) {
            labels = labels.concat(this.config.customLabels);
        }

        let conn = await this.app.githubService.client.getConnection();
        let currentLabels = (await conn.issues.listLabelsForRepo({
            owner: this.app.config.owner,
            repo: this.app.config.repo
        })).data;

        let updatePromises = labels.map(label => {
            let param: any = {
                owner: this.app.config.owner,
                repo: this.app.config.repo,
                name: label.name,
                color: label.color,
                description: label.description
            };
            let oldLabel = currentLabels.find(l => l.name === label.name);
            if (oldLabel) {
                param.current_name = label.name;
                delete param.name;
                if (oldLabel.color === label.color) delete param.color;
                if (oldLabel.description === label.description) delete param.description;
                return conn.issues.updateLabel(param);
            } else {
                return conn.issues.createLabel(param);
            }
        });
        let results = await Promise.all(updatePromises);
        results.forEach(res => {
            if (res.status >= 300) {
                this.logger.error(`Error happend when update a ${JSON.stringify(res)}`);
            }
        });

        currentLabels = (await conn.issues.listLabelsForRepo({
            owner: this.app.config.owner,
            repo: this.app.config.repo
        })).data;
        this.logger.debug(`Labels setup for ${this.app.config.alias} done, setup label=${JSON.stringify(currentLabels.map(l => {
            return { name: l.name, description: l.description, color: l.color }
        }))}`);
    }
}