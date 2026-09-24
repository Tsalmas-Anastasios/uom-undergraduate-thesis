export interface GroupResponse {
    id: string;
    user_id: string;
    name: string;
    description: string;
    permissions?: Record<string, unknown> | null;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    user_ids?: string[];
    created_at: number;
    updated_at: number;
}
