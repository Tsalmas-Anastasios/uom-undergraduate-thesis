/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class PipelinesCoreOpenWebUIApiService {
    async getPipelinesListApiV1PipelinesListGet(
        filters: OpenWebUICore.Filters.GetPipelinesListApiV1PipelinesListGetOp052CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/pipelines/list`,
        });

        return response.data;
    }

    async uploadPipelineApiV1PipelinesUploadPost(
        filters: OpenWebUICore.Filters.UploadPipelineApiV1PipelinesUploadPostOp053CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/pipelines/upload`,
            data: filters.body,
        });

        return response.data;
    }

    async addPipelineApiV1PipelinesAddPost(
        filters: OpenWebUICore.Filters.AddPipelineApiV1PipelinesAddPostOp054CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/pipelines/add`,
            data: filters.body,
        });

        return response.data;
    }

    async deletePipelineApiV1PipelinesDeleteDelete(
        filters: OpenWebUICore.Filters.DeletePipelineApiV1PipelinesDeleteDeleteOp055CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'delete',
            url: `/api/v1/pipelines/delete`,
            data: filters.body,
        });

        return response.data;
    }

    async getPipelinesApiV1Pipelines_Get(
        filters: OpenWebUICore.Filters.GetPipelinesApiV1PipelinesGetOp056CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/pipelines/`,
            params: filters.query,
        });

        return response.data;
    }

    async getPipelineValvesApiV1Pipelines_PipelineId_ValvesGet(
        filters: OpenWebUICore.Filters.GetPipelineValvesApiV1PipelinesPipelineIdValvesGetOp057CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/pipelines/${filters.path['pipeline_id']}/valves`,
            params: filters.query,
        });

        return response.data;
    }

    async getPipelineValvesSpecApiV1Pipelines_PipelineId_ValvesSpecGet(
        filters: OpenWebUICore.Filters.GetPipelineValvesSpecApiV1PipelinesPipelineIdValvesSpecGetOp058CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/pipelines/${filters.path['pipeline_id']}/valves/spec`,
            params: filters.query,
        });

        return response.data;
    }

    async updatePipelineValvesApiV1Pipelines_PipelineId_ValvesUpdatePost(
        filters: OpenWebUICore.Filters.UpdatePipelineValvesApiV1PipelinesPipelineIdValvesUpdatePostOp059CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/pipelines/${filters.path['pipeline_id']}/valves/update`,
            params: filters.query,
            data: filters.body,
        });

        return response.data;
    }
}
