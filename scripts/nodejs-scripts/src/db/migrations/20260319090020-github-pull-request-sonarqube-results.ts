import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('github_pull_request_sonarqube_results', {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        recId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
        },
        jobId: { type: DataTypes.INTEGER, allowNull: false },
        repositoryJobId: { type: DataTypes.INTEGER, allowNull: false },
        classificationJobId: { type: DataTypes.INTEGER, allowNull: false },
        username: { type: DataTypes.STRING(255), allowNull: false },
        repositoryName: { type: DataTypes.STRING(255), allowNull: false },
        repositoryUrl: { type: DataTypes.TEXT, allowNull: false },
        localClonePath: { type: DataTypes.TEXT, allowNull: true },
        pullRequestNumber: { type: DataTypes.INTEGER, allowNull: false },
        pullRequestTitle: { type: DataTypes.TEXT, allowNull: false },
        pullRequestUrl: { type: DataTypes.TEXT, allowNull: false },
        pullRequestState: { type: DataTypes.STRING(50), allowNull: false },
        pullRequestMerged: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        baseBranchName: { type: DataTypes.STRING(255), allowNull: true },
        headBranchName: { type: DataTypes.STRING(255), allowNull: true },
        analysisRole: { type: DataTypes.STRING(50), allowNull: false },
        commitHash: { type: DataTypes.STRING(255), allowNull: false },
        commitSequence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        firstPullRequestCommitHash: { type: DataTypes.STRING(255), allowNull: true },
        closingCommitHash: { type: DataTypes.STRING(255), allowNull: true },
        sonarProjectKey: { type: DataTypes.STRING(255), allowNull: false },
        sonarProjectName: { type: DataTypes.STRING(255), allowNull: false },
        sonarDashboardUrl: { type: DataTypes.TEXT, allowNull: true },
        sonarTaskId: { type: DataTypes.STRING(255), allowNull: true },
        sonarAnalysisId: { type: DataTypes.STRING(255), allowNull: true },
        qualityGateStatus: { type: DataTypes.STRING(100), allowNull: true },
        bugs: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        vulnerabilities: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        codeSmells: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        securityHotspots: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        coverage: { type: DataTypes.FLOAT, allowNull: true },
        duplicatedLinesDensity: { type: DataTypes.FLOAT, allowNull: true },
        ncloc: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        complexity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        cognitiveComplexity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        softwareQualityReliabilityIssues: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        softwareQualityMaintainabilityIssues: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        softwareQualitySecurityIssues: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        measuresJson: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        issuesSummaryJson: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        securityHotspotsSummaryJson: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        qualityGateJson: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        scannerContextJson: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: queryInterface.sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: queryInterface.sequelize.literal('CURRENT_TIMESTAMP'),
        },
    });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('github_pull_request_sonarqube_results');
}
