export interface FeedbackModel {
    id: string;
    user_id: string;
    version: number;
    type: string;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    snapshot?: Record<string, unknown> | null;
    created_at: number;
    updated_at: number;
}
