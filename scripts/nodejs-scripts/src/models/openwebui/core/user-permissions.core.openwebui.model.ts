import type * as Model from './index.core.openwebui.model.ts';

export interface UserPermissions {
    workspace: Model.WorkspacePermissions;
    sharing: Model.SharingPermissions;
    chat: Model.ChatPermissions;
    features: Model.FeaturesPermissions;
}
