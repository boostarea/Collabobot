# Collabobot

Collabobot is short for collaborate robot which is for GitHub open source project collaboration.

## To start using Collabobot

Collabobot is written in pure [TypeScript](https://github.com/Microsoft/TypeScript) to improve development speed and quality.

All dependent modules are listed in `package.json`, so the only environment you need is Node.js and latest npm. run `npm install` after clone the project and add a `custom_config.js` file to configure your robot, the content of the config file should be like below:

``` JavaScript
module.exports = {
    owner: "AlibabaDR",
    repo: "Collabobot",
    alias: "GitHub Collaborate Robot",
    token: "%Your main token%",
    optionalTokens: [
        "%Your optional token #1%",
        "%Your optional token #2%"
    ],
    robot: {
        login: "AliGHRobot",
        owner: "AlibabaDR",
        repo: "Collabobot",
    },
    weeklyReportComponent: {
        generateTime: "0 9 * * 1",      // this will change the generate time of weekly report
        disable: true                   // this will disable weekly report component
    }
}
```

The only required config is the repo `owner`, `repo` and the `token`.

`owner` and `repo` decide which repo your robot services for, and the `token` is the token of the GitHub user you use to act as the robot.

You can add some additional tokens for the robot to fetch data from GitHub as GitHub API has [rate limitation](https://developer.github.com/v3/#rate-limiting) for single token.

The `robot` config is the login and repo info for the GitHub user you use to act as the robot, generally, this info should match the `token` you use. And default config for the robot is @AliGHRobot and this repo.

You can override any config for any service/component, setting of the corresponding field is enough. And for any component, set the `disable` field to `true` in config to disable the function, and the robot will not load the component.

After create the config file, just run `npm start` to start the robot and you can use whatever tools you need to make the robot daemon(pm2/forever/nohup).

## To start developing Collabobot

The framework of this robot only provides some basic services which can not be disabled, you can use all these services to develop your own component.

The services contains:

### WebService

This robot uses [`express`](https://github.com/expressjs/expressjs.com) to provide web service.

If any service/component needs to handle requests from the Internet, you can use `this.app.webService.get(path: string, (req: Request, res: Response) => void);` or `this.app.webService.post(path: string, (req: Request, res: Response) => void);` to register your request function.

### GitHubHookService

GitHub hook service uses web service to receive event data from GitHub and dispatch event and event data via event service, so any component can get the event and make the process whatever it wants to.

### GitHubService

GitHub service uses [`@octokit/rest.js`](https://github.com/octokit/rest.js) as GitHub client and wrap some general data list fetching process, and cover the multiple token support, token rate limitation control, concurrent control, error handler and etc..

For data retrieve, you can use `this.app.GithubService.client` to get the client which is in type of `GitHubConnectionPool`, with this client, you can use wrapped function to fetch basic data or use `this.app.GithubService.client.getConnection();` to get a valid connection to use.

### SchedulerService

Scheduler service is for tasks which will schedule in the future. This robot uses [`node-schedule`](https://github.com/node-schedule/node-schedule) to manage the tasks which is compatible with `crontab` time format.

You can use `this.app.schedulerService.register(name: string, time: string, (date: Date) => void);` to register a schedule task.

### EventService

Event service is very important in the framework. Many functions depend on event driving system like GitHub hook service.

Notice that the event service uses class type to trigger and dispatch events. All the event types should add into `types/eventTypes.ts` and derived from `BaseEvent` and the param of the handler is also the class type.

Then you can use `this.app.eventService.on(EventType, (event: EventType) => void);` to register your handler for a specific event type and use `this.app.eventService.trigger(EventType, event);` to trigger a event. When a event is triggered, all listened handlers will be called with the event param.

### DataService

Data service provides basic repo data for all services and components.

Repo data includes repo basic info(name, fullName), and all star, watch, fork, contributor, issue, pull requests data. The data will regularly updated due to the config and listen to web hook to update data. So the data in data service is up-to-date and can be used any time.

You can access the repo data via `this.app.dataService.repoData` and you can get detail info of user data from `this.app.dataService.userMap` to get the map of all GitHub users related to the repo.

## Support

If you have any questions or feature requests, please feel free to submit an issue.