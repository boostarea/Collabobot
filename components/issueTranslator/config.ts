class IssueTranslatorComponentConfig {
    to: string;
    notice: string;
}

let config = new IssueTranslatorComponentConfig();
config.to = "en";
config.notice = `

*** WE STRONGLY SUGGEST YOU TO DESCRIBE YOUR ISSUE IN ENGLISH ***`

export { IssueTranslatorComponentConfig, config };