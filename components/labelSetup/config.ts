type Label = {
    name: string,
    description: string,
    color: string,
    keywords?: string[]
}

class LabelSetupComponentConfig {
    labels: Label[];
    customLabels: Label[];
    init(): void {
        this.labels.forEach(label => {
            let customLabelIndex = this.customLabels.findIndex(l => l.name === label.name);
            if (customLabelIndex < 0) return;
            let customLabel = this.customLabels[customLabelIndex];
            if (customLabel.color) label.color = customLabel.color;
            if (customLabel.description) label.description = customLabel.description;
            if (customLabel.keywords) label.keywords = customLabel.keywords;
            this.customLabels.splice(customLabelIndex, 1);
        });
        this.labels = this.labels.concat(this.customLabels);
    }
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
        name: "kind/feature",
        description: "Category issues or prs related to feature request.",
        color: "c7def8",
        keywords: [ "feature", "feature request", "feature-request", "feature_request" ]
    },
    {
        name: "kind/enhancement",
        description: "Category issues or prs related to enhancement.",
        color: "93edba",
        keywords: [ "enhancement", "refactor" ]
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
        name: "priority/urgent",
        description: "Most important, need to be worked on as soon as possible",
        color: "e11d21"
    },
    {
        name: "priority/high",
        description: "Very important, need to be worked with soon but not very urgent",
        color: "eb6420"
    },
    {
        name: "priority/normal",
        description: "normal , may need sometime to complete.",
        color: "f7be99"
    },
    {
        name: "priority/low",
        description: "Not important, can be finish by new contributors.",
        color: "67a8f7"
    },

    // Area
    {
        name: "area/document",
        description: "Category issues or prs related to document.",
        color: "0366d6",
        keywords: [ "doc", "docs", "documents", "document" ]
    },

    // weekly report
    {
        name: "weekly-report",
        description: "Auto generated weekly report.",
        color: "0366d6",
        keywords: [ "weeklyreport", "weekly report", "weekly-report" ]
    }
];

export { Label, LabelSetupComponentConfig, config };