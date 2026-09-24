import type * as Model from './index.core.openwebui.model.ts';

export interface BatchProcessFilesResponse {
    results: Model.BatchProcessFilesResult[];
    errors: Model.BatchProcessFilesResult[];
}
