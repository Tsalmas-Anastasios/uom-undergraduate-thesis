/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class EvaluationsCoreOpenWebUIApiService {
    async getConfigApiV1EvaluationsConfigGet(
        filters: OpenWebUICore.Filters.GetConfigApiV1EvaluationsConfigGetOp303CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/evaluations/config`,
        });

        return response.data;
    }

    async updateConfigApiV1EvaluationsConfigPost(
        filters: OpenWebUICore.Filters.UpdateConfigApiV1EvaluationsConfigPostOp304CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/evaluations/config`,
            data: filters.body,
        });

        return response.data;
    }

    async getAllFeedbacksApiV1EvaluationsFeedbacksAllGet(
        filters: OpenWebUICore.Filters.GetAllFeedbacksApiV1EvaluationsFeedbacksAllGetOp305CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.FeedbackUserResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.FeedbackUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/evaluations/feedbacks/all`,
        });

        return response.data;
    }

    async deleteAllFeedbacksApiV1EvaluationsFeedbacksAllDelete(
        filters: OpenWebUICore.Filters.DeleteAllFeedbacksApiV1EvaluationsFeedbacksAllDeleteOp306CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'delete',
            url: `/api/v1/evaluations/feedbacks/all`,
        });

        return response.data;
    }

    async getAllFeedbacksApiV1EvaluationsFeedbacksAllExportGet(
        filters: OpenWebUICore.Filters.GetAllFeedbacksApiV1EvaluationsFeedbacksAllExportGetOp307CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.FeedbackModel[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.FeedbackModel[]
        >({
            method: 'get',
            url: `/api/v1/evaluations/feedbacks/all/export`,
        });

        return response.data;
    }

    async getFeedbacksApiV1EvaluationsFeedbacksUserGet(
        filters: OpenWebUICore.Filters.GetFeedbacksApiV1EvaluationsFeedbacksUserGetOp308CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.FeedbackUserResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.FeedbackUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/evaluations/feedbacks/user`,
        });

        return response.data;
    }

    async deleteFeedbacksApiV1EvaluationsFeedbacksDelete(
        filters: OpenWebUICore.Filters.DeleteFeedbacksApiV1EvaluationsFeedbacksDeleteOp309CoreOpenWebUIFilters = {}
    ): Promise<boolean> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/evaluations/feedbacks`,
        });

        return response.data;
    }

    async createFeedbackApiV1EvaluationsFeedbackPost(
        filters: OpenWebUICore.Filters.CreateFeedbackApiV1EvaluationsFeedbackPostOp310CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FeedbackModel> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.FeedbackModel>({
                method: 'post',
                url: `/api/v1/evaluations/feedback`,
                data: filters.body,
            });

        return response.data;
    }

    async getFeedbackByIdApiV1EvaluationsFeedback_Id_Get(
        filters: OpenWebUICore.Filters.GetFeedbackByIdApiV1EvaluationsFeedbackIdGetOp311CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FeedbackModel> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.FeedbackModel>({
                method: 'get',
                url: `/api/v1/evaluations/feedback/${filters.path['id']}`,
            });

        return response.data;
    }

    async updateFeedbackByIdApiV1EvaluationsFeedback_Id_Post(
        filters: OpenWebUICore.Filters.UpdateFeedbackByIdApiV1EvaluationsFeedbackIdPostOp312CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FeedbackModel> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.FeedbackModel>({
                method: 'post',
                url: `/api/v1/evaluations/feedback/${filters.path['id']}`,
                data: filters.body,
            });

        return response.data;
    }

    async deleteFeedbackByIdApiV1EvaluationsFeedback_Id_Delete(
        filters: OpenWebUICore.Filters.DeleteFeedbackByIdApiV1EvaluationsFeedbackIdDeleteOp313CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'delete',
            url: `/api/v1/evaluations/feedback/${filters.path['id']}`,
        });

        return response.data;
    }
}
