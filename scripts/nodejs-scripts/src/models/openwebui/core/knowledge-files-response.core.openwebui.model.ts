import type * as Model from './index.core.openwebui.model.ts';

export interface KnowledgeFilesResponse {
    id: string;
    user_id: string;
    name: string;
    description: string;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    access_control?: Record<string, unknown> | null;
    created_at: number;
    updated_at: number;
    files: Model.FileMetadataResponse[];
}
