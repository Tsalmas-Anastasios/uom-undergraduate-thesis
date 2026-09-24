import type * as Model from './index.core.openwebui.model.ts';

export interface FunctionModel {
    id: string;
    user_id: string;
    name: string;
    type: string;
    content: string;
    meta: Model.FunctionMeta;
    is_active?: boolean;
    is_global?: boolean;
    updated_at: number;
    created_at: number;
}
