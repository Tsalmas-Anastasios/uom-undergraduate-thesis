/* eslint-disable camelcase, sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class NotesCoreOpenWebUIApiService {
    async getNotesApiV1Notes_Get(
        filters: OpenWebUICore.Filters.GetNotesApiV1NotesGetOp202CoreOpenWebUIFilters = {}
    ): Promise<OpenWebUICore.Model.NoteUserResponse[]> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.NoteUserResponse[]
        >({
            method: 'get',
            url: `/api/v1/notes/`,
        });

        return response.data;
    }

    async getNoteListApiV1NotesListGet(
        filters: OpenWebUICore.Filters.GetNoteListApiV1NotesListGetOp203CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.NoteTitleIdResponse[]> {
        const response = await httpClient.openwebui.core!.client.request<
            OpenWebUICore.Model.NoteTitleIdResponse[]
        >({
            method: 'get',
            url: `/api/v1/notes/list`,
            params: filters.query,
        });

        return response.data;
    }

    async createNewNoteApiV1NotesCreatePost(
        filters: OpenWebUICore.Filters.CreateNewNoteApiV1NotesCreatePostOp204CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.NoteModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.NoteModel | null>({
                method: 'post',
                url: `/api/v1/notes/create`,
                data: filters.body,
            });

        return response.data;
    }

    async getNoteByIdApiV1Notes_Id_Get(
        filters: OpenWebUICore.Filters.GetNoteByIdApiV1NotesIdGetOp205CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.NoteModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.NoteModel | null>({
                method: 'get',
                url: `/api/v1/notes/${filters.path['id']}`,
            });

        return response.data;
    }

    async updateNoteByIdApiV1Notes_Id_UpdatePost(
        filters: OpenWebUICore.Filters.UpdateNoteByIdApiV1NotesIdUpdatePostOp206CoreOpenWebUIFilters
    ): Promise<OpenWebUICore.Model.NoteModel | null> {
        const response =
            await httpClient.openwebui.core!.client.request<OpenWebUICore.Model.NoteModel | null>({
                method: 'post',
                url: `/api/v1/notes/${filters.path['id']}/update`,
                data: filters.body,
            });

        return response.data;
    }

    async deleteNoteByIdApiV1Notes_Id_DeleteDelete(
        filters: OpenWebUICore.Filters.DeleteNoteByIdApiV1NotesIdDeleteDeleteOp207CoreOpenWebUIFilters
    ): Promise<boolean> {
        const response = await httpClient.openwebui.core!.client.request<boolean>({
            method: 'delete',
            url: `/api/v1/notes/${filters.path['id']}/delete`,
        });

        return response.data;
    }
}
