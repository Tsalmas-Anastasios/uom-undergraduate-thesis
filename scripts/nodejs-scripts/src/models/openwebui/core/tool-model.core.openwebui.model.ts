import type * as Model from './index.core.openwebui.model.ts';

export interface ToolModel {
    id: string;
    user_id: string;
    name: string;
    content: string;
    specs: Record<string, unknown>[];
    meta: Model.ToolMeta;
    access_control?: Record<string, unknown> | null;
    updated_at: number;
    created_at: number;
}
