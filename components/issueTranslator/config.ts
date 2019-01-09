class IssueTranslatorComponentConfig {
    to: string;
    notice: string;
}

let config = new IssueTranslatorComponentConfig();
config.to = "en";
config.notice = `

// ***!!!!WE STRONGLY ENCOURAGE YOU TO DESCRIBE YOUR ISSUE IN ENGLISH!!!!***`

export { IssueTranslatorComponentConfig, config };