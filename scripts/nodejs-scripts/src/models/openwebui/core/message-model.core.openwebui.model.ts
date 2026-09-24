export interface MessageModel {
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
}
