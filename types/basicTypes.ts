import { Config } from "../config";
import { Utils } from "../utils/utils";
import SchedulerService from "../services/scheduler/component";
import EventService from "../services/event/component";
import WebService from "../services/web/component";
import GithubService from "../services/github/component";
import DataService from "../services/data/component";
import TranslateService from "../services/translate/component";

// IApp is the interface all components use
export interface IApp {
    schedulerService: SchedulerService;
    eventService: EventService;
    webService: WebService;
    githubService: GithubService;
    dataService: DataService;
    translateService: TranslateService;
    config: Config;
    logger: Logger;
    utils: Utils;
    /** Can get component of type T in component list, can be null
     *  
     *  Can"t directly use generic type in instanceof in TypeScript, need to pass the type see: https://github.com/Microsoft/TypeScript/issues/5236
    */
    getComponent<T>(constructor: {new (...args: any): T}): T;
}

// The base component class all components should inherit from
export abstract class BaseComponent {
    app: IApp;
    protected logger: Logger;
    public name: string = "UnknownComponent";
    async init(app: IApp): Promise<void> {
        let instance = this;
        this.app = app;
        this.logger = {
            info(...args: any): void {
                app.logger.info(`[${instance.name}]`, ...args);
            },
            debug(...args: any): void {
                app.logger.debug(`[${instance.name}]`, ...args);
            },
            warn(...args: any): void {
                app.logger.warn(`[${instance.name}]`, ...args);
            },
            error(...args: any): void {
                app.logger.error(`[${instance.name}]`, ...args);
            }
        }
    }
    run(): void {}
}

/** Event */
// Generic event handler
export interface EventHandler<T> {
    (param: T): void;
}

/** Logger */
export interface Logger {
    info(...args: any): void;
    debug(...args: any): void;
    warn(...args: any): void;
    error(...args: any): void;
}
