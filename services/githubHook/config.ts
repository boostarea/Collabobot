class GithubHookComponentConfig {
    listenPath: string;
};

let config: GithubHookComponentConfig = new GithubHookComponentConfig();

config.listenPath = "/events";

export { GithubHookComponentConfig, config };
