import { BaseComponent, IApp } from "../../types/basicTypes";
import scheduler, { JobCallback, Job } from "node-schedule";

export default class SchedulerService extends BaseComponent {

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.logger.debug(`${this.name} init done.`);
    }

    register(name: string, time: string, func: JobCallback): Job {
        return scheduler.scheduleJob(name, time, (date: Date) => {
            this.logger.debug(`Scheduling job name=${name}`);
            func(date);
        });
    }

}
