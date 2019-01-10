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

        let conn = await this.app.githubService.client.getConnection();
        let currentLabels = (await conn.issues.listLabelsForRepo({
            owner: this.app.config.owner,
            repo: this.app.config.repo
        })).data;

        let updateNum = 0;
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
                if (!param.color && !param.description) {
                    // no need to update
                    return Promise.resolve(null);
                }
                updateNum++;
                return conn.issues.updateLabel(param);
            } else {
                updateNum++;
                return conn.issues.createLabel(param);
            }
        });
        if (updateNum === 0) {
            this.logger.debug(`No need to update labels`);
            return;
        }
        this.logger.debug(`Goona update ${updateNum} labels for project`);
        await Promise.all(updatePromises).then(results => {
            results.forEach(res => {
                if (res && res.status && res.status >= 300) {
                    this.logger.error(`Error happened when update a ${JSON.stringify(res)}`);
                }
            });
        }).catch(this.logger.error);

        await conn.issues.listLabelsForRepo({
            owner: this.app.config.owner,
            repo: this.app.config.repo
        }).then(newLabels => {
            this.logger.debug(`Labels setup for ${this.app.config.alias} done, setup label=${JSON.stringify(newLabels.data.map(l => {
                return { name: l.name, description: l.description, color: l.color }
            }))}`);
        }).catch(this.logger.error);
        
    }
}