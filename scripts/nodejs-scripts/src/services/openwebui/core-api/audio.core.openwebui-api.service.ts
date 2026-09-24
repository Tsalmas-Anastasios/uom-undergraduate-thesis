/* eslint-disable sonarjs/void-use */
import type { OpenWebUICore } from '../../../models/index.model.ts';
import { httpClient } from '../../../utils/index.utilities.ts';

export class AudioCoreOpenWebUIApiService {
    async getAudioConfigApiV1AudioConfigGet(
        filters: OpenWebUICore.Filters.GetAudioConfigApiV1AudioConfigGetOp077CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/audio/config`,
        });

        return response.data;
    }

    async updateAudioConfigApiV1AudioConfigUpdatePost(
        filters: OpenWebUICore.Filters.UpdateAudioConfigApiV1AudioConfigUpdatePostOp078CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/audio/config/update`,
            data: filters.body,
        });

        return response.data;
    }

    async speechApiV1AudioSpeechPost(
        filters: OpenWebUICore.Filters.SpeechApiV1AudioSpeechPostOp079CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/audio/speech`,
        });

        return response.data;
    }

    async transcriptionApiV1AudioTranscriptionsPost(
        filters: OpenWebUICore.Filters.TranscriptionApiV1AudioTranscriptionsPostOp080CoreOpenWebUIFilters
    ): Promise<unknown> {
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'post',
            url: `/api/v1/audio/transcriptions`,
            data: filters.body,
        });

        return response.data;
    }

    async getModelsApiV1AudioModelsGet(
        filters: OpenWebUICore.Filters.GetModelsApiV1AudioModelsGetOp081CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/audio/models`,
        });

        return response.data;
    }

    async getVoicesApiV1AudioVoicesGet(
        filters: OpenWebUICore.Filters.GetVoicesApiV1AudioVoicesGetOp082CoreOpenWebUIFilters = {}
    ): Promise<unknown> {
        void filters;
        const response = await httpClient.openwebui.core!.client.request<unknown>({
            method: 'get',
            url: `/api/v1/audio/voices`,
        });

        return response.data;
    }
}
