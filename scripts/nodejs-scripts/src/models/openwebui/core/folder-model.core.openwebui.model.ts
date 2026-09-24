export interface FolderModel {
    id: string;
    parent_id?: string | null;
    user_id: string;
    name: string;
    items?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    data?: Record<string, unknown> | null;
    is_expanded?: boolean;
    created_at: number;
    updated_at: number;
}
