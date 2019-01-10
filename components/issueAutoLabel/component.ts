import { BaseComponent, IApp } from "../../types/basicTypes";
import { IssueAutoLabelComponentConfig } from "./config";
import { LabelSetupComponentConfig, Label } from "../labelSetup/config";
import { IssueOpenedEvent } from "../../types/eventTypes";
import { Utils } from "../../utils/utils";

export default class IssueAutoLabelComponent extends BaseComponent {
    private config: IssueAutoLabelComponentConfig;
    private labels: Label[];

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.config = this.app.config.getConfig(IssueAutoLabelComponentConfig);
        let labelSetupConfig = this.app.config.getConfig(LabelSetupComponentConfig);
        this.labels = labelSetupConfig.labels.filter(l => l.keywords && l.keywords.length > 0);
        this.logger.debug(`IssueAutoLabelComponent init done.`);
    }

    run(): void {
        this.app.eventService.on(IssueOpenedEvent, async event => {
            let issue = event.issue;
            let title = issue.title.toLowerCase();
            let attachLabels: string[] = [];
            this.labels.forEach(label => {
                label.keywords.forEach(keyword => {
                    if (title.includes(keyword)) {
                        attachLabels.push(label.name);
                        return;
                    }
                });
            });
            if (attachLabels.length === 0) return;
            attachLabels = Utils.uniqueArray(attachLabels);
            let conn = await this.app.githubService.client.getConnection();
            await conn.issues.addLabels({
                owner: this.app.config.owner,
                repo: this.app.config.repo,
                number: issue.number,
                labels: attachLabels
            }).catch(this.logger.error);
            this.logger.debug(`Auto label for issue #${issue.number} done, lalels=${JSON.stringify(attachLabels)}`);
        });
    }
}