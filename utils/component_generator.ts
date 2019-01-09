import args from "args";
import logger from "./logger";
import * as fs from "fs";
import * as path from "path";

(() => {
    args.options([
        {
            name: ["s", "newService"],
            description: "Create a new service for your app, need to set the --name/-n arg."
        },
        {
            name: ["c", "newComponent"],
            description: "Create a new component for your app, need to set the --name/-n arg."
        },
        {
            name: ["n", "name"],
            description: "The name of your service or component."
        }
    ]);

    const flags = args.parse(process.argv);

    if (!flags.n) {
        logger.error(`Name is needed for new component or service create.`);
        return;
    }

    if (!flags.s && !flags.c) {
        logger.error(`You need to specify what kind of component you want to create.`);
        return;
    }

    let originName = <string>(flags.n);
    let pathName = originName.charAt(0).toLowerCase() + originName.substring(1);
    let className = originName.charAt(0).toUpperCase() + originName.substring(1);
    let create = (dir: string, suffix: string) => {
        if (!fs.existsSync(dir)) {
            logger.error(`${dir} not exists`);
            return;
        }
        let pathStat = fs.statSync(dir);
        if (!pathStat.isDirectory()) {
            logger.error(`${dir} is not a directory`);
            return;
        }
        let newPath = path.join(dir, pathName);
        if (fs.existsSync(newPath)) {
            logger.error(`${newPath} already exists.`);
            return;
        }

        let generateClassTemplate = (): string => {
            return `
import { BaseComponent, IApp } from "../../types/basicTypes";
import { ${className}${suffix}Config } from "./config";

export default class ${className}${suffix} extends BaseComponent {
    private config: ${className}${suffix}Config;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.config = this.app.config.getConfig(${className}${suffix}Config);
        this.logger.debug(\`${className}${suffix} init done.\`);
    }
}`
        };
    
        let generateConfigTemplate = (): string => {
            return `
class ${className}${suffix}Config {

}

let config = new ${className}${suffix}Config();

export { ${className}${suffix}Config, config };`
        };

        fs.mkdirSync(newPath);
        let componentPath = path.join(newPath, "component.ts");
        fs.writeFileSync(componentPath, generateClassTemplate().trim());

        let configPath = path.join(newPath, "config.ts");
        fs.writeFileSync(configPath, generateConfigTemplate().trim());

        logger.debug(`Create ${originName} done.`);
    };

    if (flags.s) {
        logger.debug(`Gonna create new service, name=${originName}`);
        create("./services/", "Service");
    } else if (flags.c) {
        logger.debug(`Gonna create new component, name=${originName}`);
        create("./components/", "Component");
    }

})();
