import type * as Model from './index.core.openwebui.model.ts';

export interface UserListResponse {
    users: Model.UserModel[];
    total: number;
}
