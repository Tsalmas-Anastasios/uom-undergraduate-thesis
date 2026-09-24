/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class MemoriesCoreOpenWebUIApiService {
    async getEmbeddingsApiV1MemoriesEfGet(
        filters: OpenWebUICore.Filters.GetEmbeddingsApiV1MemoriesEfGetOp252CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/memories/ef`,
        });

        return response.data;
    }

    async getMemoriesApiV1Memories_Get(
        filters: OpenWebUICore.Filters.GetMemoriesApiV1MemoriesGetOp253CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.MemoryModel[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.MemoryModel[]
        >({
            method: 'get',
            url: `/api/v1/memories/`,
        });

        return response.data;
    }

    async addMemoryApiV1MemoriesAddPost(
        filters: OpenWebUICore.Filters.AddMemoryApiV1MemoriesAddPostOp254CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.MemoryModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.MemoryModel | null>(
                {
                    method: 'post',
                    url: `/api/v1/memories/add`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async queryMemoryApiV1MemoriesQueryPost(
        filters: OpenWebUICore.Filters.QueryMemoryApiV1MemoriesQueryPostOp255CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/memories/query`,
            data: filters.body,
        });

        return response.data;
    }

    async resetMemoryFromVectorDbApiV1MemoriesResetPost(
        filters: OpenWebUICore.Filters.ResetMemoryFromVectorDbApiV1MemoriesResetPostOp256CoreOpenWebUIFilters = {}
    ): Promise<boolean> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'post',
            url: `/api/v1/memories/reset`,
        });

        return response.data;
    }

    async deleteMemoryByUserIdApiV1MemoriesDeleteUserDelete(
        filters: OpenWebUICore.Filters.DeleteMemoryByUserIdApiV1MemoriesDeleteUserDeleteOp257CoreOpenWebUIFilters = {}
    ): Promise<boolean> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/memories/delete/user`,
        });

        return response.data;
    }

    async updateMemoryByIdApiV1Memories_MemoryId_UpdatePost(
        filters: OpenWebUICore.Filters.UpdateMemoryByIdApiV1MemoriesMemoryIdUpdatePostOp258CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.MemoryModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.MemoryModel | null>(
                {
                    method: 'post',
                    url: `/api/v1/memories/${filters.path['memory_id']}/update`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async deleteMemoryByIdApiV1Memories_MemoryId_Delete(
        filters: OpenWebUICore.Filters.DeleteMemoryByIdApiV1MemoriesMemoryIdDeleteOp259CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/memories/${filters.path['memory_id']}`,
        });

        return response.data;
    }
}
