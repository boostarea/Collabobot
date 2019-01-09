import { Request } from "express";
const { pope } = require("pope");
const waitFor = require("p-wait-for");

export class Utils {
    static parseBody(req: Request): any {
        return (<any>req)["body"];
    }

    static uniqueArray<T>(arr: Array<T>): Array<T> {
        let unique = (value: T, index: number, self: Array<T>) => {
            return self.indexOf(value) === index;
        }
        return arr.filter(unique);
    }

    static stringRenderer(template: string, param: object): string {
        return pope(template, param);
    }

    static waitFor(func: () => boolean, options?: object): Promise<void> {
        return waitFor(func, Object.assign({ interval: 1000 }, options));
    }

    static getLastWeek(): Date {
        return new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    }
}
