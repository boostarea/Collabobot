import * as fs from "fs";
import * as path from "path";
import { IApp, Logger, BaseComponent } from "./types/basicTypes";
import WebService from "./services/web/component";
import SchedulerService from "./services/scheduler/component";
import EventService from "./services/event/component";
import GithubService from "./services/github/component";
import DataService from "./services/data/component";
import TranslateService from "./services/translate/component";
import { Config, config } from "./config";
import logger from "./utils/logger";
import { Utils } from "./utils/utils";

class App implements IApp {
    public schedulerService: SchedulerService;
    public eventService: EventService;
    public webService: WebService;
    public githubService: GithubService;
    public dataService: DataService;
    public translateService: TranslateService;
    public config: Config;
    public logger: Logger;
    public utils: Utils;
    private components: Array<BaseComponent>;

    constructor() {
        this.logger = logger;
        this.components = new Array<BaseComponent>();
    }

    public async init() {
        // init config and component
        this.config = config;

        // init services
        await this.loadServices();
        for (let i = 0; i < this.components.length; i++) {
            await this.components[i].init(this);
        }
        this.schedulerService = this.getComponent(SchedulerService);
        this.eventService = this.getComponent(EventService);
        this.webService = this.getComponent(WebService);
        this.githubService = this.getComponent(GithubService);
        this.dataService = this.getComponent(DataService);
        this.translateService = this.getComponent(TranslateService);

        // init components
        await this.loadComponents();
        for (let i = 0; i < this.components.length; i++) {
            await this.components[i].init(this);
        }
    }

    public run() {
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].run();
        }
        this.logger.debug(`[App] App start running.`);
    }

    private loadServices() {
        return this.loadDir(this.config.servicesDir, "Service", false);
    }

    private loadComponents() {
        return this.loadDir(this.config.componentsDir, "Component", true);
    }

    private async loadDir(dir: string, suffix: string, allowDisable: boolean): Promise<void> {
        let list = fs.readdirSync(dir);
        for (let i = 0; i < list.length; i++) {
            let dirName = list[i];
            let directoryPath = path.join(dir, dirName);
            let stat = fs.statSync(directoryPath);
            if (stat && stat.isDirectory()) {
                let name = `${dirName}${suffix}`;

                // load config
                let configPath = path.join(directoryPath, "config.ts");
                if (fs.existsSync(configPath)) {
                    let importPath = configPath.substr(0, configPath.length - 3);
                    let c = await import(`./${importPath}`);
                    if ("config" in c) {
                        this.logger.debug(`[App] Register config for ${configPath}, config=${JSON.stringify(c.config)}`);
                        this.config.register(name, c.config);
                    } else {
                        this.logger.error(`[App] No config export found in ${configPath}`);
                    }
                }

                if (allowDisable && this.config[name] && this.config[name].disable) {
                    continue;   // You can set config to disable to avoid to load the service/compoent
                }

                // load class
                let classPath = path.join(directoryPath, "component.ts");
                if (fs.existsSync(classPath)) {
                    let importPath = classPath.substr(0, classPath.length - 3);
                    let c = await import(`./${importPath}`);
                    if ("default" in c) {
                        let comp = new c.default();
                        if (comp instanceof BaseComponent) {
                            comp.name = name;
                            this.components.push(comp);
                        }
                    } else {
                        this.logger.error(`[App] No default export class found in ${classPath}`);
                    }
                }
            }
        }
    }

    public getComponent<T>(constructor: {new (...args: any): T}): T {
        let c = this.components.find(comp => comp instanceof constructor);
        if (!c) return null;
        return <T><any>c;
    }
}

let main = async () => {
    let app = new App();
    await app.init();
    app.run();
}

main();