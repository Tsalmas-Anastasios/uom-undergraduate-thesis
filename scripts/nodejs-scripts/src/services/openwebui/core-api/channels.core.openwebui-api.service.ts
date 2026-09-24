/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class ChannelsCoreOpenWebUIApiService {
    async getChannelsApiV1Channels_Get(
        filters: OpenWebUICore.Filters.GetChannelsApiV1ChannelsGetOp152CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ChannelModel[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChannelModel[]
        >({
            method: 'get',
            url: `/api/v1/channels/`,
        });

        return response.data;
    }

    async getAllChannelsApiV1ChannelsListGet(
        filters: OpenWebUICore.Filters.GetAllChannelsApiV1ChannelsListGetOp153CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.ChannelModel[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.ChannelModel[]
        >({
            method: 'get',
            url: `/api/v1/channels/list`,
        });

        return response.data;
    }

    async createNewChannelApiV1ChannelsCreatePost(
        filters: OpenWebUICore.Filters.CreateNewChannelApiV1ChannelsCreatePostOp154CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChannelModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChannelModel | null>(
                {
                    method: 'post',
                    url: `/api/v1/channels/create`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async getChannelByIdApiV1Channels_Id_Get(
        filters: OpenWebUICore.Filters.GetChannelByIdApiV1ChannelsIdGetOp155CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChannelResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChannelResponse | null>(
                {
                    method: 'get',
                    url: `/api/v1/channels/${filters.path['id']}`,
                }
            );

        return response.data;
    }

    async updateChannelByIdApiV1Channels_Id_UpdatePost(
        filters: OpenWebUICore.Filters.UpdateChannelByIdApiV1ChannelsIdUpdatePostOp156CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.ChannelModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.ChannelModel | null>(
                {
                    method: 'post',
                    url: `/api/v1/channels/${filters.path['id']}/update`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async deleteChannelByIdApiV1Channels_Id_DeleteDelete(
        filters: OpenWebUICore.Filters.DeleteChannelByIdApiV1ChannelsIdDeleteDeleteOp157CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/channels/${filters.path['id']}/delete`,
        });

        return response.data;
    }

    async getChannelMessagesApiV1Channels_Id_MessagesGet(
        filters: OpenWebUICore.Filters.GetChannelMessagesApiV1ChannelsIdMessagesGetOp158CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.open_webui__routers__channels__MessageUserResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.open_webui__routers__channels__MessageUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/channels/${filters.path['id']}/messages`,
            params: filters.query,
        });

        return response.data;
    }

    async postNewMessageApiV1Channels_Id_MessagesPostPost(
        filters: OpenWebUICore.Filters.PostNewMessageApiV1ChannelsIdMessagesPostPostOp159CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.MessageModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.MessageModel | null>(
                {
                    method: 'post',
                    url: `/api/v1/channels/${filters.path['id']}/messages/post`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async getChannelMessageApiV1Channels_Id_Messages_MessageId_Get(
        filters: OpenWebUICore.Filters.GetChannelMessageApiV1ChannelsIdMessagesMessageIdGetOp160CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.open_webui__routers__channels__MessageUserResponse | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.open_webui__routers__channels__MessageUserResponse | null>(
                {
                    method: 'get',
                    url: `/api/v1/channels/${filters.path['id']}/messages/${filters.path['message_id']}`,
                }
            );

        return response.data;
    }

    async getChannelThreadMessagesApiV1Channels_Id_Messages_MessageId_ThreadGet(
        filters: OpenWebUICore.Filters.GetChannelThreadMessagesApiV1ChannelsIdMessagesMessageIdThreadGetOp161CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.open_webui__routers__channels__MessageUserResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.open_webui__routers__channels__MessageUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/channels/${filters.path['id']}/messages/${filters.path['message_id']}/thread`,
            params: filters.query,
        });

        return response.data;
    }

    async updateMessageByIdApiV1Channels_Id_Messages_MessageId_UpdatePost(
        filters: OpenWebUICore.Filters.UpdateMessageByIdApiV1ChannelsIdMessagesMessageIdUpdatePostOp162CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.MessageModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.MessageModel | null>(
                {
                    method: 'post',
                    url: `/api/v1/channels/${filters.path['id']}/messages/${filters.path['message_id']}/update`,
                    data: filters.body,
                }
            );

        return response.data;
    }

    async addReactionToMessageApiV1Channels_Id_Messages_MessageId_ReactionsAddPost(
        filters: OpenWebUICore.Filters.AddReactionToMessageApiV1ChannelsIdMessagesMessageIdReactionsAddPostOp163CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'post',
            url: `/api/v1/channels/${filters.path['id']}/messages/${filters.path['message_id']}/reactions/add`,
            data: filters.body,
        });

        return response.data;
    }

    async removeReactionByIdAndUserIdAndNameApiV1Channels_Id_Messages_MessageId_ReactionsRemovePost(
        filters: OpenWebUICore.Filters.RemoveReactionByIdAndUserIdAndNameApiV1ChannelsIdMessagesMessageIdReactionsRemovePostOp164CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'post',
            url: `/api/v1/channels/${filters.path['id']}/messages/${filters.path['message_id']}/reactions/remove`,
            data: filters.body,
        });

        return response.data;
    }

    async deleteMessageByIdApiV1Channels_Id_Messages_MessageId_DeleteDelete(
        filters: OpenWebUICore.Filters.DeleteMessageByIdApiV1ChannelsIdMessagesMessageIdDeleteDeleteOp165CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/channels/${filters.path['id']}/messages/${filters.path['message_id']}/delete`,
        });

        return response.data;
    }
}
