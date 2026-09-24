export interface ChatResponse {
    id: string;
    user_id: string;
    title: string;
    chat: Record<string, unknown>;
    updated_at: number;
    created_at: number;
    share_id?: string | null;
    archived: boolean;
    pinned?: boolean | null;
    meta?: Record<string, unknown>;
    folder_id?: string | null;
}
