export interface FileModel {
    id: string;
    user_id: string;
    hash?: string | null;
    filename: string;
    path?: string | null;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    access_control?: Record<string, unknown> | null;
    created_at: number | null;
    updated_at: number | null;
}
