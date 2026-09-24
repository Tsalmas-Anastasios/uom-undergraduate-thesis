/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class FilesCoreOpenWebUIApiService {
    async listFilesApiV1Files_Get(
        filters: OpenWebUICore.Filters.ListFilesApiV1FilesGetOp274CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FileModelResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.FileModelResponse[]
        >({
            method: 'get',
            url: `/api/v1/files/`,
            params: filters.query,
        });

        return response.data;
    }

    async uploadFileApiV1Files_Post(
        filters: OpenWebUICore.Filters.UploadFileApiV1FilesPostOp275CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FileModelResponse> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.FileModelResponse>({
                method: 'post',
                url: `/api/v1/files/`,
                params: filters.query,
                data: filters.body,
            });

        return response.data;
    }

    async searchFilesApiV1FilesSearchGet(
        filters: OpenWebUICore.Filters.SearchFilesApiV1FilesSearchGetOp276CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FileModelResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.FileModelResponse[]
        >({
            method: 'get',
            url: `/api/v1/files/search`,
            params: filters.query,
        });

        return response.data;
    }

    async deleteAllFilesApiV1FilesAllDelete(
        filters: OpenWebUICore.Filters.DeleteAllFilesApiV1FilesAllDeleteOp277CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'delete',
            url: `/api/v1/files/all`,
        });

        return response.data;
    }

    async getFileByIdApiV1Files_Id_Get(
        filters: OpenWebUICore.Filters.GetFileByIdApiV1FilesIdGetOp278CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FileModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.FileModel | null>({
                method: 'get',
                url: `/api/v1/files/${filters.path['id']}`,
            });

        return response.data;
    }

    async deleteFileByIdApiV1Files_Id_Delete(
        filters: OpenWebUICore.Filters.DeleteFileByIdApiV1FilesIdDeleteOp279CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'delete',
            url: `/api/v1/files/${filters.path['id']}`,
        });

        return response.data;
    }

    async getFileProcessStatusApiV1Files_Id_ProcessStatusGet(
        filters: OpenWebUICore.Filters.GetFileProcessStatusApiV1FilesIdProcessStatusGetOp280CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/files/${filters.path['id']}/process/status`,
            params: filters.query,
        });

        return response.data;
    }

    async getFileDataContentByIdApiV1Files_Id_DataContentGet(
        filters: OpenWebUICore.Filters.GetFileDataContentByIdApiV1FilesIdDataContentGetOp281CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/files/${filters.path['id']}/data/content`,
        });

        return response.data;
    }

    async updateFileDataContentByIdApiV1Files_Id_DataContentUpdatePost(
        filters: OpenWebUICore.Filters.UpdateFileDataContentByIdApiV1FilesIdDataContentUpdatePostOp282CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/files/${filters.path['id']}/data/content/update`,
            data: filters.body,
        });

        return response.data;
    }

    async getFileContentByIdApiV1Files_Id_ContentGet(
        filters: OpenWebUICore.Filters.GetFileContentByIdApiV1FilesIdContentGetOp283CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/files/${filters.path['id']}/content`,
            params: filters.query,
        });

        return response.data;
    }

    async getHtmlFileContentByIdApiV1Files_Id_ContentHtmlGet(
        filters: OpenWebUICore.Filters.GetHtmlFileContentByIdApiV1FilesIdContentHtmlGetOp284CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/files/${filters.path['id']}/content/html`,
        });

        return response.data;
    }

    async getFileContentByIdApiV1Files_Id_Content_FileName_Get(
        filters: OpenWebUICore.Filters.GetFileContentByIdApiV1FilesIdContentFileNameGetOp285CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/files/${filters.path['id']}/content/${filters.path['file_name']}`,
        });

        return response.data;
    }
}
