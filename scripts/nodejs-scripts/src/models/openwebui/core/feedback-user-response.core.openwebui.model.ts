import type * as Model from './index.core.openwebui.model.ts';

export interface FeedbackUserResponse {
    id: string;
    user_id: string;
    version: number;
    type: string;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    created_at: number;
    updated_at: number;
    user?: Model.open_webui__routers__evaluations__UserResponse | null;
}
