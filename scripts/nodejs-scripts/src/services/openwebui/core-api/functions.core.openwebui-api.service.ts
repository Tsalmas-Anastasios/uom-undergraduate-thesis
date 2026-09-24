/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class FunctionsCoreOpenWebUIApiService {
    async getFunctionsApiV1Functions_Get(
        filters: OpenWebUICore.Filters.GetFunctionsApiV1FunctionsGetOp286CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.FunctionResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.FunctionResponse[]
        >({
            method: 'get',
            url: `/api/v1/functions/`,
        });

        return response.data;
    }

    async getFunctionListApiV1FunctionsListGet(
        filters: OpenWebUICore.Filters.GetFunctionListApiV1FunctionsListGetOp287CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.FunctionUserResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.FunctionUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/functions/list`,
        });

        return response.data;
    }

    async getFunctionsApiV1FunctionsExportGet(
        filters: OpenWebUICore.Filters.GetFunctionsApiV1FunctionsExportGetOp288CoreOpenWebUIFilters
    ): Promise<
        (OpenWebUICore.Model.FunctionModel | OpenWebUICore.Model.FunctionWithValvesModel)[]
    > {
        const response = await httpClient.openwebui.core!.client.request<
            (OpenWebUICore.Model.FunctionModel | OpenWebUICore.Model.FunctionWithValvesModel)[]
        >({
            method: 'get',
            url: `/api/v1/functions/export`,
            params: filters.query,
        });

        return response.data;
    }

    async loadFunctionFromUrlApiV1FunctionsLoadUrlPost(
        filters: OpenWebUICore.Filters.LoadFunctionFromUrlApiV1FunctionsLoadUrlPostOp289CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'post',
            url: `/api/v1/functions/load/url`,
            data: filters.body,
        });

        return response.data;
    }

    async syncFunctionsApiV1FunctionsSyncPost(
        filters: OpenWebUICore.Filters.SyncFunctionsApiV1FunctionsSyncPostOp290CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FunctionWithValvesModel[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.FunctionWithValvesModel[]
        >({
            method: 'post',
            url: `/api/v1/functions/sync`,
            data: filters.body,
        });

        return response.data;
    }

    async createNewFunctionApiV1FunctionsCreatePost(
        filters: OpenWebUICore.Filters.CreateNewFunctionApiV1FunctionsCreatePostOp291CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FunctionResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.FunctionResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/functions/create`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async getFunctionByIdApiV1FunctionsId_Id_Get(
        filters: OpenWebUICore.Filters.GetFunctionByIdApiV1FunctionsIdIdGetOp292CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FunctionModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.FunctionModel | null>(
                {
                    method: 'get',
                    url: `/api/v1/functions/id/${filters.path['id']}`,
                }
            );

        return response.data;
    }

    async toggleFunctionByIdApiV1FunctionsId_Id_TogglePost(
        filters: OpenWebUICore.Filters.ToggleFunctionByIdApiV1FunctionsIdIdTogglePostOp293CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FunctionModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.FunctionModel | null>(
                {
                    method: 'post',
                    url: `/api/v1/functions/id/${filters.path['id']}/toggle`,
                }
            );

        return response.data;
    }

    async toggleGlobalByIdApiV1FunctionsId_Id_ToggleGlobalPost(
        filters: OpenWebUICore.Filters.ToggleGlobalByIdApiV1FunctionsIdIdToggleGlobalPostOp294CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FunctionModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.FunctionModel | null>(
                {
                    method: 'post',
                    url: `/api/v1/functions/id/${filters.path['id']}/toggle/global`,
                }
            );

        return response.data;
    }

    async updateFunctionByIdApiV1FunctionsId_Id_UpdatePost(
        filters: OpenWebUICore.Filters.UpdateFunctionByIdApiV1FunctionsIdIdUpdatePostOp295CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FunctionModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.FunctionModel | null>(
                {
                    method: 'post',
                    url: `/api/v1/functions/id/${filters.path['id']}/update`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async deleteFunctionByIdApiV1FunctionsId_Id_DeleteDelete(
        filters: OpenWebUICore.Filters.DeleteFunctionByIdApiV1FunctionsIdIdDeleteDeleteOp296CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/functions/id/${filters.path['id']}/delete`,
        });

        return response.data;
    }

    async getFunctionValvesByIdApiV1FunctionsId_Id_ValvesGet(
        filters: OpenWebUICore.Filters.GetFunctionValvesByIdApiV1FunctionsIdIdValvesGetOp297CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'get',
            url: `/api/v1/functions/id/${filters.path['id']}/valves`,
        });

        return response.data;
    }

    async getFunctionValvesSpecByIdApiV1FunctionsId_Id_ValvesSpecGet(
        filters: OpenWebUICore.Filters.GetFunctionValvesSpecByIdApiV1FunctionsIdIdValvesSpecGetOp298CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'get',
            url: `/api/v1/functions/id/${filters.path['id']}/valves/spec`,
        });

        return response.data;
    }

    async updateFunctionValvesByIdApiV1FunctionsId_Id_ValvesUpdatePost(
        filters: OpenWebUICore.Filters.UpdateFunctionValvesByIdApiV1FunctionsIdIdValvesUpdatePostOp299CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'post',
            url: `/api/v1/functions/id/${filters.path['id']}/valves/update`,
            data: filters.body,
        });

        return response.data;
    }

    async getFunctionUserValvesByIdApiV1FunctionsId_Id_ValvesUserGet(
        filters: OpenWebUICore.Filters.GetFunctionUserValvesByIdApiV1FunctionsIdIdValvesUserGetOp300CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'get',
            url: `/api/v1/functions/id/${filters.path['id']}/valves/user`,
        });

        return response.data;
    }

    async getFunctionUserValvesSpecByIdApiV1FunctionsId_Id_ValvesUserSpecGet(
        filters: OpenWebUICore.Filters.GetFunctionUserValvesSpecByIdApiV1FunctionsIdIdValvesUserSpecGetOp301CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'get',
            url: `/api/v1/functions/id/${filters.path['id']}/valves/user/spec`,
        });

        return response.data;
    }

    async updateFunctionUserValvesByIdApiV1FunctionsId_Id_ValvesUserUpdatePost(
        filters: OpenWebUICore.Filters.UpdateFunctionUserValvesByIdApiV1FunctionsIdIdValvesUserUpdatePostOp302CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'post',
            url: `/api/v1/functions/id/${filters.path['id']}/valves/user/update`,
            data: filters.body,
        });

        return response.data;
    }
}
