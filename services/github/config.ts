class GithubServiceConfig {
    maxConcurrentReqNumber: number
}

let config = new GithubServiceConfig();

config.maxConcurrentReqNumber = 20;

export { GithubServiceConfig, config }