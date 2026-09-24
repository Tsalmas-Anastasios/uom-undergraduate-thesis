export interface TagModel {
    id: string;
    name: string;
    user_id: string;
    meta?: Record<string, unknown> | null;
}
