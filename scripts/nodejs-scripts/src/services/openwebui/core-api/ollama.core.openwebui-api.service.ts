/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class OllamaCoreOpenWebUIApiService {
    async getStatusOllama_Get(
        filters: OpenWebUICore.Filters.GetStatusOllamaGetOp001CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/ollama/`,
        });

        return response.data;
    }

    async getStatusOllama_Head(
        filters: OpenWebUICore.Filters.GetStatusOllamaHeadOp002CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'head',
            url: `/ollama/`,
        });

        return response.data;
    }

    async verifyConnectionOllamaVerifyPost(
        filters: OpenWebUICore.Filters.VerifyConnectionOllamaVerifyPostOp003CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/verify`,
            data: filters.body,
        });

        return response.data;
    }

    async getConfigOllamaConfigGet(
        filters: OpenWebUICore.Filters.GetConfigOllamaConfigGetOp004CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/ollama/config`,
        });

        return response.data;
    }

    async updateConfigOllamaConfigUpdatePost(
        filters: OpenWebUICore.Filters.UpdateConfigOllamaConfigUpdatePostOp005CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/config/update`,
            data: filters.body,
        });

        return response.data;
    }

    async getOllamaTagsOllamaApiTags_UrlIdx_Get(
        filters: OpenWebUICore.Filters.GetOllamaTagsOllamaApiTagsUrlIdxGetOp006CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/ollama/api/tags/${filters.path['url_idx']}`,
        });

        return response.data;
    }

    async getOllamaTagsOllamaApiTagsGet(
        filters: OpenWebUICore.Filters.GetOllamaTagsOllamaApiTagsGetOp007CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/ollama/api/tags`,
            params: filters.query,
        });

        return response.data;
    }

    async getOllamaLoadedModelsOllamaApiPsGet(
        filters: OpenWebUICore.Filters.GetOllamaLoadedModelsOllamaApiPsGetOp008CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/ollama/api/ps`,
        });

        return response.data;
    }

    async getOllamaVersionsOllamaApiVersion_UrlIdx_Get(
        filters: OpenWebUICore.Filters.GetOllamaVersionsOllamaApiVersionUrlIdxGetOp009CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/ollama/api/version/${filters.path['url_idx']}`,
        });

        return response.data;
    }

    async getOllamaVersionsOllamaApiVersionGet(
        filters: OpenWebUICore.Filters.GetOllamaVersionsOllamaApiVersionGetOp010CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/ollama/api/version`,
            params: filters.query,
        });

        return response.data;
    }

    async unloadModelOllamaApiUnloadPost(
        filters: OpenWebUICore.Filters.UnloadModelOllamaApiUnloadPostOp011CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/unload`,
            data: filters.body,
        });

        return response.data;
    }

    async pullModelOllamaApiPull_UrlIdx_Post(
        filters: OpenWebUICore.Filters.PullModelOllamaApiPullUrlIdxPostOp012CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/pull/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async pullModelOllamaApiPullPost(
        filters: OpenWebUICore.Filters.PullModelOllamaApiPullPostOp013CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/pull`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async pushModelOllamaApiPush_UrlIdx_Delete(
        filters: OpenWebUICore.Filters.PushModelOllamaApiPushUrlIdxDeleteOp014CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'delete',
            url: `/ollama/api/push/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async pushModelOllamaApiPushDelete(
        filters: OpenWebUICore.Filters.PushModelOllamaApiPushDeleteOp015CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'delete',
            url: `/ollama/api/push`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async createModelOllamaApiCreate_UrlIdx_Post(
        filters: OpenWebUICore.Filters.CreateModelOllamaApiCreateUrlIdxPostOp016CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/create/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async createModelOllamaApiCreatePost(
        filters: OpenWebUICore.Filters.CreateModelOllamaApiCreatePostOp017CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/create`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async copyModelOllamaApiCopy_UrlIdx_Post(
        filters: OpenWebUICore.Filters.CopyModelOllamaApiCopyUrlIdxPostOp018CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/copy/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async copyModelOllamaApiCopyPost(
        filters: OpenWebUICore.Filters.CopyModelOllamaApiCopyPostOp019CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/copy`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async deleteModelOllamaApiDelete_UrlIdx_Delete(
        filters: OpenWebUICore.Filters.DeleteModelOllamaApiDeleteUrlIdxDeleteOp020CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'delete',
            url: `/ollama/api/delete/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async deleteModelOllamaApiDeleteDelete(
        filters: OpenWebUICore.Filters.DeleteModelOllamaApiDeleteDeleteOp021CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'delete',
            url: `/ollama/api/delete`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async showModelInfoOllamaApiShowPost(
        filters: OpenWebUICore.Filters.ShowModelInfoOllamaApiShowPostOp022CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/show`,
            data: filters.body,
        });

        return response.data;
    }

    async embedOllamaApiEmbed_UrlIdx_Post(
        filters: OpenWebUICore.Filters.EmbedOllamaApiEmbedUrlIdxPostOp023CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/embed/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async embedOllamaApiEmbedPost(
        filters: OpenWebUICore.Filters.EmbedOllamaApiEmbedPostOp024CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/embed`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async embeddingsOllamaApiEmbeddings_UrlIdx_Post(
        filters: OpenWebUICore.Filters.EmbeddingsOllamaApiEmbeddingsUrlIdxPostOp025CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/embeddings/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async embeddingsOllamaApiEmbeddingsPost(
        filters: OpenWebUICore.Filters.EmbeddingsOllamaApiEmbeddingsPostOp026CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/embeddings`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async generateCompletionOllamaApiGenerate_UrlIdx_Post(
        filters: OpenWebUICore.Filters.GenerateCompletionOllamaApiGenerateUrlIdxPostOp027CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/generate/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async generateCompletionOllamaApiGeneratePost(
        filters: OpenWebUICore.Filters.GenerateCompletionOllamaApiGeneratePostOp028CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/generate`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async generateChatCompletionOllamaApiChat_UrlIdx_Post(
        filters: OpenWebUICore.Filters.GenerateChatCompletionOllamaApiChatUrlIdxPostOp029CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/chat/${filters.path['url_idx']}`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async generateChatCompletionOllamaApiChatPost(
        filters: OpenWebUICore.Filters.GenerateChatCompletionOllamaApiChatPostOp030CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/api/chat`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async generateOpenaiCompletionOllamaV1Completions_UrlIdx_Post(
        filters: OpenWebUICore.Filters.GenerateOpenaiCompletionOllamaV1CompletionsUrlIdxPostOp031CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/v1/completions/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async generateOpenaiCompletionOllamaV1CompletionsPost(
        filters: OpenWebUICore.Filters.GenerateOpenaiCompletionOllamaV1CompletionsPostOp032CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/v1/completions`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async generateOpenaiChatCompletionOllamaV1ChatCompletions_UrlIdx_Post(
        filters: OpenWebUICore.Filters.GenerateOpenaiChatCompletionOllamaV1ChatCompletionsUrlIdxPostOp033CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/v1/chat/completions/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async generateOpenaiChatCompletionOllamaV1ChatCompletionsPost(
        filters: OpenWebUICore.Filters.GenerateOpenaiChatCompletionOllamaV1ChatCompletionsPostOp034CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/v1/chat/completions`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async getOpenaiModelsOllamaV1Models_UrlIdx_Get(
        filters: OpenWebUICore.Filters.GetOpenaiModelsOllamaV1ModelsUrlIdxGetOp035CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/ollama/v1/models/${filters.path['url_idx']}`,
        });

        return response.data;
    }

    async getOpenaiModelsOllamaV1ModelsGet(
        filters: OpenWebUICore.Filters.GetOpenaiModelsOllamaV1ModelsGetOp036CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/ollama/v1/models`,
            params: filters.query,
        });

        return response.data;
    }

    async downloadModelOllamaModelsDownload_UrlIdx_Post(
        filters: OpenWebUICore.Filters.DownloadModelOllamaModelsDownloadUrlIdxPostOp037CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/models/download/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async downloadModelOllamaModelsDownloadPost(
        filters: OpenWebUICore.Filters.DownloadModelOllamaModelsDownloadPostOp038CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/models/download`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async uploadModelOllamaModelsUpload_UrlIdx_Post(
        filters: OpenWebUICore.Filters.UploadModelOllamaModelsUploadUrlIdxPostOp039CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/models/upload/${filters.path['url_idx']}`,
            data: filters.body,
        });

        return response.data;
    }

    async uploadModelOllamaModelsUploadPost(
        filters: OpenWebUICore.Filters.UploadModelOllamaModelsUploadPostOp040CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/ollama/models/upload`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }
}
