/* eslint-disable unicorn/prevent-abbreviations, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class UtilsCoreOpenWebUIApiService {
    async getGravatarApiV1UtilsGravatarGet(
        filters: OpenWebUICore.Filters.GetGravatarApiV1UtilsGravatarGetOp314CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/utils/gravatar`,
            params: filters.query,
        });

        return response.data;
    }

    async formatCodeApiV1UtilsCodeFormatPost(
        filters: OpenWebUICore.Filters.FormatCodeApiV1UtilsCodeFormatPostOp315CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/utils/code/format`,
            data: filters.body,
        });

        return response.data;
    }

    async executeCodeApiV1UtilsCodeExecutePost(
        filters: OpenWebUICore.Filters.ExecuteCodeApiV1UtilsCodeExecutePostOp316CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/utils/code/execute`,
            data: filters.body,
        });

        return response.data;
    }

    async getHtmlFromMarkdownApiV1UtilsMarkdownPost(
        filters: OpenWebUICore.Filters.GetHtmlFromMarkdownApiV1UtilsMarkdownPostOp317CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/utils/markdown`,
            data: filters.body,
        });

        return response.data;
    }

    async downloadChatAsPdfApiV1UtilsPdfPost(
        filters: OpenWebUICore.Filters.DownloadChatAsPdfApiV1UtilsPdfPostOp318CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/utils/pdf`,
            data: filters.body,
        });

        return response.data;
    }

    async downloadDbApiV1UtilsDbDownloadGet(
        filters: OpenWebUICore.Filters.DownloadDbApiV1UtilsDbDownloadGetOp319CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/utils/db/download`,
        });

        return response.data;
    }

    async downloadLitellmConfigYamlApiV1UtilsLitellmConfigGet(
        filters: OpenWebUICore.Filters.DownloadLitellmConfigYamlApiV1UtilsLitellmConfigGetOp320CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/utils/litellm/config`,
        });

        return response.data;
    }
}
