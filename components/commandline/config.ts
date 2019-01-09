class CommandlineServiceConfig {
    listenPath: string;
    cmdFieldName: string;
    invalidRequestRet: object;
    invalidCommandRet: object;
}

let config: CommandlineServiceConfig = new CommandlineServiceConfig();

config.listenPath = "/commandline";
config.cmdFieldName = "cmd";
config.invalidRequestRet = {
    error: `Invalid request, ${config.cmdFieldName} param needed.`
};
config.invalidCommandRet = {
    error: `Invalid request, the command not supported.`
}

export { CommandlineServiceConfig, config };