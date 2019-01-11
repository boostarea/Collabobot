import _ from "lodash";
import * as fs from "fs";

type Config = {
    owner: string,
    repo: string,
    alias: string,
    robot: {
        id: string,
        owner: string,
        repo: string,
    },
    token: string,
    optionalTokens: Array<string>,
    componentsDir: string,
    servicesDir: string,
    getConfig<T>(constructor: {new (...args: any): T}): T,
    register(key: string, value: any): void,
    [key: string]: any,
}

let config: Config = {
    owner: "%Your repo owner or org%",
    repo: "%Your repo name%",
    alias: "%Your repo alias (Show name)%",
    robot: {
        id: "AliGHRobot",
        owner: "AlibabaDR",
        repo: "Collabobot",
    },
    token: "%Your robot account token%",
    optionalTokens: [ ],    // optional token for data fetch
    componentsDir: "./components",
    servicesDir: "./services",
    getConfig<T>(constructor: {new (...args: any): T}): T {
        for (let i in this) {
            let c = this[i];
            if (c instanceof constructor) {
                return <T>c;
            }
        }
        return null;
    },
    register(key: string, value: any): void {
        if (this[key]) {
            this[key] = _.merge(value, this[key]);
        } else {
            this[key] = value;
        }
    }
}

// ****** Please make sure your custom config file is at this path ******
let customConfigPath = "./custom_config.js";
// if config file path passed from command line, use this to replace default path
if (process.argv[2]) {
    customConfigPath = process.argv[2];
}
if (fs.existsSync(customConfigPath)) {
    let customConfig = require(customConfigPath);
    let checkConfig = (index: string) => {
        if (!customConfig[index]) {
            throw `No ${index} found in your config, please check your config.`;
        }
    }
    let requiredIndexes = ["owner", "repo", "token"];
    requiredIndexes.forEach(checkConfig);
    config = _.merge(config, customConfig);
    if (!customConfig.alias) {
        config.alias = config.repo;
    }
} else {
    throw `No config file found in ${customConfigPath}`;
}

export { Config, config };