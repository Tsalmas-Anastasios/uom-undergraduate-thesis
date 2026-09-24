import type * as Model from './index.core.openwebui.model.ts';

export interface FunctionResponse {
    id: string;
    user_id: string;
    type: string;
    name: string;
    meta: Model.FunctionMeta;
    is_active: boolean;
    is_global: boolean;
    updated_at: number;
    created_at: number;
}
