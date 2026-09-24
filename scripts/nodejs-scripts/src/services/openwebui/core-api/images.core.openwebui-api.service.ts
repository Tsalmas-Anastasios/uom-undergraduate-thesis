/* eslint-disable sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class ImagesCoreOpenWebUIApiService {
    async getConfigApiV1ImagesConfigGet(
        filters: OpenWebUICore.Filters.GetConfigApiV1ImagesConfigGetOp070CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/images/config`,
        });

        return response.data;
    }

    async updateConfigApiV1ImagesConfigUpdatePost(
        filters: OpenWebUICore.Filters.UpdateConfigApiV1ImagesConfigUpdatePostOp071CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/images/config/update`,
            data: filters.body,
        });

        return response.data;
    }

    async verifyUrlApiV1ImagesConfigUrlVerifyGet(
        filters: OpenWebUICore.Filters.VerifyUrlApiV1ImagesConfigUrlVerifyGetOp072CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/images/config/url/verify`,
        });

        return response.data;
    }

    async getImageConfigApiV1ImagesImageConfigGet(
        filters: OpenWebUICore.Filters.GetImageConfigApiV1ImagesImageConfigGetOp073CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/images/image/config`,
        });

        return response.data;
    }

    async updateImageConfigApiV1ImagesImageConfigUpdatePost(
        filters: OpenWebUICore.Filters.UpdateImageConfigApiV1ImagesImageConfigUpdatePostOp074CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/images/image/config/update`,
            data: filters.body,
        });

        return response.data;
    }

    async getModelsApiV1ImagesModelsGet(
        filters: OpenWebUICore.Filters.GetModelsApiV1ImagesModelsGetOp075CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/images/models`,
        });

        return response.data;
    }

    async imageGenerationsApiV1ImagesGenerationsPost(
        filters: OpenWebUICore.Filters.ImageGenerationsApiV1ImagesGenerationsPostOp076CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/images/generations`,
            data: filters.body,
        });

        return response.data;
    }
}
