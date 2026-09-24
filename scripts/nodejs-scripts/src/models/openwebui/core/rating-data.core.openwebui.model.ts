export interface RatingData {
    rating?: number | string | null;
    model_id?: string | null;
    sibling_model_ids?: string[] | null;
    reason?: string | null;
    comment?: string | null;
    [key: string]: unknown;
}
