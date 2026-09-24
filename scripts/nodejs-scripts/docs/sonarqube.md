# GitHub Pull Requests SonarQube Pipeline

## Local SonarQube setup

1. Start SonarQube locally (example using Docker):

```bash
docker run --name sonarqube -p 9000:9000 sonarqube:lts-community
```

2. Generate a SonarQube user token from SonarQube UI (`My Account -> Security`).
3. Install SonarScanner CLI on the machine running this backend, or set `SONARQUBE_SCANNER_BIN` to its binary path.

## Required environment variables

- `SONARQUBE_URL` (e.g. `http://localhost:9000`)
- `SONARQUBE_TOKEN`
- `SONARQUBE_CLONE_ROOT` (local clone archive root, default fallback: `archives/sonarqube`)
- `SONARQUBE_WAIT_TIMEOUT_SECONDS` (default `120`)
- `GITHUB_PR_SONARQUBE_JOB_INTERVAL_MS` (default `60000`)
- `GITHUB_PR_SONARQUBE_JOB_STALE_MS` (default `900000`)
- `GITHUB_PR_SONARQUBE_MAX_PRS_PER_REPOSITORY` (default `200`)
- `SONARQUBE_SCANNER_BIN` (optional, default `sonar-scanner`)

## API routes

- `POST /github/pull-requests/sonarqube`
- `GET /github/pull-requests/sonarqube/jobs`
- `GET /github/pull-requests/sonarqube/jobs/:recId`
- `PATCH /github/pull-requests/sonarqube/jobs/:recId/delete`

### Queue payload example

```json
{
    "classificationJobId": 5,
    "onlyMerged": false,
    "includeClosedUnmerged": true,
    "maxPullRequestsPerRepository": 100,
    "cloneRootPath": "/data/gh-archives"
}
```

## Data source and progress behavior

- Repositories are copied from `github_pull_request_classification_repositories` where `jobId = classificationJobId`.
- The job runner processes repositories sequentially and marks each `github_pull_request_sonarqube_repositories.investigated = true` when done.
- Local clones are retained permanently on disk and are never automatically deleted.

## Pull request coverage and filtering

- Merged PRs are included.
- Closed but unmerged PRs are included when `includeClosedUnmerged = true` (default).
- If `onlyMerged = true`, only merged PRs are processed.

## Commit snapshot resolution

For each PR:

- **Base snapshot**: oldest PR commit -> first parent SHA.
- **Closed snapshot**:
    - merged PR: `merge_commit_sha`
    - closed-unmerged PR: PR head SHA

Each PR normally creates two rows in `github_pull_request_sonarqube_results`:

- `analysisRole = "pr_base"`
- `analysisRole = "pr_closed"`

`commitSequence` is always stored as `0` for both rows.

## Stored SonarQube output

For each analyzed snapshot, persisted fields include:

- Quality gate status
- Bugs / vulnerabilities / code smells / security hotspots
- Coverage / duplicated lines density
- NCLOC / complexity / cognitive complexity
- Software-quality reliability / maintainability / security issue counts
- Raw payload JSON: measures, issues summary, hotspot summary, quality gate, scanner context
