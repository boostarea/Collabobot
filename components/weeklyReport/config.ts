class WeeklyReportConfig {
    generateTime: string;
    jobName: string;
    weeklyReportTemplate: {
        title: string,
        header: string,
        overview: string,
        pullRequests: string,
        singlePullRequest: string,
        review: string,
        singleReview: string,
        newContributors: string,
        singleContributor: string,
        noNewContributors: string,
        tail: string
    }
};

let config: WeeklyReportConfig = new WeeklyReportConfig();

config.generateTime = "0 15 * * 5";
config.jobName = "WeeklyReport";
config.weeklyReportTemplate = {
    title: `[WeeklyReport] Weekly report for {{alias}} {{startTime}} to {{endTime}}`,
    header: `# Weekly Report of {{alias}}

This is a weekly report of {{alias}}. It summarizes what have changed in the project during the passed week, including pr merged, new contributors, and more things in the future. 
It is all done by @{{robot.id}} which is a collaborate robot.

`,
    overview: `## Repo Overview

| Watch | Star | Fork | Contributors |
|:-----:|:----:|:----:|:------------:|
| {{watch}} | {{star}} ({{starDelta}}) | {{fork}} ({{forkDelta}}) | {{contributor}} ({{contributorDelta}}) |
| New Issues | Closed Issues | New PR | Merged PR |
| {{newIssue}} | {{closeIssue}} | {{newPr}} | {{mergedPr}} |
`,
    pullRequests: `## PR Overview
Thanks to contributions from community, {{alias}} team merged **{{mergedPrCount}}** pull requests in the repository last week. They are:

{{pullRequestStrs}}
`,
    singlePullRequest: `* {{title}} ([#{{number}}]({{link}}))
`,
    review: `## Code Review Statistics
{{alias}} encourages everyone to participant in code review, in order to improve software quality. ` +
`Every week @{{robot.id}} would automatically help to count pull request reviews of single github user as the following. So, try to help review code in this project.

| Contributor ID | Pull Request Reviews |
|:--------: | :--------:|
{{reviewerStrs}}
`,
    singleReview: `| @{{login}} | {{reviewCount}} |
`,
    newContributors: `## Contributors Overview
It is {{alias}} team's great honor to have new contributors from community. We really appreciate your contributions. ` +
`Feel free to tell us if you have any opinion and please share this open source project with more people if you could. ` +
`If you hope to be a contributor as well, please start from https://github.com/{{owner}}/{{repo}}/blob/master/CONTRIBUTING.md .
Here is the list of new contributors:

{{contributorStrs}}

Thanks to you all.
`,
    singleContributor: `@{{login}}
`,
    noNewContributors: `## New Contributors
We have no new contributors in this project this week.
{{alias}} team encourages everything about contribution from community.
For more details, please refer to https://github.com/{{owner}}/{{repo}}/blob/master/CONTRIBUTING.md .
`,
    tail: `

*Note: This robot is supported by [{{robot.repo}}](https://github.com/{{robot.owner}}/{{robot.repo}}).*`
}

export { WeeklyReportConfig, config };
