interface ClassifiedOutput {
    category: string[];
    percentage: number;
    affectedCategories: {
        codeQuality: { affectedPercentage: number; percentage: number };
        codeSecurity: { affectedPercentage: number; percentage: number };
        softwareQuality: { affectedPercentage: number; percentage: number };
        softwareSecurity: { affectedPercentage: number; percentage: number };
    };
}

class PullRequestsClassificationParserService {
    private readonly failSafeResult: ClassifiedOutput = {
        category: [],
        percentage: 0,
        affectedCategories: {
            codeQuality: { affectedPercentage: 0, percentage: 0 },
            codeSecurity: { affectedPercentage: 0, percentage: 0 },
            softwareQuality: { affectedPercentage: 0, percentage: 0 },
            softwareSecurity: { affectedPercentage: 0, percentage: 0 },
        },
    };

    parse(rawText: string): ClassifiedOutput {
        if (!rawText) {
            return this.failSafeResult;
        }

        try {
            const parsed = JSON.parse(rawText) as Partial<ClassifiedOutput>;
            return {
                category: Array.isArray(parsed.category)
                    ? parsed.category.filter(
                          (category): category is string => typeof category === 'string'
                      )
                    : [],
                percentage: this.normalize(parsed.percentage),
                affectedCategories: {
                    codeQuality: {
                        affectedPercentage: this.normalize(
                            parsed.affectedCategories?.codeQuality?.affectedPercentage
                        ),
                        percentage: this.normalize(
                            parsed.affectedCategories?.codeQuality?.percentage
                        ),
                    },
                    codeSecurity: {
                        affectedPercentage: this.normalize(
                            parsed.affectedCategories?.codeSecurity?.affectedPercentage
                        ),
                        percentage: this.normalize(
                            parsed.affectedCategories?.codeSecurity?.percentage
                        ),
                    },
                    softwareQuality: {
                        affectedPercentage: this.normalize(
                            parsed.affectedCategories?.softwareQuality?.affectedPercentage
                        ),
                        percentage: this.normalize(
                            parsed.affectedCategories?.softwareQuality?.percentage
                        ),
                    },
                    softwareSecurity: {
                        affectedPercentage: this.normalize(
                            parsed.affectedCategories?.softwareSecurity?.affectedPercentage
                        ),
                        percentage: this.normalize(
                            parsed.affectedCategories?.softwareSecurity?.percentage
                        ),
                    },
                },
            };
        } catch {
            return this.failSafeResult;
        }
    }

    private normalize(value: unknown): number {
        const numeric = Number(value);
        if (Number.isNaN(numeric)) {
            return 0;
        }

        return Math.max(0, Math.min(100, Math.round(numeric)));
    }
}

export const pullRequestsClassificationParserService =
    new PullRequestsClassificationParserService();
