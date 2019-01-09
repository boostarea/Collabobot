import Github = require("@octokit/rest");
import { UserData } from "./dataTypes";

// Base Event
export abstract class BaseEvent {

}

// For issues
export class IssueEvent extends BaseEvent {
    action: string;
    issue: Github.IssuesGetResponse;
}

let IssueEventTypes = {
    opened: "opened",
    edited: "edited",
    deleted: "deleted",
    closed: "closed",
    labeled: "labeled"
}

export class IssueOpenedEvent extends IssueEvent {
}

export class IssueEditedEvent extends IssueEvent {
}

export class IssueDeletedEvent extends IssueEvent {
}

export class IssueClosedEvent extends IssueEvent {
}

export class IssueLabeledEvent extends IssueEvent {
}

export class IssueCommentEvent extends BaseEvent {

}

// For pull requests
export class PullRequestEvent extends BaseEvent {
    action: string;
    number: number;
    pull_request: Github.PullsGetResponse;
}

let PullRequestEventTypes = {
    opened: "opened",
    edited: "edited",
    closed: "closed",
    reopened: "reopened",
}

export class PullRequestOpenedEvent extends PullRequestEvent {

}

export class PullRequestEditedEvent extends PullRequestEvent {

}

export class PullRequestClosedEvent extends PullRequestEvent {

}

export class PullRequestReopenedEvent extends PullRequestEvent {

}

// For data provider
export class RepoDataUpdateEvent {
    initialUpdate: boolean
}

// For new commers
export class NewUserOpenIssueEvent extends BaseEvent {
    user: UserData;
    issue: Github.IssuesGetResponse;
}

export class NewUserOpenPullRequestEvent extends BaseEvent {
    user: UserData;
    pullRequest: Github.PullsGetResponse;
}

export class NewContributorEvent extends BaseEvent {
    user: UserData;
    pullRequest: Github.PullsGetResponse;
}

export { IssueEventTypes, PullRequestEventTypes };
