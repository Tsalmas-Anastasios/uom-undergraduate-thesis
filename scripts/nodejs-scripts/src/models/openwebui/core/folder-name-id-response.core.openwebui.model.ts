import type * as Model from './index.core.openwebui.model.ts';

export interface FolderNameIdResponse {
    id: string;
    name: string;
    meta?: Model.FolderMetadataResponse | null;
    parent_id?: string | null;
    is_expanded?: boolean;
    created_at: number;
    updated_at: number;
}
