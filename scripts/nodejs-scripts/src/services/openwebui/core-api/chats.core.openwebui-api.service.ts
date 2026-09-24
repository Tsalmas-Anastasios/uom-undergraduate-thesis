/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class ChatsCoreOpenWebUIApiService {
    async getSessionUserChatListApiV1ChatsListGet(
        filters: OpenWebUICore.Filters.GetSessionUserChatListApiV1ChatsListGetOp166CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatTitleIdResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChatTitleIdResponse[]
        >({
            method: 'get',
            url: `/api/v1/chats/list`,
            params: filters.query,
        });

        return response.data;
    }

    async getSessionUserChatListApiV1Chats_Get(
        filters: OpenWebUICore.Filters.GetSessionUserChatListApiV1ChatsGetOp167CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatTitleIdResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChatTitleIdResponse[]
        >({
            method: 'get',
            url: `/api/v1/chats/`,
            params: filters.query,
        });

        return response.data;
    }

    async deleteAllUserChatsApiV1Chats_Delete(
        filters: OpenWebUICore.Filters.DeleteAllUserChatsApiV1ChatsDeleteOp168CoreOpenWebUIFilters = {}
    ): Promise<boolean> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/chats/`,
        });

        return response.data;
    }

    async getUserChatListByUserIdApiV1ChatsListUser_UserId_Get(
        filters: OpenWebUICore.Filters.GetUserChatListByUserIdApiV1ChatsListUserUserIdGetOp169CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatTitleIdResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChatTitleIdResponse[]
        >({
            method: 'get',
            url: `/api/v1/chats/list/user/${filters.path['user_id']}`,
            params: filters.query,
        });

        return response.data;
    }

    async createNewChatApiV1ChatsNewPost(
        filters: OpenWebUICore.Filters.CreateNewChatApiV1ChatsNewPostOp170CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/chats/new`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async importChatApiV1ChatsImportPost(
        filters: OpenWebUICore.Filters.ImportChatApiV1ChatsImportPostOp171CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/chats/import`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async searchUserChatsApiV1ChatsSearchGet(
        filters: OpenWebUICore.Filters.SearchUserChatsApiV1ChatsSearchGetOp172CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatTitleIdResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChatTitleIdResponse[]
        >({
            method: 'get',
            url: `/api/v1/chats/search`,
            params: filters.query,
        });

        return response.data;
    }

    async getChatsByFolderIdApiV1ChatsFolder_FolderId_Get(
        filters: OpenWebUICore.Filters.GetChatsByFolderIdApiV1ChatsFolderFolderIdGetOp173CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChatResponse[]
        >({
            method: 'get',
            url: `/api/v1/chats/folder/${filters.path['folder_id']}`,
        });

        return response.data;
    }

    async getChatListByFolderIdApiV1ChatsFolder_FolderId_ListGet(
        filters: OpenWebUICore.Filters.GetChatListByFolderIdApiV1ChatsFolderFolderIdListGetOp174CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/chats/folder/${filters.path['folder_id']}/list`,
            params: filters.query,
        });

        return response.data;
    }

    async getUserPinnedChatsApiV1ChatsPinnedGet(
        filters: OpenWebUICore.Filters.GetUserPinnedChatsApiV1ChatsPinnedGetOp175CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ChatTitleIdResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChatTitleIdResponse[]
        >({
            method: 'get',
            url: `/api/v1/chats/pinned`,
        });

        return response.data;
    }

    async getUserChatsApiV1ChatsAllGet(
        filters: OpenWebUICore.Filters.GetUserChatsApiV1ChatsAllGetOp176CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ChatResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChatResponse[]
        >({
            method: 'get',
            url: `/api/v1/chats/all`,
        });

        return response.data;
    }

    async getUserArchivedChatsApiV1ChatsAllArchivedGet(
        filters: OpenWebUICore.Filters.GetUserArchivedChatsApiV1ChatsAllArchivedGetOp177CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ChatResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChatResponse[]
        >({
            method: 'get',
            url: `/api/v1/chats/all/archived`,
        });

        return response.data;
    }

    async getAllUserTagsApiV1ChatsAllTagsGet(
        filters: OpenWebUICore.Filters.GetAllUserTagsApiV1ChatsAllTagsGetOp178CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.TagModel[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.TagModel[]
        >({
            method: 'get',
            url: `/api/v1/chats/all/tags`,
        });

        return response.data;
    }

    async getAllUserChatsInDbApiV1ChatsAllDbGet(
        filters: OpenWebUICore.Filters.GetAllUserChatsInDbApiV1ChatsAllDbGetOp179CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ChatResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChatResponse[]
        >({
            method: 'get',
            url: `/api/v1/chats/all/db`,
        });

        return response.data;
    }

    async getArchivedSessionUserChatListApiV1ChatsArchivedGet(
        filters: OpenWebUICore.Filters.GetArchivedSessionUserChatListApiV1ChatsArchivedGetOp180CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatTitleIdResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChatTitleIdResponse[]
        >({
            method: 'get',
            url: `/api/v1/chats/archived`,
            params: filters.query,
        });

        return response.data;
    }

    async archiveAllChatsApiV1ChatsArchiveAllPost(
        filters: OpenWebUICore.Filters.ArchiveAllChatsApiV1ChatsArchiveAllPostOp181CoreOpenWebUIFilters = {}
    ): Promise<boolean> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'post',
            url: `/api/v1/chats/archive/all`,
        });

        return response.data;
    }

    async unarchiveAllChatsApiV1ChatsUnarchiveAllPost(
        filters: OpenWebUICore.Filters.UnarchiveAllChatsApiV1ChatsUnarchiveAllPostOp182CoreOpenWebUIFilters = {}
    ): Promise<boolean> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'post',
            url: `/api/v1/chats/unarchive/all`,
        });

        return response.data;
    }

    async getSharedChatByIdApiV1ChatsShare_ShareId_Get(
        filters: OpenWebUICore.Filters.GetSharedChatByIdApiV1ChatsShareShareIdGetOp183CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'get',
                    url: `/api/v1/chats/share/${filters.path['share_id']}`,
                }
            );

        return response.data;
    }

    async getUserChatListByTagNameApiV1ChatsTagsPost(
        filters: OpenWebUICore.Filters.GetUserChatListByTagNameApiV1ChatsTagsPostOp184CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatTitleIdResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChatTitleIdResponse[]
        >({
            method: 'post',
            url: `/api/v1/chats/tags`,
            data: filters.body,
        });

        return response.data;
    }

    async getChatByIdApiV1Chats_Id_Get(
        filters: OpenWebUICore.Filters.GetChatByIdApiV1ChatsIdGetOp185CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'get',
                    url: `/api/v1/chats/${filters.path['id']}`,
                }
            );

        return response.data;
    }

    async updateChatByIdApiV1Chats_Id_Post(
        filters: OpenWebUICore.Filters.UpdateChatByIdApiV1ChatsIdPostOp186CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/chats/${filters.path['id']}`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async deleteChatByIdApiV1Chats_Id_Delete(
        filters: OpenWebUICore.Filters.DeleteChatByIdApiV1ChatsIdDeleteOp187CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/chats/${filters.path['id']}`,
        });

        return response.data;
    }

    async updateChatMessageByIdApiV1Chats_Id_Messages_MessageId_Post(
        filters: OpenWebUICore.Filters.UpdateChatMessageByIdApiV1ChatsIdMessagesMessageIdPostOp188CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/chats/${filters.path['id']}/messages/${filters.path['message_id']}`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async sendChatMessageEventByIdApiV1Chats_Id_Messages_MessageId_EventPost(
        filters: OpenWebUICore.Filters.SendChatMessageEventByIdApiV1ChatsIdMessagesMessageIdEventPostOp189CoreOpenWebUIFilters
    ): Promise<boolean | null> {
        const response = await httpClient.openwebui.core!.client.request<boolean | null>({
            method: 'post',
            url: `/api/v1/chats/${filters.path['id']}/messages/${filters.path['message_id']}/event`,
            data: filters.body,
        });

        return response.data;
    }

    async getPinnedStatusByIdApiV1Chats_Id_PinnedGet(
        filters: OpenWebUICore.Filters.GetPinnedStatusByIdApiV1ChatsIdPinnedGetOp190CoreOpenWebUIFilters
    ): Promise<boolean | null> {
        const response = await httpClient.openwebui.core!.client.request<boolean | null>({
            method: 'get',
            url: `/api/v1/chats/${filters.path['id']}/pinned`,
        });

        return response.data;
    }

    async pinChatByIdApiV1Chats_Id_PinPost(
        filters: OpenWebUICore.Filters.PinChatByIdApiV1ChatsIdPinPostOp191CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/chats/${filters.path['id']}/pin`,
                }
            );

        return response.data;
    }

    async cloneChatByIdApiV1Chats_Id_ClonePost(
        filters: OpenWebUICore.Filters.CloneChatByIdApiV1ChatsIdClonePostOp192CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/chats/${filters.path['id']}/clone`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async cloneSharedChatByIdApiV1Chats_Id_CloneSharedPost(
        filters: OpenWebUICore.Filters.CloneSharedChatByIdApiV1ChatsIdCloneSharedPostOp193CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/chats/${filters.path['id']}/clone/shared`,
                }
            );

        return response.data;
    }

    async archiveChatByIdApiV1Chats_Id_ArchivePost(
        filters: OpenWebUICore.Filters.ArchiveChatByIdApiV1ChatsIdArchivePostOp194CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/chats/${filters.path['id']}/archive`,
                }
            );

        return response.data;
    }

    async shareChatByIdApiV1Chats_Id_SharePost(
        filters: OpenWebUICore.Filters.ShareChatByIdApiV1ChatsIdSharePostOp195CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/chats/${filters.path['id']}/share`,
                }
            );

        return response.data;
    }

    async deleteSharedChatByIdApiV1Chats_Id_ShareDelete(
        filters: OpenWebUICore.Filters.DeleteSharedChatByIdApiV1ChatsIdShareDeleteOp196CoreOpenWebUIFilters
    ): Promise<boolean | null> {
        const response = await httpClient.openwebui.core!.client.request<boolean | null>({
            method: 'delete',
            url: `/api/v1/chats/${filters.path['id']}/share`,
        });

        return response.data;
    }

    async updateChatFolderIdByIdApiV1Chats_Id_FolderPost(
        filters: OpenWebUICore.Filters.UpdateChatFolderIdByIdApiV1ChatsIdFolderPostOp197CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChatResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChatResponse | null>(
                {
                    method: 'post',
                    url: `/api/v1/chats/${filters.path['id']}/folder`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async getChatTagsByIdApiV1Chats_Id_TagsGet(
        filters: OpenWebUICore.Filters.GetChatTagsByIdApiV1ChatsIdTagsGetOp198CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.TagModel[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.TagModel[]
        >({
            method: 'get',
            url: `/api/v1/chats/${filters.path['id']}/tags`,
        });

        return response.data;
    }

    async addTagByIdAndTagNameApiV1Chats_Id_TagsPost(
        filters: OpenWebUICore.Filters.AddTagByIdAndTagNameApiV1ChatsIdTagsPostOp199CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.TagModel[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.TagModel[]
        >({
            method: 'post',
            url: `/api/v1/chats/${filters.path['id']}/tags`,
            data: filters.body,
        });

        return response.data;
    }

    async deleteTagByIdAndTagNameApiV1Chats_Id_TagsDelete(
        filters: OpenWebUICore.Filters.DeleteTagByIdAndTagNameApiV1ChatsIdTagsDeleteOp200CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.TagModel[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.TagModel[]
        >({
            method: 'delete',
            url: `/api/v1/chats/${filters.path['id']}/tags`,
            data: filters.body,
        });

        return response.data;
    }

    async deleteAllTagsByIdApiV1Chats_Id_TagsAllDelete(
        filters: OpenWebUICore.Filters.DeleteAllTagsByIdApiV1ChatsIdTagsAllDeleteOp201CoreOpenWebUIFilters
    ): Promise<boolean | null> {
        const response = await httpClient.openwebui.core!.client.request<boolean | null>({
            method: 'delete',
            url: `/api/v1/chats/${filters.path['id']}/tags/all`,
        });

        return response.data;
    }
}
