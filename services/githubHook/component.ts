import { BaseComponent, IApp } from "../../types/basicTypes";
import { GithubHookComponentConfig } from "./config";
import { Utils } from "../../utils/utils";
import { Request, Response } from "express";
import { EventType } from "./types";
import { IssueEvent, IssueEventTypes, IssueCommentEvent, PullRequestEvent, IssueOpenedEvent, IssueEditedEvent, IssueDeletedEvent, IssueClosedEvent, IssueLabeledEvent, PullRequestEventTypes, PullRequestOpenedEvent, PullRequestEditedEvent, PullRequestClosedEvent, PullRequestReopenedEvent } from "../../types/eventTypes";

export default class GithubHookComponent extends BaseComponent {

    private config: GithubHookComponentConfig;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.config = this.app.config.getConfig(GithubHookComponentConfig);
        this.logger.debug(`${this.name} init done.`);
    }

    run(): void {
        this.logger.debug(`Start to setup github hooks`);
        // handle events
        this.app.webService.post(this.config.listenPath, (req: Request, res: Response) => {
            res.json({});
            let event = req.header("X-GitHub-Event");
            let body = Utils.parseBody(req);
            this.logger.debug(`Get new event from github, event=${event}`);
            switch (event) {
                case EventType.IssueEvent:
                    let issueEventBody = <IssueEvent>body;
                    switch (issueEventBody.action) {
                        case IssueEventTypes.opened:
                            this.app.eventService.trigger(IssueOpenedEvent, issueEventBody);
                            break;
                        case IssueEventTypes.edited:
                            this.app.eventService.trigger(IssueEditedEvent, issueEventBody);
                            break;
                        case IssueEventTypes.deleted:
                            this.app.eventService.trigger(IssueDeletedEvent, issueEventBody);
                            break;
                        case IssueEventTypes.closed:
                            this.app.eventService.trigger(IssueClosedEvent, issueEventBody);
                            break;
                        case IssueEventTypes.labeled:
                            this.app.eventService.trigger(IssueLabeledEvent, issueEventBody);
                            break;
                    }
                    break;
                case EventType.IssueCommentEvent:
                    this.app.eventService.trigger(IssueCommentEvent, <IssueCommentEvent>body);
                    break;
                case EventType.PullRequestEvent:
                    let pullRequestEventBody = <PullRequestEvent>body;
                    switch (pullRequestEventBody.action) {
                        case PullRequestEventTypes.opened:
                            this.app.eventService.trigger(PullRequestOpenedEvent, pullRequestEventBody);
                            break;
                        case PullRequestEventTypes.edited:
                            this.app.eventService.trigger(PullRequestEditedEvent, pullRequestEventBody);
                            break;
                        case PullRequestEventTypes.closed:
                            this.app.eventService.trigger(PullRequestClosedEvent, pullRequestEventBody);
                            break;
                        case PullRequestEventTypes.reopened:
                            this.app.eventService.trigger(PullRequestReopenedEvent, pullRequestEventBody);
                            break;
                    }
                    break;
                default:
                    this.logger.warn(`Unknow event type received, type=${event}`);
            }
        });
    }

}
