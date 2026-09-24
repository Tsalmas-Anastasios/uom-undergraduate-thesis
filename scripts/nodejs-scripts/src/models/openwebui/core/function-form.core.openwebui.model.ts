import type * as Model from './index.core.openwebui.model.ts';

export interface FunctionForm {
    id: string;
    name: string;
    content: string;
    meta: Model.FunctionMeta;
}
