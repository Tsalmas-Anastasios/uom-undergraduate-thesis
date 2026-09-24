/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class UsersCoreOpenWebUIApiService {
    async getActiveUsersApiV1UsersActiveGet(
        filters: OpenWebUICore.Filters.GetActiveUsersApiV1UsersActiveGetOp133CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/users/active`,
        });

        return response.data;
    }

    async getUsersApiV1Users_Get(
        filters: OpenWebUICore.Filters.GetUsersApiV1UsersGetOp134CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.UserListResponse> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.UserListResponse>({
                method: 'get',
                url: `/api/v1/users/`,
                params: filters.query,
            });

        return response.data;
    }

    async getAllUsersApiV1UsersAllGet(
        filters: OpenWebUICore.Filters.GetAllUsersApiV1UsersAllGetOp135CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.UserInfoListResponse> {
        void filters;
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.UserInfoListResponse>(
                {
                    method: 'get',
                    url: `/api/v1/users/all`,
                }
            );

        return response.data;
    }

    async searchUsersApiV1UsersSearchGet(
        filters: OpenWebUICore.Filters.SearchUsersApiV1UsersSearchGetOp136CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.UserIdNameListResponse> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.UserIdNameListResponse>(
                {
                    method: 'get',
                    url: `/api/v1/users/search`,
                    params: filters.query,
                }
            );

        return response.data;
    }

    async getUserGroupsApiV1UsersGroupsGet(
        filters: OpenWebUICore.Filters.GetUserGroupsApiV1UsersGroupsGetOp137CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/users/groups`,
        });

        return response.data;
    }

    async getUserPermissisionsApiV1UsersPermissionsGet(
        filters: OpenWebUICore.Filters.GetUserPermissisionsApiV1UsersPermissionsGetOp138CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/users/permissions`,
        });

        return response.data;
    }

    async getDefaultUserPermissionsApiV1UsersDefaultPermissionsGet(
        filters: OpenWebUICore.Filters.GetDefaultUserPermissionsApiV1UsersDefaultPermissionsGetOp139CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.UserPermissions> {
        void filters;
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.UserPermissions>({
                method: 'get',
                url: `/api/v1/users/default/permissions`,
            });

        return response.data;
    }

    async updateDefaultUserPermissionsApiV1UsersDefaultPermissionsPost(
        filters: OpenWebUICore.Filters.UpdateDefaultUserPermissionsApiV1UsersDefaultPermissionsPostOp140CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/users/default/permissions`,
            data: filters.body,
        });

        return response.data;
    }

    async getUserSettingsBySessionUserApiV1UsersUserSettingsGet(
        filters: OpenWebUICore.Filters.GetUserSettingsBySessionUserApiV1UsersUserSettingsGetOp141CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.UserSettings | null> {
        void filters;
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.UserSettings | null>(
                {
                    method: 'get',
                    url: `/api/v1/users/user/settings`,
                }
            );

        return response.data;
    }

    async updateUserSettingsBySessionUserApiV1UsersUserSettingsUpdatePost(
        filters: OpenWebUICore.Filters.UpdateUserSettingsBySessionUserApiV1UsersUserSettingsUpdatePostOp142CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.UserSettings> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.UserSettings>({
                method: 'post',
                url: `/api/v1/users/user/settings/update`,
                data: filters.body,
            });

        return response.data;
    }

    async getUserInfoBySessionUserApiV1UsersUserInfoGet(
        filters: OpenWebUICore.Filters.GetUserInfoBySessionUserApiV1UsersUserInfoGetOp143CoreOpenWebUIFilters = {}
    ): Promise<Record<string, unknown> | null> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'get',
            url: `/api/v1/users/user/info`,
        });

        return response.data;
    }

    async updateUserInfoBySessionUserApiV1UsersUserInfoUpdatePost(
        filters: OpenWebUICore.Filters.UpdateUserInfoBySessionUserApiV1UsersUserInfoUpdatePostOp144CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'post',
            url: `/api/v1/users/user/info/update`,
            data: filters.body,
        });

        return response.data;
    }

    async getUserByIdApiV1Users_UserId_Get(
        filters: OpenWebUICore.Filters.GetUserByIdApiV1UsersUserIdGetOp145CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.open_webui__routers__users__UserResponse> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.open_webui__routers__users__UserResponse>(
                {
                    method: 'get',
                    url: `/api/v1/users/${filters.path['user_id']}`,
                }
            );

        return response.data;
    }

    async deleteUserByIdApiV1Users_UserId_Delete(
        filters: OpenWebUICore.Filters.DeleteUserByIdApiV1UsersUserIdDeleteOp146CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/users/${filters.path['user_id']}`,
        });

        return response.data;
    }

    async getUserOauthSessionsByIdApiV1Users_UserId_OauthSessionsGet(
        filters: OpenWebUICore.Filters.GetUserOauthSessionsByIdApiV1UsersUserIdOauthSessionsGetOp147CoreOpenWebUIFilters
    ): Promise<Record<string, unknown> | null> {
        const response = await httpClient.openwebui.core!.client.request<Record<
            string,
            unknown
        > | null>({
            method: 'get',
            url: `/api/v1/users/${filters.path['user_id']}/oauth/sessions`,
        });

        return response.data;
    }

    async getUserProfileImageByIdApiV1Users_UserId_ProfileImageGet(
        filters: OpenWebUICore.Filters.GetUserProfileImageByIdApiV1UsersUserIdProfileImageGetOp148CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/users/${filters.path['user_id']}/profile/image`,
        });

        return response.data;
    }

    async getUserActiveStatusByIdApiV1Users_UserId_ActiveGet(
        filters: OpenWebUICore.Filters.GetUserActiveStatusByIdApiV1UsersUserIdActiveGetOp149CoreOpenWebUIFilters
    ): Promise<Record<string, unknown>> {
        const response = await httpClient.openwebui.core!.client.request<Record<string, unknown>>({
            method: 'get',
            url: `/api/v1/users/${filters.path['user_id']}/active`,
        });

        return response.data;
    }

    async updateUserByIdApiV1Users_UserId_UpdatePost(
        filters: OpenWebUICore.Filters.UpdateUserByIdApiV1UsersUserIdUpdatePostOp150CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.UserModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.UserModel | null>({
                method: 'post',
                url: `/api/v1/users/${filters.path['user_id']}/update`,
                data: filters.body,
            });

        return response.data;
    }

    async getUserGroupsByIdApiV1Users_UserId_GroupsGet(
        filters: OpenWebUICore.Filters.GetUserGroupsByIdApiV1UsersUserIdGroupsGetOp151CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/users/${filters.path['user_id']}/groups`,
        });

        return response.data;
    }
}
