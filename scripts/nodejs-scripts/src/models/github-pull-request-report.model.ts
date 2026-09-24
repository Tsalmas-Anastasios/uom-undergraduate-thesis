type TimestampValue = string | Date;

export interface GitHubPullRequestReportJob {
    id: number;
    recId: string;
    usernames: string[];
    labelsRequested: string[];
    effectiveLabels: string[];
    completed: boolean;
    deleted: boolean;
    startedAt?: TimestampValue | undefined;
    completedAt?: TimestampValue | undefined;
    errorMessage?: string | undefined;
    reportFilePath?: string | undefined;
    createdAt: TimestampValue;
    updatedAt: TimestampValue;
}

export type GitHubPullRequestReportJobCreation = Omit<
    GitHubPullRequestReportJob,
    | 'id'
    | 'recId'
    | 'completed'
    | 'deleted'
    | 'startedAt'
    | 'completedAt'
    | 'errorMessage'
    | 'reportFilePath'
    | 'createdAt'
    | 'updatedAt'
>;

export interface PullRequestsCountMap {
    total: number;
    [key: string]: number;
}

export interface GitHubPullRequestReportResult {
    id: number;
    recId: string;
    jobId: number;
    repositoryName: string;
    username: string;
    repositoryUrl: string;
    pullRequests: PullRequestsCountMap;
    deleted: boolean;
    createdAt: TimestampValue;
    updatedAt: TimestampValue;
}

export type GitHubPullRequestReportResultCreation = Omit<
    GitHubPullRequestReportResult,
    'id' | 'recId' | 'createdAt' | 'updatedAt'
>;

export interface GitHubPullRequestReportRepository {
    id: number;
    recId: string;
    jobId: number;
    repositoryName: string;
    username: string;
    investigated: boolean;
    deleted: boolean;
    createdAt: TimestampValue;
    updatedAt: TimestampValue;
}

export type GitHubPullRequestReportRepositoryCreation = Omit<
    GitHubPullRequestReportRepository,
    'id' | 'recId' | 'createdAt' | 'updatedAt'
>;

export interface GitHubPullRequestClassificationJob {
    id: number;
    recId: string;
    usernames: string[];
    modelName: string;
    completed: boolean;
    deleted: boolean;
    startedAt?: TimestampValue | undefined;
    completedAt?: TimestampValue | undefined;
    errorMessage?: string | undefined;
    reportFilePath?: string | undefined;
    createdAt: TimestampValue;
    updatedAt: TimestampValue;
}

export type GitHubPullRequestClassificationJobCreation = Omit<
    GitHubPullRequestClassificationJob,
    | 'id'
    | 'recId'
    | 'completed'
    | 'deleted'
    | 'startedAt'
    | 'completedAt'
    | 'errorMessage'
    | 'reportFilePath'
    | 'createdAt'
    | 'updatedAt'
>;

export interface GitHubPullRequestClassificationRepository {
    id: number;
    recId: string;
    jobId: number;
    repositoryName: string;
    username: string;
    investigated: boolean;
    deleted: boolean;
    createdAt: TimestampValue;
    updatedAt: TimestampValue;
}

export type GitHubPullRequestClassificationRepositoryCreation = Omit<
    GitHubPullRequestClassificationRepository,
    'id' | 'recId' | 'createdAt' | 'updatedAt'
>;

export interface GitHubPullRequestClassificationResult {
    id: number;
    recId: string;
    jobId: number;
    username: string;
    repositoryName: string;
    repositoryUrl: string;
    pullRequestUrl: string;
    pullRequestTitle: string;
    pullRequestNumber: number;
    category: string[];
    overallConfidence: number;
    codeQualityAffected: number;
    codeQualityConfidence: number;
    codeSecurityAffected: number;
    codeSecurityConfidence: number;
    softwareQualityAffected: number;
    softwareQualityConfidence: number;
    softwareSecurityAffected: number;
    softwareSecurityConfidence: number;
    deleted: boolean;
    createdAt: TimestampValue;
    updatedAt: TimestampValue;
}

export type GitHubPullRequestClassificationResultCreation = Omit<
    GitHubPullRequestClassificationResult,
    'id' | 'recId' | 'createdAt' | 'updatedAt'
>;

export interface GitHubPullRequestSonarqubeJob {
    id: number;
    recId: string;
    classificationJobId: number;
    onlyMerged: boolean;
    includeClosedUnmerged: boolean;
    maxPullRequestsPerRepository?: number | undefined;
    cloneRootPath?: string | undefined;
    completed: boolean;
    deleted: boolean;
    startedAt?: TimestampValue | undefined;
    completedAt?: TimestampValue | undefined;
    errorMessage?: string | undefined;
    createdAt: TimestampValue;
    updatedAt: TimestampValue;
}

export type GitHubPullRequestSonarqubeJobCreation = Omit<
    GitHubPullRequestSonarqubeJob,
    | 'id'
    | 'recId'
    | 'completed'
    | 'deleted'
    | 'startedAt'
    | 'completedAt'
    | 'errorMessage'
    | 'createdAt'
    | 'updatedAt'
>;

export interface GitHubPullRequestSonarqubeRepository {
    id: number;
    recId: string;
    jobId: number;
    sourceClassificationJobId: number;
    sourceClassificationRepositoryId?: number | undefined;
    username: string;
    repositoryName: string;
    repositoryUrl: string;
    localClonePath?: string | undefined;
    defaultBranch?: string | undefined;
    investigated: boolean;
    deleted: boolean;
    createdAt: TimestampValue;
    updatedAt: TimestampValue;
}

export type GitHubPullRequestSonarqubeRepositoryCreation = Omit<
    GitHubPullRequestSonarqubeRepository,
    'id' | 'recId' | 'createdAt' | 'updatedAt'
>;

export interface GitHubPullRequestSonarqubeResult {
    id: number;
    recId: string;
    jobId: number;
    repositoryJobId: number;
    classificationJobId: number;
    username: string;
    repositoryName: string;
    repositoryUrl: string;
    localClonePath?: string | undefined;
    pullRequestNumber: number;
    pullRequestTitle: string;
    pullRequestUrl: string;
    pullRequestState: string;
    pullRequestMerged: boolean;
    baseBranchName?: string | undefined;
    headBranchName?: string | undefined;
    analysisRole: string;
    commitHash: string;
    commitSequence: number;
    firstPullRequestCommitHash?: string | undefined;
    closingCommitHash?: string | undefined;
    sonarProjectKey: string;
    sonarProjectName: string;
    sonarDashboardUrl?: string | undefined;
    sonarTaskId?: string | undefined;
    sonarAnalysisId?: string | undefined;
    qualityGateStatus?: string | undefined;
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    securityHotspots: number;
    coverage?: number | undefined;
    duplicatedLinesDensity?: number | undefined;
    ncloc: number;
    complexity: number;
    cognitiveComplexity: number;
    softwareQualityReliabilityIssues: number;
    softwareQualityMaintainabilityIssues: number;
    softwareQualitySecurityIssues: number;
    measuresJson: Record<string, unknown>;
    issuesSummaryJson: Record<string, unknown>;
    securityHotspotsSummaryJson: Record<string, unknown>;
    qualityGateJson: Record<string, unknown>;
    scannerContextJson: Record<string, unknown>;
    deleted: boolean;
    createdAt: TimestampValue;
    updatedAt: TimestampValue;
}

export type GitHubPullRequestSonarqubeResultCreation = Omit<
    GitHubPullRequestSonarqubeResult,
    'id' | 'recId' | 'createdAt' | 'updatedAt'
>;
