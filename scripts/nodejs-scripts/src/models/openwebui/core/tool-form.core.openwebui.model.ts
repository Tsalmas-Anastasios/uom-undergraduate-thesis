import type * as Model from './index.core.openwebui.model.ts';

export interface ToolForm {
    id: string;
    name: string;
    content: string;
    meta: Model.ToolMeta;
    access_control?: Record<string, unknown> | null;
}
