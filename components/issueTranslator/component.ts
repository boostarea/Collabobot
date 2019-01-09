import { BaseComponent, IApp } from "../../types/basicTypes";
import { IssueTranslatorComponentConfig } from "./config";
import { IssueOpenedEvent } from "../../types/eventTypes";
import * as os from "os";
import { IssuesUpdateParams } from "@octokit/rest";

export default class IssueTranslatorComponent extends BaseComponent {
    private config: IssueTranslatorComponentConfig;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.config = this.app.config.getConfig(IssueTranslatorComponentConfig);

        this.app.eventService.on(IssueOpenedEvent, async event => {
            let issue = event.issue;
            let title = issue.title;
            let body = issue.body;

            let titleTransResult = await this.app.translateService.translate(title, this.config.to);
            if (!titleTransResult) return;

            let bodyArray = body.split(os.EOL);
            let bodyTransResult = await this.app.translateService.translateArray(bodyArray, this.config.to);
            if (!bodyTransResult) return;

            if (titleTransResult.detectedSourceLanguage === this.config.to &&
                bodyTransResult.filter(r => r.detectedSourceLanguage !== this.config.to).length === 0) {
                    this.logger.debug(`No translate need for issue ${issue.number}`);
                    return;
            }

            let conn = await this.app.githubService.client.getConnection();
            let updateParams: IssuesUpdateParams = {
                owner: this.app.config.owner,
                repo: this.app.config.repo,
                number: issue.number,
            };
            if (titleTransResult.detectedSourceLanguage !== this.config.to) {
                updateParams.title = titleTransResult.translatedText;
            }

            if (bodyTransResult.filter(r => r.detectedSourceLanguage !== this.config.to).length !== 0) {
                updateParams.body = bodyArray.map((line, index) => {
                    if (bodyTransResult[index].detectedSourceLanguage === this.config.to) return line;
                    return `${bodyTransResult[index].translatedText}${os.EOL}// ${line}`;
                }).join("") + this.config.notice;
            }

            await conn.issues.update(updateParams);
            this.logger.debug(`Issue ${issue.number} translate done.`);
        });

        this.logger.debug(`IssueTranslatorComponent init done.`);
    }

}