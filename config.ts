import _ from "lodash";
import * as fs from "fs";
import * as path from "path";

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
    optionalTokens: [ "%Your github token for data fetching%" ],
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
if (fs.existsSync(path.join(__dirname, customConfigPath))) {
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
    throw "No config file found";
}

export { Config, config };