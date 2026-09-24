export interface NoteModel {
    id: string;
    user_id: string;
    title: string;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    access_control?: Record<string, unknown> | null;
    created_at: number;
    updated_at: number;
}
