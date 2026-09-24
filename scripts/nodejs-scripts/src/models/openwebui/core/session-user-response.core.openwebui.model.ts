export interface SessionUserResponse {
    id: string;
    email: string;
    name: string;
    role: string;
    profile_image_url: string;
    token: string;
    token_type: string;
    expires_at?: number | null;
    permissions?: Record<string, unknown> | null;
}
