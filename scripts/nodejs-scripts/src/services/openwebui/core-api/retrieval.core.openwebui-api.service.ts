/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class RetrievalCoreOpenWebUIApiService {
    async getStatusApiV1Retrieval_Get(
        filters: OpenWebUICore.Filters.GetStatusApiV1RetrievalGetOp083CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/retrieval/`,
        });

        return response.data;
    }

    async getEmbeddingConfigApiV1RetrievalEmbeddingGet(
        filters: OpenWebUICore.Filters.GetEmbeddingConfigApiV1RetrievalEmbeddingGetOp084CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/retrieval/embedding`,
        });

        return response.data;
    }

    async updateEmbeddingConfigApiV1RetrievalEmbeddingUpdatePost(
        filters: OpenWebUICore.Filters.UpdateEmbeddingConfigApiV1RetrievalEmbeddingUpdatePostOp085CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/retrieval/embedding/update`,
            data: filters.body,
        });

        return response.data;
    }

    async getRagConfigApiV1RetrievalConfigGet(
        filters: OpenWebUICore.Filters.GetRagConfigApiV1RetrievalConfigGetOp086CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/retrieval/config`,
        });

        return response.data;
    }

    async updateRagConfigApiV1RetrievalConfigUpdatePost(
        filters: OpenWebUICore.Filters.UpdateRagConfigApiV1RetrievalConfigUpdatePostOp087CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/retrieval/config/update`,
            data: filters.body,
        });

        return response.data;
    }

    async processFileApiV1RetrievalProcessFilePost(
        filters: OpenWebUICore.Filters.ProcessFileApiV1RetrievalProcessFilePostOp088CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/retrieval/process/file`,
            data: filters.body,
        });

        return response.data;
    }

    async processTextApiV1RetrievalProcessTextPost(
        filters: OpenWebUICore.Filters.ProcessTextApiV1RetrievalProcessTextPostOp089CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/retrieval/process/text`,
            data: filters.body,
        });

        return response.data;
    }

    async processWebApiV1RetrievalProcessWebPost(
        filters: OpenWebUICore.Filters.ProcessWebApiV1RetrievalProcessWebPostOp090CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/retrieval/process/web`,
            data: filters.body,
        });

        return response.data;
    }

    async processWebApiV1RetrievalProcessYoutubePost(
        filters: OpenWebUICore.Filters.ProcessWebApiV1RetrievalProcessYoutubePostOp091CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/retrieval/process/youtube`,
            data: filters.body,
        });

        return response.data;
    }

    async processWebSearchApiV1RetrievalProcessWebSearchPost(
        filters: OpenWebUICore.Filters.ProcessWebSearchApiV1RetrievalProcessWebSearchPostOp092CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/retrieval/process/web/search`,
            data: filters.body,
        });

        return response.data;
    }

    async queryDocHandlerApiV1RetrievalQueryDocPost(
        filters: OpenWebUICore.Filters.QueryDocHandlerApiV1RetrievalQueryDocPostOp093CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/retrieval/query/doc`,
            data: filters.body,
        });

        return response.data;
    }

    async queryCollectionHandlerApiV1RetrievalQueryCollectionPost(
        filters: OpenWebUICore.Filters.QueryCollectionHandlerApiV1RetrievalQueryCollectionPostOp094CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/retrieval/query/collection`,
            data: filters.body,
        });

        return response.data;
    }

    async deleteEntriesFromCollectionApiV1RetrievalDeletePost(
        filters: OpenWebUICore.Filters.DeleteEntriesFromCollectionApiV1RetrievalDeletePostOp095CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/retrieval/delete`,
            data: filters.body,
        });

        return response.data;
    }

    async resetVectorDbApiV1RetrievalResetDbPost(
        filters: OpenWebUICore.Filters.ResetVectorDbApiV1RetrievalResetDbPostOp096CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/retrieval/reset/db`,
        });

        return response.data;
    }

    async resetUploadDirApiV1RetrievalResetUploadsPost(
        filters: OpenWebUICore.Filters.ResetUploadDirApiV1RetrievalResetUploadsPostOp097CoreOpenWebUIFilters = {}
    ): Promise<boolean> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'post',
            url: `/api/v1/retrieval/reset/uploads`,
        });

        return response.data;
    }

    async getEmbeddingsApiV1RetrievalEf_Text_Get(
        filters: OpenWebUICore.Filters.GetEmbeddingsApiV1RetrievalEfTextGetOp098CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/retrieval/ef/${filters.path['text']}`,
        });

        return response.data;
    }

    async processFilesBatchApiV1RetrievalProcessFilesBatchPost(
        filters: OpenWebUICore.Filters.ProcessFilesBatchApiV1RetrievalProcessFilesBatchPostOp099CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.BatchProcessFilesResponse> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.BatchProcessFilesResponse>(
                {
                    method: 'post',
                    url: `/api/v1/retrieval/process/files/batch`,
                    data: filters.body,
                }
            );

        return response.data;
    }
}
