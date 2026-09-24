/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class GroupsCoreOpenWebUIApiService {
    async getGroupsApiV1Groups_Get(
        filters: OpenWebUICore.Filters.GetGroupsApiV1GroupsGetOp267CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.GroupResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.GroupResponse[]
        >({
            method: 'get',
            url: `/api/v1/groups/`,
        });

        return response.data;
    }

    async createNewGroupApiV1GroupsCreatePost(
        filters: OpenWebUICore.Filters.CreateNewGroupApiV1GroupsCreatePostOp268CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.GroupResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.GroupResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/groups/create`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async getGroupByIdApiV1GroupsId_Id_Get(
        filters: OpenWebUICore.Filters.GetGroupByIdApiV1GroupsIdIdGetOp269CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.GroupResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.GroupResponse | null>(
                {
                    method: 'get',
                    url: `/api/v1/groups/id/${filters.path['id']}`,
                }
            );

        return response.data;
    }

    async updateGroupByIdApiV1GroupsId_Id_UpdatePost(
        filters: OpenWebUICore.Filters.UpdateGroupByIdApiV1GroupsIdIdUpdatePostOp270CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.GroupResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.GroupResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/groups/id/${filters.path['id']}/update`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async addUserToGroupApiV1GroupsId_Id_UsersAddPost(
        filters: OpenWebUICore.Filters.AddUserToGroupApiV1GroupsIdIdUsersAddPostOp271CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.GroupResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.GroupResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/groups/id/${filters.path['id']}/users/add`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async removeUsersFromGroupApiV1GroupsId_Id_UsersRemovePost(
        filters: OpenWebUICore.Filters.RemoveUsersFromGroupApiV1GroupsIdIdUsersRemovePostOp272CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.GroupResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.GroupResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/groups/id/${filters.path['id']}/users/remove`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async deleteGroupByIdApiV1GroupsId_Id_DeleteDelete(
        filters: OpenWebUICore.Filters.DeleteGroupByIdApiV1GroupsIdIdDeleteDeleteOp273CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/groups/id/${filters.path['id']}/delete`,
        });

        return response.data;
    }
}
