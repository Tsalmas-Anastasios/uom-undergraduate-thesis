/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class PromptsCoreOpenWebUIApiService {
    async getPromptsApiV1Prompts_Get(
        filters: OpenWebUICore.Filters.GetPromptsApiV1PromptsGetOp232CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.PromptModel[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.PromptModel[]
        >({
            method: 'get',
            url: `/api/v1/prompts/`,
        });

        return response.data;
    }

    async getPromptListApiV1PromptsListGet(
        filters: OpenWebUICore.Filters.GetPromptListApiV1PromptsListGetOp233CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.PromptUserResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.PromptUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/prompts/list`,
        });

        return response.data;
    }

    async createNewPromptApiV1PromptsCreatePost(
        filters: OpenWebUICore.Filters.CreateNewPromptApiV1PromptsCreatePostOp234CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.PromptModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.PromptModel | null>(
                {
                    method: 'post',
                    url: `/api/v1/prompts/create`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async getPromptByCommandApiV1PromptsCommand_Command_Get(
        filters: OpenWebUICore.Filters.GetPromptByCommandApiV1PromptsCommandCommandGetOp235CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.PromptModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.PromptModel | null>(
                {
                    method: 'get',
                    url: `/api/v1/prompts/command/${filters.path['command']}`,
                }
            );

        return response.data;
    }

    async updatePromptByCommandApiV1PromptsCommand_Command_UpdatePost(
        filters: OpenWebUICore.Filters.UpdatePromptByCommandApiV1PromptsCommandCommandUpdatePostOp236CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.PromptModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.PromptModel | null>(
                {
                    method: 'post',
                    url: `/api/v1/prompts/command/${filters.path['command']}/update`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async deletePromptByCommandApiV1PromptsCommand_Command_DeleteDelete(
        filters: OpenWebUICore.Filters.DeletePromptByCommandApiV1PromptsCommandCommandDeleteDeleteOp237CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/prompts/command/${filters.path['command']}/delete`,
        });

        return response.data;
    }
}
