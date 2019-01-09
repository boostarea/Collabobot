export class CommentData {
    id: number;
    body: string;
    author: UserData;
}

export class IssueData {
    id: number;
    number: number;
    title: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    closedAt: Date;
    author: UserData;
    comments: CommentData[];
}

export class PullRequestData {
    id: number;
    number: number;
    title: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    closedAt: Date;
    mergedAt: Date;
    author: UserData;
    url: string;
    comments: CommentData[];
}

export class UserData {
    id: number;
    login: string;
    company: string;
    location: string;
    email: string;
}

export class UserTimeData {
    user: UserData;
    time: Date;
}

export class RepoData {
    name: string;
    fullName: string;
    forks: UserTimeData[];
    stars: UserTimeData[];
    contributors: UserTimeData[];
    watches: UserData[];
    issues: IssueData[];
    pullRequests: PullRequestData[];
}