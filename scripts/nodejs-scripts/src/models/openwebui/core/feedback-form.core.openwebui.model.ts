import type * as Model from './index.core.openwebui.model.ts';

export interface FeedbackForm {
    type: string;
    data?: Model.RatingData | null;
    meta?: Record<string, unknown> | null;
    snapshot?: Model.SnapshotData | null;
    [key: string]: unknown;
}
