/* eslint-disable sonarjs/class-name */
import type * as Model from './index.core.openwebui.model.ts';

export interface open_webui__models__messages__MessageUserResponse {
    id: string;
    user_id: string;
    channel_id?: string | null;
    reply_to_id?: string | null;
    parent_id?: string | null;
    content: string;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    created_at: number;
    updated_at: number;
    user?: Model.UserNameResponse | null;
}
