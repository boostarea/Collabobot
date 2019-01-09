class DataProviderConfig {
    updateTime: string;
    jobName: string;
}

let config = new DataProviderConfig();

config.updateTime = "0 6 * * *";
config.jobName = "DataUpdate";

export { DataProviderConfig, config }