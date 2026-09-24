/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

interface RequestOptions {
    timeout?: number;
}

export class CoreCoreOpenWebUIApiService {
    async getModelsApiV1ModelsGet(
        filters: OpenWebUICore.Filters.GetModelsApiV1ModelsGetOp321CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/models`,
            params: filters.query,
        });

        return response.data;
    }

    async getModelsApiModelsGet(
        filters: OpenWebUICore.Filters.GetModelsApiModelsGetOp322CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/models`,
            params: filters.query,
        });

        return response.data;
    }

    async getBaseModelsApiModelsBaseGet(
        filters: OpenWebUICore.Filters.GetBaseModelsApiModelsBaseGetOp323CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/models/base`,
        });

        return response.data;
    }

    async embeddingsApiV1EmbeddingsPost(
        filters: OpenWebUICore.Filters.EmbeddingsApiV1EmbeddingsPostOp324CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/embeddings`,
            data: filters.body,
        });

        return response.data;
    }

    async embeddingsApiEmbeddingsPost(
        filters: OpenWebUICore.Filters.EmbeddingsApiEmbeddingsPostOp325CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/embeddings`,
            data: filters.body,
        });

        return response.data;
    }

    async chatCompletionApiV1ChatCompletionsPost(
        filters: OpenWebUICore.Filters.ChatCompletionApiV1ChatCompletionsPostOp326CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/chat/completions`,
            data: filters.body,
        });

        return response.data;
    }

    async chatCompletionApiChatCompletionsPost(
        filters: OpenWebUICore.Filters.ChatCompletionApiChatCompletionsPostOp327CoreOpenWebUIFilters & {
            options?: RequestOptions;
        }
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/chat/completions`,
            data: filters.body,
            timeout: filters.options?.timeout,
        });

        return response.data;
    }

    async chatCompletedApiChatCompletedPost(
        filters: OpenWebUICore.Filters.ChatCompletedApiChatCompletedPostOp328CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/chat/completed`,
            data: filters.body,
        });

        return response.data;
    }

    async chatActionApiChatActions_ActionId_Post(
        filters: OpenWebUICore.Filters.ChatActionApiChatActionsActionIdPostOp329CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/chat/actions/${filters.path['action_id']}`,
            data: filters.body,
        });

        return response.data;
    }

    async stopTaskEndpointApiTasksStop_TaskId_Post(
        filters: OpenWebUICore.Filters.StopTaskEndpointApiTasksStopTaskIdPostOp330CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/tasks/stop/${filters.path['task_id']}`,
        });

        return response.data;
    }

    async listTasksEndpointApiTasksGet(
        filters: OpenWebUICore.Filters.ListTasksEndpointApiTasksGetOp331CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/tasks`,
        });

        return response.data;
    }

    async listTasksByChatIdEndpointApiTasksChat_ChatId_Get(
        filters: OpenWebUICore.Filters.ListTasksByChatIdEndpointApiTasksChatChatIdGetOp332CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/tasks/chat/${filters.path['chat_id']}`,
        });

        return response.data;
    }

    async getAppConfigApiConfigGet(
        filters: OpenWebUICore.Filters.GetAppConfigApiConfigGetOp333CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/config`,
        });

        return response.data;
    }

    async getWebhookUrlApiWebhookGet(
        filters: OpenWebUICore.Filters.GetWebhookUrlApiWebhookGetOp334CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/webhook`,
        });

        return response.data;
    }

    async updateWebhookUrlApiWebhookPost(
        filters: OpenWebUICore.Filters.UpdateWebhookUrlApiWebhookPostOp335CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/webhook`,
            data: filters.body,
        });

        return response.data;
    }

    async getAppVersionApiVersionGet(
        filters: OpenWebUICore.Filters.GetAppVersionApiVersionGetOp336CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/version`,
        });

        return response.data;
    }

    async getAppLatestReleaseVersionApiVersionUpdatesGet(
        filters: OpenWebUICore.Filters.GetAppLatestReleaseVersionApiVersionUpdatesGetOp337CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/version/updates`,
        });

        return response.data;
    }

    async getAppChangelogApiChangelogGet(
        filters: OpenWebUICore.Filters.GetAppChangelogApiChangelogGetOp338CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/changelog`,
        });

        return response.data;
    }

    async getCurrentUsageApiUsageGet(
        filters: OpenWebUICore.Filters.GetCurrentUsageApiUsageGetOp339CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/usage`,
        });

        return response.data;
    }

    async oauthClientAuthorizeOauthClients_ClientId_AuthorizeGet(
        filters: OpenWebUICore.Filters.OauthClientAuthorizeOauthClientsClientIdAuthorizeGetOp340CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/oauth/clients/${filters.path['client_id']}/authorize`,
        });

        return response.data;
    }

    async oauthClientCallbackOauthClients_ClientId_CallbackGet(
        filters: OpenWebUICore.Filters.OauthClientCallbackOauthClientsClientIdCallbackGetOp341CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/oauth/clients/${filters.path['client_id']}/callback`,
        });

        return response.data;
    }

    async oauthLoginOauth_Provider_LoginGet(
        filters: OpenWebUICore.Filters.OauthLoginOauthProviderLoginGetOp342CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/oauth/${filters.path['provider']}/login`,
        });

        return response.data;
    }

    async oauthLoginCallbackOauth_Provider_CallbackGet(
        filters: OpenWebUICore.Filters.OauthLoginCallbackOauthProviderCallbackGetOp343CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/oauth/${filters.path['provider']}/callback`,
        });

        return response.data;
    }

    async oauthLoginCallbackOauth_Provider_LoginCallbackGet(
        filters: OpenWebUICore.Filters.OauthLoginCallbackOauthProviderLoginCallbackGetOp344CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/oauth/${filters.path['provider']}/login/callback`,
        });

        return response.data;
    }

    async getManifestJsonManifestJsonGet(
        filters: OpenWebUICore.Filters.GetManifestJsonManifestJsonGetOp345CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/manifest.json`,
        });

        return response.data;
    }

    async getOpensearchXmlOpensearchXmlGet(
        filters: OpenWebUICore.Filters.GetOpensearchXmlOpensearchXmlGetOp346CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/opensearch.xml`,
        });

        return response.data;
    }

    async healthcheckHealthGet(
        filters: OpenWebUICore.Filters.HealthcheckHealthGetOp347CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/health`,
        });

        return response.data;
    }

    async healthcheckWithDbHealthDbGet(filters: Record<string, never> = {}): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/health/db`,
        });

        return response.data;
    }

    async serveCacheFileCache_Path_Get(
        filters: OpenWebUICore.Filters.ServeCacheFileCachePathGetOp349CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/cache/${filters.path['path']}`,
        });

        return response.data;
    }
}
