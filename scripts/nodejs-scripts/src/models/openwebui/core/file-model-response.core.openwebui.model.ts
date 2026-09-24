import type * as Model from './index.core.openwebui.model.ts';

export interface FileModelResponse {
    id: string;
    user_id: string;
    hash?: string | null;
    filename: string;
    data?: Record<string, unknown> | null;
    meta: Model.FileMeta;
    created_at: number;
    updated_at: number;
    [key: string]: unknown;
}
