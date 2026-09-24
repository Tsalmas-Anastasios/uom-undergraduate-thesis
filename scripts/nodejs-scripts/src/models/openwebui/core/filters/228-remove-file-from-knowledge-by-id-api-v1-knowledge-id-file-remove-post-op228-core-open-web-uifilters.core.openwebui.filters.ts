import type { OpenWebUICore } from '../../../../models/index.model.ts';

export interface RemoveFileFromKnowledgeByIdApiV1KnowledgeIdFileRemovePostOp228CoreOpenWebUIFilters {
    path: { id: string };
    query?: { delete_file?: boolean };
    body: OpenWebUICore.Model.KnowledgeFileIdForm;
}
