class GithubServiceConfig {
    maxConcurrentNumber: number
}

let config = new GithubServiceConfig();

config.maxConcurrentNumber = 20;

export { GithubServiceConfig, config }