import type * as Model from './index.core.openwebui.model.ts';

export interface BatchProcessFilesForm {
    files: Model.FileModel[];
    collection_name: string;
}
