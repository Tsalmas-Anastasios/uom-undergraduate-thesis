/* eslint-disable sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class TasksCoreOpenWebUIApiService {
    async getTaskConfigApiV1TasksConfigGet(
        filters: OpenWebUICore.Filters.GetTaskConfigApiV1TasksConfigGetOp060CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/tasks/config`,
        });

        return response.data;
    }

    async updateTaskConfigApiV1TasksConfigUpdatePost(
        filters: OpenWebUICore.Filters.UpdateTaskConfigApiV1TasksConfigUpdatePostOp061CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/tasks/config/update`,
            data: filters.body,
        });

        return response.data;
    }

    async generateTitleApiV1TasksTitleCompletionsPost(
        filters: OpenWebUICore.Filters.GenerateTitleApiV1TasksTitleCompletionsPostOp062CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/tasks/title/completions`,
            data: filters.body,
        });

        return response.data;
    }

    async generateFollowUpsApiV1TasksFollowUpCompletionsPost(
        filters: OpenWebUICore.Filters.GenerateFollowUpsApiV1TasksFollowUpCompletionsPostOp063CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/tasks/follow_up/completions`,
            data: filters.body,
        });

        return response.data;
    }

    async generateChatTagsApiV1TasksTagsCompletionsPost(
        filters: OpenWebUICore.Filters.GenerateChatTagsApiV1TasksTagsCompletionsPostOp064CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/tasks/tags/completions`,
            data: filters.body,
        });

        return response.data;
    }

    async generateImagePromptApiV1TasksImagePromptCompletionsPost(
        filters: OpenWebUICore.Filters.GenerateImagePromptApiV1TasksImagePromptCompletionsPostOp065CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/tasks/image_prompt/completions`,
            data: filters.body,
        });

        return response.data;
    }

    async generateQueriesApiV1TasksQueriesCompletionsPost(
        filters: OpenWebUICore.Filters.GenerateQueriesApiV1TasksQueriesCompletionsPostOp066CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/tasks/queries/completions`,
            data: filters.body,
        });

        return response.data;
    }

    async generateAutocompletionApiV1TasksAutoCompletionsPost(
        filters: OpenWebUICore.Filters.GenerateAutocompletionApiV1TasksAutoCompletionsPostOp067CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/tasks/auto/completions`,
            data: filters.body,
        });

        return response.data;
    }

    async generateEmojiApiV1TasksEmojiCompletionsPost(
        filters: OpenWebUICore.Filters.GenerateEmojiApiV1TasksEmojiCompletionsPostOp068CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/tasks/emoji/completions`,
            data: filters.body,
        });

        return response.data;
    }

    async generateMoaResponseApiV1TasksMoaCompletionsPost(
        filters: OpenWebUICore.Filters.GenerateMoaResponseApiV1TasksMoaCompletionsPostOp069CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/tasks/moa/completions`,
            data: filters.body,
        });

        return response.data;
    }
}
