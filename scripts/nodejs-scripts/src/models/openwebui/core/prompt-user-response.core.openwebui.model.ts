import type * as Model from './index.core.openwebui.model.ts';

export interface PromptUserResponse {
    command: string;
    user_id: string;
    title: string;
    content: string;
    timestamp: number;
    access_control?: Record<string, unknown> | null;
    user?: Model.open_webui__models__users__UserResponse | null;
}
