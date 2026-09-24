import type * as Model from './index.core.openwebui.model.ts';

export interface UserModel {
    id: string;
    name: string;
    email: string;
    username?: string | null;
    role?: string;
    profile_image_url: string;
    bio?: string | null;
    gender?: string | null;
    date_of_birth?: string | null;
    info?: Record<string, unknown> | null;
    settings?: Model.UserSettings | null;
    api_key?: string | null;
    oauth_sub?: string | null;
    last_active_at: number;
    updated_at: number;
    created_at: number;
}
