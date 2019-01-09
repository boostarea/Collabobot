import chalk from "chalk";
const log = console.log;

const nowString = () => new Date().toLocaleString();

export default {
    info: function (...args: any): void {
        log(chalk.white(`[INFO ][${nowString()}]`, ...args));
    },
    debug: function (...args: any): void {
        log(chalk.green(`[DEBUG][${nowString()}]`, ...args));
    },
    warn: function (...args: any): void {
        log(chalk.yellow(`[WARN ][${nowString()}]`, ...args));
    },
    error: function (...args: any): void {
        log(chalk.red(`[ERROR][${nowString()}]`, ...args));
    }
};
