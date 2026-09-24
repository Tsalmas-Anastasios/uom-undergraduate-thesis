/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class AuthsCoreOpenWebUIApiService {
    async getSessionUserApiV1Auths_Get(
        filters: OpenWebUICore.Filters.GetSessionUserApiV1AuthsGetOp115CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.SessionUserInfoResponse> {
        void filters;
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.SessionUserInfoResponse>(
                {
                    method: 'get',
                    url: `/api/v1/auths/`,
                }
            );

        return response.data;
    }

    async updateProfileApiV1AuthsUpdateProfilePost(
        filters: OpenWebUICore.Filters.UpdateProfileApiV1AuthsUpdateProfilePostOp116CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.open_webui__models__auths__UserResponse> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.open_webui__models__auths__UserResponse>(
                {
                    method: 'post',
                    url: `/api/v1/auths/update/profile`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async updatePasswordApiV1AuthsUpdatePasswordPost(
        filters: OpenWebUICore.Filters.UpdatePasswordApiV1AuthsUpdatePasswordPostOp117CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'post',
            url: `/api/v1/auths/update/password`,
            data: filters.body,
        });

        return response.data;
    }

    async ldapAuthApiV1AuthsLdapPost(
        filters: OpenWebUICore.Filters.LdapAuthApiV1AuthsLdapPostOp118CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.SessionUserResponse> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.SessionUserResponse>(
                {
                    method: 'post',
                    url: `/api/v1/auths/ldap`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async signinApiV1AuthsSigninPost(
        filters: OpenWebUICore.Filters.SigninApiV1AuthsSigninPostOp119CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.SessionUserResponse> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.SessionUserResponse>(
                {
                    method: 'post',
                    url: `/api/v1/auths/signin`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async signupApiV1AuthsSignupPost(
        filters: OpenWebUICore.Filters.SignupApiV1AuthsSignupPostOp120CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.SessionUserResponse> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.SessionUserResponse>(
                {
                    method: 'post',
                    url: `/api/v1/auths/signup`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async signoutApiV1AuthsSignoutGet(
        filters: OpenWebUICore.Filters.SignoutApiV1AuthsSignoutGetOp121CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/auths/signout`,
        });

        return response.data;
    }

    async addUserApiV1AuthsAddPost(
        filters: OpenWebUICore.Filters.AddUserApiV1AuthsAddPostOp122CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.SigninResponse> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.SigninResponse>({
                method: 'post',
                url: `/api/v1/auths/add`,
                data: filters.body,
            });

        return response.data;
    }

    async getAdminDetailsApiV1AuthsAdminDetailsGet(
        filters: OpenWebUICore.Filters.GetAdminDetailsApiV1AuthsAdminDetailsGetOp123CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/auths/admin/details`,
        });

        return response.data;
    }

    async getAdminConfigApiV1AuthsAdminConfigGet(
        filters: OpenWebUICore.Filters.GetAdminConfigApiV1AuthsAdminConfigGetOp124CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/auths/admin/config`,
        });

        return response.data;
    }

    async updateAdminConfigApiV1AuthsAdminConfigPost(
        filters: OpenWebUICore.Filters.UpdateAdminConfigApiV1AuthsAdminConfigPostOp125CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/auths/admin/config`,
            data: filters.body,
        });

        return response.data;
    }

    async getLdapServerApiV1AuthsAdminConfigLdapServerGet(
        filters: OpenWebUICore.Filters.GetLdapServerApiV1AuthsAdminConfigLdapServerGetOp126CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.LdapServerConfig> {
        void filters;
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.LdapServerConfig>({
                method: 'get',
                url: `/api/v1/auths/admin/config/ldap/server`,
            });

        return response.data;
    }

    async updateLdapServerApiV1AuthsAdminConfigLdapServerPost(
        filters: OpenWebUICore.Filters.UpdateLdapServerApiV1AuthsAdminConfigLdapServerPostOp127CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/auths/admin/config/ldap/server`,
            data: filters.body,
        });

        return response.data;
    }

    async getLdapConfigApiV1AuthsAdminConfigLdapGet(
        filters: OpenWebUICore.Filters.GetLdapConfigApiV1AuthsAdminConfigLdapGetOp128CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/auths/admin/config/ldap`,
        });

        return response.data;
    }

    async updateLdapConfigApiV1AuthsAdminConfigLdapPost(
        filters: OpenWebUICore.Filters.UpdateLdapConfigApiV1AuthsAdminConfigLdapPostOp129CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/auths/admin/config/ldap`,
            data: filters.body,
        });

        return response.data;
    }

    async getApiKeyApiV1AuthsApiKeyGet(
        filters: OpenWebUICore.Filters.GetApiKeyApiV1AuthsApiKeyGetOp130CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ApiKey> {
        void filters;
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ApiKey>({
                method: 'get',
                url: `/api/v1/auths/api_key`,
            });

        return response.data;
    }

    async generateApiKeyApiV1AuthsApiKeyPost(
        filters: OpenWebUICore.Filters.GenerateApiKeyApiV1AuthsApiKeyPostOp131CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ApiKey> {
        void filters;
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ApiKey>({
                method: 'post',
                url: `/api/v1/auths/api_key`,
            });

        return response.data;
    }

    async deleteApiKeyApiV1AuthsApiKeyDelete(
        filters: OpenWebUICore.Filters.DeleteApiKeyApiV1AuthsApiKeyDeleteOp132CoreOpenWebUIFilters = {}
    ): Promise<boolean> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/auths/api_key`,
        });

        return response.data;
    }
}
