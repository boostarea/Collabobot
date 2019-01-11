class IssueTranslatorComponentConfig {
    to: string;
    notice: string;
    notTranslate: (title: string) => boolean;
}

let config = new IssueTranslatorComponentConfig();
config.to = "en";
config.notice = `

***WE STRONGLY SUGGEST YOU TO DESCRIBE YOUR ISSUE IN ENGLISH***`;
config.notTranslate = (title: string): boolean => {
    let titleLowerCase = title.toLowerCase();
    let excludesStrings = [ "[weeklyreport]", "[notice]" ];
    for (let i = 0; i < excludesStrings.length; i++) {
        if (titleLowerCase.includes(excludesStrings[i])) {
            return true;
        }
    }
    return false;
}

export { IssueTranslatorComponentConfig, config };