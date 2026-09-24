import { generalUtilities } from './general.utilities.ts';

interface RateLimitError {
    status?: number;
    response?: {
        headers?: Record<string, string | number | undefined>;
    };
}

const DEFAULT_ERROR_MESSAGE = 'Unknown error';
const DEFAULT_RATE_LIMIT_WAIT_MS = 30_000;

class ErrorUtilities {
    getErrorMessage(error: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
        return error instanceof Error ? error.message : fallback;
    }

    async handleGitHubRateLimit(error: unknown, maxWaitMs = DEFAULT_RATE_LIMIT_WAIT_MS) {
        const waitMs = this.getRateLimitWaitMs(error, maxWaitMs);
        if (waitMs === undefined || waitMs <= 0) return false;

        await generalUtilities.sleep(waitMs);
        return true;
    }

    private getRateLimitWaitMs(error: unknown, maxWaitMs: number): number | undefined {
        const rateLimitError = error as RateLimitError;
        if (rateLimitError?.status !== 403) return undefined;

        const remaining = rateLimitError.response?.headers?.['x-ratelimit-remaining'];
        const reset = rateLimitError.response?.headers?.['x-ratelimit-reset'];
        if (remaining !== '0' || !reset) return undefined;

        const waitMs = Math.max(0, Number(reset) * 1000 - Date.now());
        return Math.min(waitMs, maxWaitMs);
    }
}

export const errorUtilities = new ErrorUtilities();
