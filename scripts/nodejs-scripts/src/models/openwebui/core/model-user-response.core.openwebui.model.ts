import type * as Model from './index.core.openwebui.model.ts';

export interface ModelUserResponse {
    id: string;
    user_id: string;
    base_model_id?: string | null;
    name: string;
    params: Model.ModelParams;
    meta: Model.ModelMeta;
    access_control?: Record<string, unknown> | null;
    is_active: boolean;
    updated_at: number;
    created_at: number;
    user?: Model.open_webui__models__users__UserResponse | null;
}
