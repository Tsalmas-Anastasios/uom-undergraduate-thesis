/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class KnowledgeCoreOpenWebUIApiService {
    async getKnowledgeApiV1Knowledge_Get(
        filters: OpenWebUICore.Filters.GetKnowledgeApiV1KnowledgeGetOp220CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.KnowledgeUserResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.KnowledgeUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/knowledge/`,
        });

        return response.data;
    }

    async getKnowledgeListApiV1KnowledgeListGet(
        filters: OpenWebUICore.Filters.GetKnowledgeListApiV1KnowledgeListGetOp221CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.KnowledgeUserResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.KnowledgeUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/knowledge/list`,
        });

        return response.data;
    }

    async createNewKnowledgeApiV1KnowledgeCreatePost(
        filters: OpenWebUICore.Filters.CreateNewKnowledgeApiV1KnowledgeCreatePostOp222CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.KnowledgeResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.KnowledgeResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/knowledge/create`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async reindexKnowledgeFilesApiV1KnowledgeReindexPost(
        filters: OpenWebUICore.Filters.ReindexKnowledgeFilesApiV1KnowledgeReindexPostOp223CoreOpenWebUIFilters = {}
    ): Promise<boolean> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'post',
            url: `/api/v1/knowledge/reindex`,
        });

        return response.data;
    }

    async getKnowledgeByIdApiV1Knowledge_Id_Get(
        filters: OpenWebUICore.Filters.GetKnowledgeByIdApiV1KnowledgeIdGetOp224CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.KnowledgeFilesResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.KnowledgeFilesResponse | null>(
                {
                    method: 'get',
                    url: `/api/v1/knowledge/${filters.path['id']}`,
                }
            );

        return response.data;
    }

    async updateKnowledgeByIdApiV1Knowledge_Id_UpdatePost(
        filters: OpenWebUICore.Filters.UpdateKnowledgeByIdApiV1KnowledgeIdUpdatePostOp225CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.KnowledgeFilesResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.KnowledgeFilesResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/knowledge/${filters.path['id']}/update`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async addFileToKnowledgeByIdApiV1Knowledge_Id_FileAddPost(
        filters: OpenWebUICore.Filters.AddFileToKnowledgeByIdApiV1KnowledgeIdFileAddPostOp226CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.KnowledgeFilesResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.KnowledgeFilesResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/knowledge/${filters.path['id']}/file/add`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async updateFileFromKnowledgeByIdApiV1Knowledge_Id_FileUpdatePost(
        filters: OpenWebUICore.Filters.UpdateFileFromKnowledgeByIdApiV1KnowledgeIdFileUpdatePostOp227CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.KnowledgeFilesResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.KnowledgeFilesResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/knowledge/${filters.path['id']}/file/update`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async removeFileFromKnowledgeByIdApiV1Knowledge_Id_FileRemovePost(
        filters: OpenWebUICore.Filters.RemoveFileFromKnowledgeByIdApiV1KnowledgeIdFileRemovePostOp228CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.KnowledgeFilesResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.KnowledgeFilesResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/knowledge/${filters.path['id']}/file/remove`,
                    params: filters.query,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async deleteKnowledgeByIdApiV1Knowledge_Id_DeleteDelete(
        filters: OpenWebUICore.Filters.DeleteKnowledgeByIdApiV1KnowledgeIdDeleteDeleteOp229CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/knowledge/${filters.path['id']}/delete`,
        });

        return response.data;
    }

    async resetKnowledgeByIdApiV1Knowledge_Id_ResetPost(
        filters: OpenWebUICore.Filters.ResetKnowledgeByIdApiV1KnowledgeIdResetPostOp230CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.KnowledgeResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.KnowledgeResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/knowledge/${filters.path['id']}/reset`,
                }
            );

        return response.data;
    }

    async addFilesToKnowledgeBatchApiV1Knowledge_Id_FilesBatchAddPost(
        filters: OpenWebUICore.Filters.AddFilesToKnowledgeBatchApiV1KnowledgeIdFilesBatchAddPostOp231CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.KnowledgeFilesResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.KnowledgeFilesResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/knowledge/${filters.path['id']}/files/batch/add`,
                    data: filters.body,
                }
            );

        return response.data;
    }
}
