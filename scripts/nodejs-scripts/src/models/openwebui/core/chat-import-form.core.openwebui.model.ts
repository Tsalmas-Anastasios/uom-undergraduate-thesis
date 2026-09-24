export interface ChatImportForm {
    chat: Record<string, unknown>;
    folder_id?: string | null;
    meta?: Record<string, unknown> | null;
    pinned?: boolean | null;
    created_at?: number | null;
    updated_at?: number | null;
}
