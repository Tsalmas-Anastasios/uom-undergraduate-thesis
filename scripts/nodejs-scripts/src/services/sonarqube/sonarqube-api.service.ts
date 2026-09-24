import axios, { AxiosInstance } from 'axios';

import { generalUtilities } from '../../utils/index.utilities.ts';

interface SonarqubeMetric {
    metric?: string;
    value?: string;
}

interface SonarqubeComponentMeasuresResponse {
    component?: {
        measures?: SonarqubeMetric[];
    };
}

export interface SonarqubeSummary {
    qualityGateStatus?: string;
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    securityHotspots: number;
    coverage?: number;
    duplicatedLinesDensity?: number;
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
    sonarAnalysisId?: string;
}

export class SonarqubeApiService {
    private readonly client: AxiosInstance;

    constructor() {
        const sonarHostUrl = process.env.SONARQUBE_URL || '';
        const sonarToken = process.env.SONARQUBE_TOKEN || '';

        this.client = axios.create({
            baseURL: sonarHostUrl,
            timeout: 30_000,
            auth: {
                username: sonarToken,
                password: '',
            },
        });
    }

    public async waitForTask(taskId: string): Promise<{ analysisId?: string }> {
        const timeoutRaw = Number(process.env.SONARQUBE_WAIT_TIMEOUT_SECONDS ?? '120');
        const timeoutSeconds = Number.isNaN(timeoutRaw) ? 120 : timeoutRaw;
        const startedAt = Date.now();

        while (true) {
            const response = await this.client.get('/api/ce/task', { params: { id: taskId } });
            const task = response?.data?.task;
            const status = String(task?.status || '').toUpperCase();
            if (status === 'SUCCESS') {
                return { analysisId: task?.analysisId };
            }

            if (status === 'FAILED' || status === 'CANCELED') {
                throw new Error(`SonarQube task ${taskId} ended with status ${status}.`);
            }

            if ((Date.now() - startedAt) / 1000 > timeoutSeconds) {
                throw new Error(`Timed out while waiting for SonarQube task ${taskId}.`);
            }

            await generalUtilities.sleep(2_000);
        }
    }

    public async getSummary(parameters: {
        projectKey: string;
        branch?: string;
    }): Promise<SonarqubeSummary> {
        const metricKeys = [
            'bugs',
            'vulnerabilities',
            'code_smells',
            'security_hotspots',
            'coverage',
            'duplicated_lines_density',
            'ncloc',
            'complexity',
            'cognitive_complexity',
            'software_quality_reliability_issues',
            'software_quality_maintainability_issues',
            'software_quality_security_issues',
        ];

        const query = { component: parameters.projectKey, metricKeys: metricKeys.join(',') };
        const [measuresResponse, qualityGateResponse, issuesResponse, hotspotsResponse] =
            await Promise.all([
                this.client.get<SonarqubeComponentMeasuresResponse>('/api/measures/component', {
                    params: query,
                }),
                this.client.get('/api/qualitygates/project_status', {
                    params: { projectKey: parameters.projectKey },
                }),
                this.client.get('/api/issues/search', {
                    params: {
                        componentKeys: parameters.projectKey,
                        ps: 1,
                        facets: 'types,severities',
                    },
                }),
                this.client.get('/api/hotspots/search', {
                    params: { projectKey: parameters.projectKey, ps: 1 },
                }),
            ]);

        const measureMap = new Map<string, string>();
        for (const measure of measuresResponse.data?.component?.measures || []) {
            if (measure.metric && measure.value) {
                measureMap.set(measure.metric, measure.value);
            }
        }

        const toInt = (key: string): number => Number.parseInt(measureMap.get(key) || '0', 10) || 0;
        const toFloat = (key: string): number | undefined => {
            const value = measureMap.get(key);
            if (value === undefined || value === null || value === '') return undefined;
            const parsed = Number.parseFloat(value);
            return Number.isNaN(parsed) ? undefined : parsed;
        };

        return {
            qualityGateStatus: qualityGateResponse.data?.projectStatus?.status,
            bugs: toInt('bugs'),
            vulnerabilities: toInt('vulnerabilities'),
            codeSmells: toInt('code_smells'),
            securityHotspots: toInt('security_hotspots'),
            coverage: toFloat('coverage'),
            duplicatedLinesDensity: toFloat('duplicated_lines_density'),
            ncloc: toInt('ncloc'),
            complexity: toInt('complexity'),
            cognitiveComplexity: toInt('cognitive_complexity'),
            softwareQualityReliabilityIssues: toInt('software_quality_reliability_issues'),
            softwareQualityMaintainabilityIssues: toInt('software_quality_maintainability_issues'),
            softwareQualitySecurityIssues: toInt('software_quality_security_issues'),
            measuresJson: measuresResponse.data as Record<string, unknown>,
            issuesSummaryJson: issuesResponse.data as Record<string, unknown>,
            securityHotspotsSummaryJson: hotspotsResponse.data as Record<string, unknown>,
            qualityGateJson: qualityGateResponse.data as Record<string, unknown>,
        };
    }
}

export const sonarqubeApiService = new SonarqubeApiService();
