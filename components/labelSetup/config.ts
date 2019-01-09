type Label = {
    name: string,
    description: string,
    color: string,
    keywords?: string[]
}

class LabelSetupComponentConfig {
    labels: Label[];
    customLabels: Label[];
}

let config = new LabelSetupComponentConfig();
config.labels = [
    // Kind
    {
        name: "kind/bug",
        description: "Category issues or prs related to bug.",
        color: "e11d21",
        keywords: [ "bug", "bugreport", "bug-report", "bugfix", "cannot", "can not", "can't",
		    "error", "failure", "failed to ", "fix:" ]
    },
    {
        name: "kind/enhancement",
        description: "Category issues or prs related to pull request.",
        color: "c7def8",
        keywords: [ "feature", "feature request", "feature-request", "feature_request" ]
    },
    {
        name: "kind/question",
        description: "Category issues related to questions or problems",
        color: "f1ee18",
        keywords: [ "question", "problem", "confusion", "how to", "where to" ]
    },
    {
        name: "kind/discussion",
        description: "Category issues related to discussion",
        color: "c2e0c6",
        keywords: [ "discussion", "disscuss" ]
    },
    {
        name: "kind/notice",
        description: "Some notice issue sent from project",
        color: "ededed",
        keywords: [ "notice" ]
    },

    // Size
    {
        name: "size/XXL",
        description: "Indicate a PR that changes 1000+ lines.",
        color: "ee0000"
    },
    {
        name: "size/XL",
        description: "Indicate a PR that changes 500-999 lines.",
        color: "ee5500"
    },
    {
        name: "size/L",
        description: "Indicate a PR that changes 100-499 lines.",
        color: "ee9900"
    },
    {
        name: "size/M",
        description: "Indicate a PR that changes 30-99 lines.",
        color: "eebb00"
    },
    {
        name: "size/S",
        description: "Indicate a PR that changes 10-29 lines.",
        color: "77bb00"
    },
    {
        name: "size/XS",
        description: "Indicate a PR that changes 0-9 lines.",
        color: "009900"
    },

    // Priority
    {
        name: "priority/important-urgent-P1",
        description: "Most important, need to be worked on as soon as possible",
        color: "e11d21"
    },
    {
        name: "priority/important-soon-P2",
        description: "Very important, need to be worked with soon but not very urgent",
        color: "eb6420"
    },
    {
        name: "priority/important-longterm-P3",
        description: "Quite important, may need sometime to complete.",
        color: "eb6420"
    },

    // Area
    {
        name: "area/doc",
        description: "Category issues or prs related to document.",
        color: "0366d6",
        keywords: [ "doc", "docs", "documents", "document" ]
    }
];

export { Label, LabelSetupComponentConfig, config };