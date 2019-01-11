import { BaseComponent, IApp } from "../../types/basicTypes";
import { IssueTranslatorComponentConfig } from "./config";
import { IssueOpenedEvent } from "../../types/eventTypes";
import * as os from "os";
import { IssuesUpdateParams } from "@octokit/rest";
import { TranslateResult } from "../../services/translate/types";

export default class IssueTranslatorComponent extends BaseComponent {
    private config: IssueTranslatorComponentConfig;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.config = this.app.config.getConfig(IssueTranslatorComponentConfig);

        this.app.eventService.on(IssueOpenedEvent, async event => {
            let issue = event.issue;
            let title = issue.title;
            let body = issue.body;

            if (this.config.notTranslate(title)) return;

            let titleTransResult = await this.app.translateService.translate(title, this.config.to);
            if (!titleTransResult) return;

            let bodyArray = body.split(os.EOL); // body maybe none.
            let bodyTransResult: TranslateResult[] = await Promise.all(bodyArray.map(line => {
                if (IssueTranslatorComponent.hasChineseChar(line)) {
                    // has chinese character, try translate
                    return this.app.translateService.translate(line, this.config.to);
                } else {
                    // no chinese character, return origin
                    return {
                        translatedText: line,
                        originalText: line,
                        detectedSourceLanguage: this.config.to
                    };
                }
            }));
            if (!bodyTransResult) return;

            if (titleTransResult.detectedSourceLanguage === this.config.to &&
                bodyTransResult.filter(r => r.detectedSourceLanguage !== this.config.to && r.translatedText !== r.originalText).length === 0) {
                    this.logger.debug(`No translate need for issue #${issue.number}`);
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

            if (bodyTransResult.filter(r => r.detectedSourceLanguage !== this.config.to && r.translatedText !== r.originalText).length !== 0) {
                updateParams.body = bodyArray.map((line, index) => {
                    if (bodyTransResult[index].detectedSourceLanguage === this.config.to || bodyTransResult[index].translatedText === bodyTransResult[index].originalText) return line;
                    return `${bodyTransResult[index].translatedText}${os.EOL}// ${line}`;
                }).join(os.EOL) + this.config.notice;
            }

            await conn.issues.update(updateParams);
            this.logger.debug(`Issue ${issue.number} translate done.`);
        });

        this.logger.debug(`IssueTranslatorComponent init done.`);
    }

    private static hasChineseChar(str: string) {
        return /.*[\u4e00-\u9fa5]+.*/.test(str);
    }

}