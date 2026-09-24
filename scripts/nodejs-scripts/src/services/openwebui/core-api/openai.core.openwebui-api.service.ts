/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class OpenaiCoreOpenWebUIApiService {
    async getConfigOpenaiConfigGet(
        filters: OpenWebUICore.Filters.GetConfigOpenaiConfigGetOp041CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/openai/config`,
        });

        return response.data;
    }

    async updateConfigOpenaiConfigUpdatePost(
        filters: OpenWebUICore.Filters.UpdateConfigOpenaiConfigUpdatePostOp042CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/openai/config/update`,
            data: filters.body,
        });

        return response.data;
    }

    async speechOpenaiAudioSpeechPost(
        filters: OpenWebUICore.Filters.SpeechOpenaiAudioSpeechPostOp043CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/openai/audio/speech`,
        });

        return response.data;
    }

    async getModelsOpenaiModels_UrlIdx_Get(
        filters: OpenWebUICore.Filters.GetModelsOpenaiModelsUrlIdxGetOp044CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/openai/models/${filters.path['url_idx']}`,
        });

        return response.data;
    }

    async getModelsOpenaiModelsGet(
        filters: OpenWebUICore.Filters.GetModelsOpenaiModelsGetOp045CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/openai/models`,
            params: filters.query,
        });

        return response.data;
    }

    async verifyConnectionOpenaiVerifyPost(
        filters: OpenWebUICore.Filters.VerifyConnectionOpenaiVerifyPostOp046CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/openai/verify`,
            data: filters.body,
        });

        return response.data;
    }

    async generateChatCompletionOpenaiChatCompletionsPost(
        filters: OpenWebUICore.Filters.GenerateChatCompletionOpenaiChatCompletionsPostOp047CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/openai/chat/completions`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async proxyOpenai_Path_Delete(
        filters: OpenWebUICore.Filters.ProxyOpenaiPathDeleteOp048CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/openai/${filters.path['path']}`,
        });

        return response.data;
    }

    async proxyOpenai_Path_Delete2(
        filters: OpenWebUICore.Filters.ProxyOpenaiPathDelete2Op049CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/openai/${filters.path['path']}`,
        });

        return response.data;
    }

    async proxyOpenai_Path_Delete3(
        filters: OpenWebUICore.Filters.ProxyOpenaiPathDelete3Op050CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'put',
            url: `/openai/${filters.path['path']}`,
        });

        return response.data;
    }

    async proxyOpenai_Path_Delete4(
        filters: OpenWebUICore.Filters.ProxyOpenaiPathDelete4Op051CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'delete',
            url: `/openai/${filters.path['path']}`,
        });

        return response.data;
    }
}
