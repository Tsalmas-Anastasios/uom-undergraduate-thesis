/* eslint-disable sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class ConfigsCoreOpenWebUIApiService {
    async importConfigApiV1ConfigsImportPost(
        filters: OpenWebUICore.Filters.ImportConfigApiV1ConfigsImportPostOp100CoreOpenWebUIFilters
    ): Promise<Record<string, unknown>> {
        const response = await httpClient.openwebui.core!.client.request<Record<string, unknown>>({
            method: 'post',
            url: `/api/v1/configs/import`,
            data: filters.body,
        });

        return response.data;
    }

    async exportConfigApiV1ConfigsExportGet(
        filters: OpenWebUICore.Filters.ExportConfigApiV1ConfigsExportGetOp101CoreOpenWebUIFilters = {}
    ): Promise<Record<string, unknown>> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<Record<string, unknown>>({
            method: 'get',
            url: `/api/v1/configs/export`,
        });

        return response.data;
    }

    async getConnectionsConfigApiV1ConfigsConnectionsGet(
        filters: OpenWebUICore.Filters.GetConnectionsConfigApiV1ConfigsConnectionsGetOp102CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ConnectionsConfigForm> {
        void filters;
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ConnectionsConfigForm>(
                {
                    method: 'get',
                    url: `/api/v1/configs/connections`,
                }
            );

        return response.data;
    }

    async setConnectionsConfigApiV1ConfigsConnectionsPost(
        filters: OpenWebUICore.Filters.SetConnectionsConfigApiV1ConfigsConnectionsPostOp103CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ConnectionsConfigForm> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ConnectionsConfigForm>(
                {
                    method: 'post',
                    url: `/api/v1/configs/connections`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async registerOauthClientApiV1ConfigsOauthClientsRegisterPost(
        filters: OpenWebUICore.Filters.RegisterOauthClientApiV1ConfigsOauthClientsRegisterPostOp104CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/configs/oauth/clients/register`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }

    async getToolServersConfigApiV1ConfigsToolServersGet(
        filters: OpenWebUICore.Filters.GetToolServersConfigApiV1ConfigsToolServersGetOp105CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ToolServersConfigForm> {
        void filters;
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ToolServersConfigForm>(
                {
                    method: 'get',
                    url: `/api/v1/configs/tool_servers`,
                }
            );

        return response.data;
    }

    async setToolServersConfigApiV1ConfigsToolServersPost(
        filters: OpenWebUICore.Filters.SetToolServersConfigApiV1ConfigsToolServersPostOp106CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ToolServersConfigForm> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ToolServersConfigForm>(
                {
                    method: 'post',
                    url: `/api/v1/configs/tool_servers`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async verifyToolServersConfigApiV1ConfigsToolServersVerifyPost(
        filters: OpenWebUICore.Filters.VerifyToolServersConfigApiV1ConfigsToolServersVerifyPostOp107CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/configs/tool_servers/verify`,
            data: filters.body,
        });

        return response.data;
    }

    async getCodeExecutionConfigApiV1ConfigsCodeExecutionGet(
        filters: OpenWebUICore.Filters.GetCodeExecutionConfigApiV1ConfigsCodeExecutionGetOp108CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.CodeInterpreterConfigForm> {
        void filters;
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.CodeInterpreterConfigForm>(
                {
                    method: 'get',
                    url: `/api/v1/configs/code_execution`,
                }
            );

        return response.data;
    }

    async setCodeExecutionConfigApiV1ConfigsCodeExecutionPost(
        filters: OpenWebUICore.Filters.SetCodeExecutionConfigApiV1ConfigsCodeExecutionPostOp109CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.CodeInterpreterConfigForm> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.CodeInterpreterConfigForm>(
                {
                    method: 'post',
                    url: `/api/v1/configs/code_execution`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async getModelsConfigApiV1ConfigsModelsGet(
        filters: OpenWebUICore.Filters.GetModelsConfigApiV1ConfigsModelsGetOp110CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ModelsConfigForm> {
        void filters;
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ModelsConfigForm>({
                method: 'get',
                url: `/api/v1/configs/models`,
            });

        return response.data;
    }

    async setModelsConfigApiV1ConfigsModelsPost(
        filters: OpenWebUICore.Filters.SetModelsConfigApiV1ConfigsModelsPostOp111CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ModelsConfigForm> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ModelsConfigForm>({
                method: 'post',
                url: `/api/v1/configs/models`,
                data: filters.body,
            });

        return response.data;
    }

    async setDefaultSuggestionsApiV1ConfigsSuggestionsPost(
        filters: OpenWebUICore.Filters.SetDefaultSuggestionsApiV1ConfigsSuggestionsPostOp112CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.PromptSuggestion[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.PromptSuggestion[]
        >({
            method: 'post',
            url: `/api/v1/configs/suggestions`,
            data: filters.body,
        });

        return response.data;
    }

    async getBannersApiV1ConfigsBannersGet(
        filters: OpenWebUICore.Filters.GetBannersApiV1ConfigsBannersGetOp113CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.BannerModel[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.BannerModel[]
        >({
            method: 'get',
            url: `/api/v1/configs/banners`,
        });

        return response.data;
    }

    async setBannersApiV1ConfigsBannersPost(
        filters: OpenWebUICore.Filters.SetBannersApiV1ConfigsBannersPostOp114CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.BannerModel[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.BannerModel[]
        >({
            method: 'post',
            url: `/api/v1/configs/banners`,
            data: filters.body,
        });

        return response.data;
    }
}
