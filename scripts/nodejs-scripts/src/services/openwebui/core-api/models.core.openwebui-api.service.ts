/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class ModelsCoreOpenWebUIApiService {
    async getModelsApiV1Models_Get(
        filters: OpenWebUICore.Filters.GetModelsApiV1ModelsGetOp208CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ModelUserResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ModelUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/models/`,
            params: filters.query,
        });

        return response.data;
    }

    async getBaseModelsApiV1ModelsBaseGet(
        filters: OpenWebUICore.Filters.GetBaseModelsApiV1ModelsBaseGetOp209CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ModelResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ModelResponse[]
        >({
            method: 'get',
            url: `/api/v1/models/base`,
        });

        return response.data;
    }

    async createNewModelApiV1ModelsCreatePost(
        filters: OpenWebUICore.Filters.CreateNewModelApiV1ModelsCreatePostOp210CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ModelModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ModelModel | null>({
                method: 'post',
                url: `/api/v1/models/create`,
                data: filters.body,
            });

        return response.data;
    }

    async exportModelsApiV1ModelsExportGet(
        filters: OpenWebUICore.Filters.ExportModelsApiV1ModelsExportGetOp211CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ModelModel[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ModelModel[]
        >({
            method: 'get',
            url: `/api/v1/models/export`,
        });

        return response.data;
    }

    async importModelsApiV1ModelsImportPost(
        filters: OpenWebUICore.Filters.ImportModelsApiV1ModelsImportPostOp212CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'post',
            url: `/api/v1/models/import`,
            data: filters.body,
        });

        return response.data;
    }

    async syncModelsApiV1ModelsSyncPost(
        filters: OpenWebUICore.Filters.SyncModelsApiV1ModelsSyncPostOp213CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ModelModel[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ModelModel[]
        >({
            method: 'post',
            url: `/api/v1/models/sync`,
            data: filters.body,
        });

        return response.data;
    }

    async getModelByIdApiV1ModelsModelGet(
        filters: OpenWebUICore.Filters.GetModelByIdApiV1ModelsModelGetOp214CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ModelResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ModelResponse | null>(
                {
                    method: 'get',
                    url: `/api/v1/models/model`,
                    params: filters.query,
                }
            );

        return response.data;
    }

    async getModelProfileImageApiV1ModelsModelProfileImageGet(
        filters: OpenWebUICore.Filters.GetModelProfileImageApiV1ModelsModelProfileImageGetOp215CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/models/model/profile/image`,
            params: filters.query,
        });

        return response.data;
    }

    async toggleModelByIdApiV1ModelsModelTogglePost(
        filters: OpenWebUICore.Filters.ToggleModelByIdApiV1ModelsModelTogglePostOp216CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ModelResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ModelResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/models/model/toggle`,
                    params: filters.query,
                }
            );

        return response.data;
    }

    async updateModelByIdApiV1ModelsModelUpdatePost(
        filters: OpenWebUICore.Filters.UpdateModelByIdApiV1ModelsModelUpdatePostOp217CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ModelModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ModelModel | null>({
                method: 'post',
                url: `/api/v1/models/model/update`,
                params: filters.query,
                data: filters.body,
            });

        return response.data;
    }

    async deleteModelByIdApiV1ModelsModelDeleteDelete(
        filters: OpenWebUICore.Filters.DeleteModelByIdApiV1ModelsModelDeleteDeleteOp218CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/models/model/delete`,
            params: filters.query,
        });

        return response.data;
    }

    async deleteAllModelsApiV1ModelsDeleteAllDelete(
        filters: OpenWebUICore.Filters.DeleteAllModelsApiV1ModelsDeleteAllDeleteOp219CoreOpenWebUIFilters = {}
    ): Promise<boolean> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/models/delete/all`,
        });

        return response.data;
    }
}
