/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class FoldersCoreOpenWebUIApiService {
    async getFoldersApiV1Folders_Get(
        filters: OpenWebUICore.Filters.GetFoldersApiV1FoldersGetOp260CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.FolderNameIdResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.FolderNameIdResponse[]
        >({
            method: 'get',
            url: `/api/v1/folders/`,
        });

        return response.data;
    }

    async createFolderApiV1Folders_Post(
        filters: OpenWebUICore.Filters.CreateFolderApiV1FoldersPostOp261CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/folders/`,
            data: filters.body,
        });

        return response.data;
    }

    async getFolderByIdApiV1Folders_Id_Get(
        filters: OpenWebUICore.Filters.GetFolderByIdApiV1FoldersIdGetOp262CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.FolderModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.FolderModel | null>(
                {
                    method: 'get',
                    url: `/api/v1/folders/${filters.path['id']}`,
                }
            );

        return response.data;
    }

    async deleteFolderByIdApiV1Folders_Id_Delete(
        filters: OpenWebUICore.Filters.DeleteFolderByIdApiV1FoldersIdDeleteOp263CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'delete',
            url: `/api/v1/folders/${filters.path['id']}`,
        });

        return response.data;
    }

    async updateFolderNameByIdApiV1Folders_Id_UpdatePost(
        filters: OpenWebUICore.Filters.UpdateFolderNameByIdApiV1FoldersIdUpdatePostOp264CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/folders/${filters.path['id']}/update`,
            data: filters.body,
        });

        return response.data;
    }

    async updateFolderParentIdByIdApiV1Folders_Id_UpdateParentPost(
        filters: OpenWebUICore.Filters.UpdateFolderParentIdByIdApiV1FoldersIdUpdateParentPostOp265CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/folders/${filters.path['id']}/update/parent`,
            data: filters.body,
        });

        return response.data;
    }

    async updateFolderIsExpandedByIdApiV1Folders_Id_UpdateExpandedPost(
        filters: OpenWebUICore.Filters.UpdateFolderIsExpandedByIdApiV1FoldersIdUpdateExpandedPostOp266CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/folders/${filters.path['id']}/update/expanded`,
            data: filters.body,
        });

        return response.data;
    }
}
