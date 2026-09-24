import { CoreCoreOpenWebUIApiService } from './core-api/core.core.openwebui-api.service.ts';

interface CompleteParameters {
    model: string;
    systemPrompt: string;
    userPrompt: string;
    webSearch?: boolean;
    temperature?: number;
    maxTokens?: number;
}

interface CompleteResponse {
    raw: unknown;
    text: string;
}

const coreApiService = new CoreCoreOpenWebUIApiService();

const OPENWEBUI_CHAT_COMPLETION_TIMEOUT_MS =
    Number(process.env.OPENWEBUI__CORE_CHAT_COMPLETIONS__TIMEOUT) || 500_000_000;

class OpenWebUIChatCompletionsService {
    async complete(parameters: CompleteParameters): Promise<CompleteResponse> {
        const payload: Record<string, unknown> = {
            model: parameters.model,
            stream: false,
            messages: [
                { role: 'system', content: parameters.systemPrompt },
                { role: 'user', content: parameters.userPrompt },
            ],
            features: {
                ['web_search']: parameters.webSearch !== false,
            },
        };

        if (typeof parameters.temperature === 'number') {
            payload.temperature = parameters.temperature;
        }

        if (typeof parameters.maxTokens === 'number') {
            payload['max_tokens'] = parameters.maxTokens;
        }

        let attempt = 0;
        while (attempt < 3) {
            attempt += 1;
            try {
                const raw = await coreApiService.chatCompletionApiChatCompletionsPost({
                    body: payload,
                    options: { timeout: OPENWEBUI_CHAT_COMPLETION_TIMEOUT_MS },
                });
                const text = this.extractMessageText(raw);
                return { raw, text };
            } catch (error) {
                if (!this.shouldRetry(error) || attempt >= 3) {
                    throw error;
                }

                await new Promise((resolve) => {
                    setTimeout(resolve, attempt * 1000);
                });
            }
        }

        throw new Error('OpenWebUI completion failed after retries.');
    }

    private shouldRetry(error: unknown): boolean {
        const axiosLikeError = error as { response?: { status?: number } } | undefined;
        if (!axiosLikeError) {
            return false;
        }

        if (!axiosLikeError.response) {
            return true;
        }

        return Number(axiosLikeError.response.status ?? 0) >= 500;
    }

    private extractMessageText(raw: unknown): string {
        const response = raw as Record<string, unknown>;
        const choices = Array.isArray(response.choices)
            ? (response.choices as Record<string, unknown>[])
            : undefined;

        const firstChoice = choices?.[0];
        const message = firstChoice?.message as Record<string, unknown> | undefined;
        if (typeof message?.content === 'string') {
            console.log('[COMPLETION MESSAGE]', message.content);
            return message.content;
        }

        const delta = firstChoice?.delta as Record<string, unknown> | undefined;
        if (typeof delta?.content === 'string') {
            console.log('[COMPLETION MESSAGE]', delta.content);
            return delta.content;
        }

        if (typeof response.message === 'string') {
            console.log('[COMPLETION MESSAGE]', response.message);
            return response.message;
        }

        if (typeof response.content === 'string') {
            console.log('[COMPLETION MESSAGE]', response.content);
            return response.content;
        }

        throw new Error(
            `Unable to extract completion text from OpenWebUI response. Keys: ${Object.keys(response).join(', ')}`
        );
    }
}

export const openWebUIChatCompletionsService = new OpenWebUIChatCompletionsService();
