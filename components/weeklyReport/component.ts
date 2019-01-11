import { BaseComponent, IApp } from "../../types/basicTypes";
import { WeeklyReportConfig } from "./config";
import { Job } from "node-schedule";
import { Utils } from "../../utils/utils";

type weeklyData = {
    star: number,
    contributor: number,
    fork: number,
    watch: number,
}

export default class WeeklyReportComponent extends BaseComponent {
    private config: WeeklyReportConfig;
    private processing: boolean;
    private job: Job;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.processing = false;
        this.config = this.app.config.getConfig(WeeklyReportConfig);
        this.logger.debug(`${this.name} component inite done.`);
    }

    run(): void {
        // add the schedule job
        this.job = this.app.schedulerService.register(this.config.jobName, this.config.generateTime, async date => {
            // Generate weekly report
            if (this.processing) {
                this.logger.warn(`Last weekly generating still in progess.`);
                return;
            }
            this.processing = true;
            await Utils.waitFor(() => this.app.dataService.ready);
            let headerStr = this.generateHeader();
            let overviewStr = this.generateOverview();
            let pullRequestOverviewStr = this.generatePullRequestOverview();
            let codeReviewOverviewStr = await this.generateCodeReviewOverview();
            let contributorOverviewStr = this.generateContributorOverview();
            let tailStr = this.generateTail();

            let weeklyReportStr = `${headerStr}${overviewStr}${pullRequestOverviewStr}${codeReviewOverviewStr}${contributorOverviewStr}${tailStr}`;
            let conn = await this.app.githubService.client.getConnection();
            let title = Utils.stringRenderer(this.config.weeklyReportTemplate.title, {
                alias: this.app.config.alias,
                startTime: Utils.getLastWeek().toLocaleDateString(),
                endTime: new Date().toLocaleDateString(),
            });
            await conn.issues.create({
                owner: this.app.config.owner,
                repo: this.app.config.repo,
                title,
                body: weeklyReportStr,
                labels: [
                    "weekly-report"
                ]
            });
            this.processing = false;
        });
    }

    private generateHeader(): string {
        return Utils.stringRenderer(this.config.weeklyReportTemplate.header, this.app.config);
    }

    private generateOverview(): string {
        let lastWeek = Utils.getLastWeek();
        let repoData = this.app.dataService.repoData;
        let currentData: weeklyData = {
            star: repoData.stars.length,
            watch: repoData.watches.length,
            contributor: repoData.contributors.length,
            fork: repoData.forks.length,
        }
        let deltaData: weeklyData = {
            star: repoData.stars.filter(star => star.time >= lastWeek).length,
            watch: 0,
            contributor: repoData.contributors.filter(cont => cont.time >= lastWeek).length,
            fork: repoData.forks.filter(fork => fork.time >= lastWeek).length
        }
        let decorateDelta = (value: number): string => {
            if (value > 0) {
                return `↑${value}`;
            } else if (value < 0) {
                return `↓${value}`;
            } else {
                return "-";
            }
        }
        let newIssue = repoData.issues.filter(issue => issue.createdAt >= lastWeek).length;
        let closeIssue = repoData.issues.filter(issue => issue.closedAt && issue.closedAt >= lastWeek).length;
        let newPr = repoData.pullRequests.filter(pr => pr.createdAt >= lastWeek).length;
        let mergedPr = repoData.pullRequests.filter(pr => pr.mergedAt && pr.mergedAt >= lastWeek).length;
        let overviewStr = Utils.stringRenderer(this.config.weeklyReportTemplate.overview, {
            star: currentData.star,
            starDelta: decorateDelta(deltaData.star),
            fork: currentData.fork,
            forkDelta: decorateDelta(deltaData.fork),
            contributor: currentData.contributor,
            contributorDelta: decorateDelta(deltaData.contributor),
            watch: currentData.watch,
            newIssue,
            closeIssue,
            newPr,
            mergedPr
        });
        return overviewStr;
    }

    private generatePullRequestOverview(): string {
        let lastWeek = Utils.getLastWeek();
        let prs = this.app.dataService.repoData.pullRequests.filter(pr => pr.mergedAt && pr.mergedAt >= lastWeek);
        let pullRequestStrs = "";
        prs.forEach(pr => {
            pullRequestStrs += Utils.stringRenderer(this.config.weeklyReportTemplate.singlePullRequest, {
                title: pr.title,
                number: pr.number,
                link: pr.url
            });
        });
        let options: any = {
            alias: this.app.config.alias,
            mergedPrCount: prs.length,
            pullRequestStrs
        };
        let pullRequestsStr = Utils.stringRenderer(this.config.weeklyReportTemplate.pullRequests, options);
        return pullRequestsStr;
    }

    private async generateCodeReviewOverview(): Promise<string> {
        let lastWeek = Utils.getLastWeek();
        // get prs merged last week or still in open state
        let mergedOrOpenPrs = this.app.dataService.repoData.pullRequests.filter(pr => (pr.mergedAt && pr.mergedAt >= lastWeek) || !pr.closedAt);
        let reviewers = new Array<{
            login: string,
            reviewCount: number
        }>();
        for (let i = 0; i < mergedOrOpenPrs.length; i++) {
            let pr = mergedOrOpenPrs[i];
            let conn = await this.app.githubService.client.getConnection();
            let reviews = await conn.pulls.listReviews({
                owner: this.app.config.owner,
                repo: this.app.config.repo,
                number: pr.number,
                per_page: 100,
            });
            reviews.data.filter(review => (<any>review).submitted_at && new Date((<any>review).submitted_at) >= lastWeek).forEach(review => {
                let reviewer = reviewers.find(r => r.login === review.user.login);
                if (reviewer) {
                    reviewer.reviewCount++;
                } else {
                    reviewers.push({
                        login: review.user.login,
                        reviewCount: 1
                    });
                }
            });
        }
        reviewers.sort((a, b) => b.reviewCount - a.reviewCount);
        let reviewOverviewStr = Utils.stringRenderer(this.config.weeklyReportTemplate.review, {
            alias: this.app.config.alias,
            robot: this.app.config.robot,
            reviewerStrs: reviewers.map(r => Utils.stringRenderer(this.config.weeklyReportTemplate.singleReview, r)).join("")
        });
        return reviewOverviewStr;
    }

    private generateContributorOverview(): string {
        let lastWeek = Utils.getLastWeek();
        let contributors = this.app.dataService.repoData.contributors.filter(c => c.time >= lastWeek);
        if (contributors.length > 0) {
            return Utils.stringRenderer(this.config.weeklyReportTemplate.newContributors, {
                alias: this.app.config.alias,
                owner: this.app.config.owner,
                repo: this.app.config.repo,
                contributorStrs: contributors.map(c => Utils.stringRenderer(this.config.weeklyReportTemplate.singleContributor,
                    { login: c.user.login })).join("")
            });
        } else {
            return Utils.stringRenderer(this.config.weeklyReportTemplate.noNewContributors, this.app.config);
        }
    }

    private generateTail(): string {
        return Utils.stringRenderer(this.config.weeklyReportTemplate.tail, this.app.config);
    }

    private cancel(): void {
        this.job && this.job.cancel();
    }

    private restart(): void {
        this.run();
    }
}
