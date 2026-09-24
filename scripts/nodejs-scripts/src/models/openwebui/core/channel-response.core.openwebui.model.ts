export interface ChannelResponse {
    id: string;
    user_id: string;
    type?: string | null;
    name: string;
    description?: string | null;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    access_control?: Record<string, unknown> | null;
    created_at: number;
    updated_at: number;
    write_access?: boolean;
}
