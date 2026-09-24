import type * as Model from './index.core.openwebui.model.ts';

export interface UserInfoListResponse {
    users: Model.UserInfoResponse[];
    total: number;
}
