export interface GitHubAppPermissions {
    issues?: string;
    checks?: string;
    metadata?: string;
    contents?: string;
    deployments?: string;

    [permissionName: string]: string | undefined;
}
