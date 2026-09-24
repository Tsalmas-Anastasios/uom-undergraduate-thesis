import type * as Model from './index.core.openwebui.model.ts';

export interface ModelForm {
    id: string;
    base_model_id?: string | null;
    name: string;
    meta: Model.ModelMeta;
    params: Model.ModelParams;
    access_control?: Record<string, unknown> | null;
    is_active?: boolean;
}
