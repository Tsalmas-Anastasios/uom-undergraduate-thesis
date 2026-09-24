/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class ToolsCoreOpenWebUIApiService {
    async getToolsApiV1Tools_Get(
        filters: OpenWebUICore.Filters.GetToolsApiV1ToolsGetOp238CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ToolUserResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ToolUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/tools/`,
        });

        return response.data;
    }

    async getToolListApiV1ToolsListGet(
        filters: OpenWebUICore.Filters.GetToolListApiV1ToolsListGetOp239CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ToolUserResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ToolUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/tools/list`,
        });

        return response.data;
    }

    async loadToolFromUrlApiV1ToolsLoadUrlPost(
        filters: OpenWebUICore.Filters.LoadToolFromUrlApiV1ToolsLoadUrlPostOp240CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'post',
            url: `/api/v1/tools/load/url`,
            data: filters.body,
        });

        return response.data;
    }

    async exportToolsApiV1ToolsExportGet(
        filters: OpenWebUICore.Filters.ExportToolsApiV1ToolsExportGetOp241CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ToolModel[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ToolModel[]
        >({
            method: 'get',
            url: `/api/v1/tools/export`,
        });

        return response.data;
    }

    async createNewToolsApiV1ToolsCreatePost(
        filters: OpenWebUICore.Filters.CreateNewToolsApiV1ToolsCreatePostOp242CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ToolResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ToolResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/tools/create`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async getToolsByIdApiV1ToolsId_Id_Get(
        filters: OpenWebUICore.Filters.GetToolsByIdApiV1ToolsIdIdGetOp243CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ToolModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ToolModel | null>({
                method: 'get',
                url: `/api/v1/tools/id/${filters.path['id']}`,
            });

        return response.data;
    }

    async updateToolsByIdApiV1ToolsId_Id_UpdatePost(
        filters: OpenWebUICore.Filters.UpdateToolsByIdApiV1ToolsIdIdUpdatePostOp244CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ToolModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ToolModel | null>({
                method: 'post',
                url: `/api/v1/tools/id/${filters.path['id']}/update`,
                data: filters.body,
            });

        return response.data;
    }

    async deleteToolsByIdApiV1ToolsId_Id_DeleteDelete(
        filters: OpenWebUICore.Filters.DeleteToolsByIdApiV1ToolsIdIdDeleteDeleteOp245CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/tools/id/${filters.path['id']}/delete`,
        });

        return response.data;
    }

    async getToolsValvesByIdApiV1ToolsId_Id_ValvesGet(
        filters: OpenWebUICore.Filters.GetToolsValvesByIdApiV1ToolsIdIdValvesGetOp246CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'get',
            url: `/api/v1/tools/id/${filters.path['id']}/valves`,
        });

        return response.data;
    }

    async getToolsValvesSpecByIdApiV1ToolsId_Id_ValvesSpecGet(
        filters: OpenWebUICore.Filters.GetToolsValvesSpecByIdApiV1ToolsIdIdValvesSpecGetOp247CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'get',
            url: `/api/v1/tools/id/${filters.path['id']}/valves/spec`,
        });

        return response.data;
    }

    async updateToolsValvesByIdApiV1ToolsId_Id_ValvesUpdatePost(
        filters: OpenWebUICore.Filters.UpdateToolsValvesByIdApiV1ToolsIdIdValvesUpdatePostOp248CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'post',
            url: `/api/v1/tools/id/${filters.path['id']}/valves/update`,
            data: filters.body,
        });

        return response.data;
    }

    async getToolsUserValvesByIdApiV1ToolsId_Id_ValvesUserGet(
        filters: OpenWebUICore.Filters.GetToolsUserValvesByIdApiV1ToolsIdIdValvesUserGetOp249CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'get',
            url: `/api/v1/tools/id/${filters.path['id']}/valves/user`,
        });

        return response.data;
    }

    async getToolsUserValvesSpecByIdApiV1ToolsId_Id_ValvesUserSpecGet(
        filters: OpenWebUICore.Filters.GetToolsUserValvesSpecByIdApiV1ToolsIdIdValvesUserSpecGetOp250CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'get',
            url: `/api/v1/tools/id/${filters.path['id']}/valves/user/spec`,
        });

        return response.data;
    }

    async updateToolsUserValvesByIdApiV1ToolsId_Id_ValvesUserUpdatePost(
        filters: OpenWebUICore.Filters.UpdateToolsUserValvesByIdApiV1ToolsIdIdValvesUserUpdatePostOp251CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'post',
            url: `/api/v1/tools/id/${filters.path['id']}/valves/user/update`,
            data: filters.body,
        });

        return response.data;
    }
}
