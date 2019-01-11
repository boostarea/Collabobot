import { BaseComponent, IApp } from "../../types/basicTypes";
import { RepoDataUpdateEvent, IssueOpenedEvent, NewUserOpenIssueEvent, IssueClosedEvent, PullRequestClosedEvent, NewContributorEvent, PullRequestOpenedEvent, NewUserOpenPullRequestEvent } from "../../types/eventTypes";
import { RepoData, UserData } from "../../types/dataTypes";
import { DataProviderConfig } from "./config";
import { GithubConnectionPool } from "../../utils/github/GitHubConnectionPool";

export default class DataService extends BaseComponent {
    public ready: boolean;
    public lastUpdateTime: Date;
    public repoData: RepoData;
    public userMap: Map<string, UserData>;
    private config: DataProviderConfig;
    private client: GithubConnectionPool;
    private processing: boolean;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.config = this.app.config.getConfig(DataProviderConfig);
        this.userMap = new Map<string, UserData>();
        this.repoData = new RepoData();
        this.repoData.name = this.app.config.repo;
        this.repoData.fullName = `${this.app.config.owner}/${this.app.config.repo}`;
        this.ready = false;
        this.processing = false;
        this.logger.debug(`${this.name} inited done.`);
    }

    run(): void {
        this.client = this.app.githubService.client;
        if (this.app.githubService.dataFetchClient) {
            this.client = this.app.githubService.dataFetchClient;
        }
        this.initHookHandler();
        this.app.schedulerService.register(this.config.jobName, this.config.updateTime, (date: Date) => {
            this.update(false);
        });
        this.update(true);
    }

    private initHookHandler(): void {
        // issue open
        this.app.eventService.on(IssueOpenedEvent, event => {
            let issue = event.issue;
            if (this.repoData.issues.find(i => i.id === issue.id)) return;
            if (!this.userMap.has(issue.user.login)) {
                // new user open issue
                let userData = this.tryAddNewUser(issue.user.login, issue.user.id);
                this.app.eventService.trigger(NewUserOpenIssueEvent, {
                    user: userData,
                    issue: issue
                });
            }
            this.repoData.issues.push({
                id: issue.id,
                number: issue.number,
                title: issue.title,
                body: issue.body,
                createdAt: issue.created_at && new Date(issue.created_at),
                updatedAt: issue.updated_at && new Date(issue.updated_at),
                closedAt: issue.closed_at && new Date(issue.closed_at),
                author: this.userMap.get(issue.user.login),
                comments: []
            });
        });

        // issue close
        this.app.eventService.on(IssueClosedEvent, event => {
            let issueData = this.repoData.issues.find(i => i.id === event.issue.id);
            if (issueData) {
                issueData.closedAt = new Date(event.issue.closed_at);
            }
        });

        this.app.eventService.on(PullRequestOpenedEvent, event => {
            let pullRequest = event.pull_request;
            if (this.repoData.pullRequests.find(p => p.id === pullRequest.id)) return;
            if (!this.userMap.has(pullRequest.user.login)) {
                // new user open pull request
                let userData = this.tryAddNewUser(pullRequest.user.login, pullRequest.user.id);
                this.app.eventService.trigger(NewUserOpenPullRequestEvent, {
                    user: userData,
                    pullRequest: pullRequest
                });
            }
            this.repoData.pullRequests.push({
                id: pullRequest.id,
                number: pullRequest.number,
                title: pullRequest.title,
                body: pullRequest.body,
                createdAt: pullRequest.created_at && new Date(pullRequest.created_at),
                updatedAt: pullRequest.updated_at && new Date(pullRequest.updated_at),
                closedAt: pullRequest.closed_at && new Date(pullRequest.closed_at),
                mergedAt: pullRequest.merged_at && new Date(pullRequest.merged_at),
                author: this.userMap.get(pullRequest.user.login),
                url: pullRequest.html_url,
                comments: []
            });
        });

        // pull request close
        this.app.eventService.on(PullRequestClosedEvent, event => {
            let pr = event.pull_request;
            let prData = this.repoData.pullRequests.find(p => p.id === pr.id);
            if (prData) {
                prData.closedAt = new Date(pr.closed_at);
                if (pr.merged) {
                    // close with merge
                    prData.mergedAt = new Date(pr.merged_at);
                    if (!this.repoData.contributors.find(c => c.user.login === pr.user.login)) {
                        // new contributor
                        let userData = this.tryAddNewUser(pr.user.login, pr.user.id);
                        this.repoData.contributors.push({
                            user: userData,
                            time: prData.mergedAt
                        });
                        this.app.eventService.trigger(NewContributorEvent, {
                            user: userData,
                            pullRequest: pr
                        });
                    }
                }
            }
        });
    }

    private update(initialUpdate: boolean) {
        if (this.processing) {
            this.logger.warn(`Last time data update is still in progress.`);
            return;
        }
        this.processing = true;
        Promise.all([this.updateForks(), this.updateStars(), this.updateWatches(), this.updateContributors(), this.updateIssues(), this.updatePullRequests()]).then(() => {
            this.ready = true;
            this.lastUpdateTime = new Date();
            this.logger.debug(`Data provider updated done. updateTime=${this.lastUpdateTime.toLocaleString()}, starsCount=${this.repoData.stars.length}, watches=${this.repoData.watches.length}, ` +
                `forksCount=${this.repoData.forks.length}, contributorsCount=${this.repoData.contributors.length}, issuesCount=${this.repoData.issues.length}, pullRequestCount=${this.repoData.pullRequests.length}`);
            this.processing = false;
            this.app.eventService.trigger(RepoDataUpdateEvent, {
                initialUpdate
            });
        });
    }

    private updateForks(): Promise<void> {
        return new Promise<void>(async resolve => {
            let forks = await this.client.repo.forks(this.repoData.fullName);
            forks.forEach(fork => {
                this.tryAddNewUser(fork.owner.login, fork.owner.id);
            });
            this.repoData.forks = forks.map(fork => {
                return {
                    user: this.userMap.get(fork.owner.login),
                    time: new Date(fork.created_at)
                };
            });
            resolve();
        });
    }

    private updateStars(): Promise<void> {
        return new Promise<void>(async resolve => {
            let stars = await this.client.repo.stars(this.repoData.fullName);
            stars.forEach(star => {
                this.tryAddNewUser((<any>star).user.login, (<any>star).user.id);
            });
            this.repoData.stars = stars.map(star => {
                return {
                    user: this.userMap.get((<any>star).user.login),
                    time: new Date((<any>star).starred_at)
                };
            });
            resolve();
        });
    }

    private updateWatches(): Promise<void> {
        return new Promise<void>(async resolve => {
            let watches = await this.client.repo.watches(this.repoData.fullName);
            watches.forEach(watch => {
                this.tryAddNewUser(watch.login, watch.id);
            });
            this.repoData.watches = watches.map(watch => {
                return this.userMap.get(watch.login);
            });
            resolve();
        });
    }

    private updateContributors(): Promise<void> {
        return new Promise<void>(async resolve => {
            let commits = await this.client.repo.commits(this.repoData.fullName);
            commits = commits.filter(commit => commit.author);
            commits.forEach(commit => {
                this.tryAddNewUser(commit.author.login, commit.author.id);
            });
            this.repoData.contributors = [];
            commits.forEach(commit => {
                let user = this.repoData.contributors.find(u => u.user.login === commit.author.login);
                if (!user) {
                    this.repoData.contributors.push({
                        user: this.userMap.get(commit.author.login),
                        time: new Date(commit.commit.committer.date)
                    });
                } else if (user.time > new Date(commit.commit.committer.date)) {
                    user.time = new Date(commit.commit.committer.date);
                }
            });
            resolve();
        });
    }

    private updateIssues(): Promise<void> {
        return new Promise<void>(async resolve => {
            let issues = await this.client.repo.issues(this.repoData.fullName);
            issues = issues.filter(issue => !issue.pull_request);    // filter pull request
            issues.forEach(issue => {
                this.tryAddNewUser(issue.user.login, issue.user.id);
            });
            this.repoData.issues = issues.map(issue => {
                return {
                    id: issue.id,
                    number: issue.number,
                    title: issue.title,
                    body: issue.body,
                    createdAt: issue.created_at && new Date(issue.created_at),
                    updatedAt: issue.updated_at && new Date(issue.updated_at),
                    closedAt: issue.closed_at && new Date(issue.closed_at),
                    author: this.userMap.get(issue.user.login),
                    comments: []
                };
            });
            resolve();
        });
    }

    private updatePullRequests(): Promise<void> {
        return new Promise<void>(async resolve => {
            let pullRequests = await this.client.repo.pullRequests(this.repoData.fullName);
            pullRequests.forEach(pullRequest => {
                this.tryAddNewUser(pullRequest.user.login, pullRequest.user.id);
            });
            this.repoData.pullRequests = pullRequests.map(pullRequest => {
                return {
                    id: pullRequest.id,
                    number: pullRequest.number,
                    title: pullRequest.title,
                    body: pullRequest.body,
                    createdAt: pullRequest.created_at && new Date(pullRequest.created_at),
                    updatedAt: pullRequest.updated_at && new Date(pullRequest.updated_at),
                    closedAt: pullRequest.closed_at && new Date(pullRequest.closed_at),
                    mergedAt: pullRequest.merged_at && new Date(pullRequest.merged_at),
                    author: this.userMap.get(pullRequest.user.login),
                    url: pullRequest.html_url,
                    comments: []
                };
            });
            resolve();
        });
    }

    private tryAddNewUser(login: string, id: number): UserData {
        let userData = this.userMap.get(login);
        if (userData) return userData;
        userData = new UserData();
        userData.id = id;
        userData.login = login;
        this.userMap.set(login, userData);
        return userData;
    }
}
