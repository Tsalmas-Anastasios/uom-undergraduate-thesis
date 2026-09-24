import type * as Model from './index.core.openwebui.model.ts';

export interface ToolResponse {
    id: string;
    user_id: string;
    name: string;
    meta: Model.ToolMeta;
    access_control?: Record<string, unknown> | null;
    updated_at: number;
    created_at: number;
}
