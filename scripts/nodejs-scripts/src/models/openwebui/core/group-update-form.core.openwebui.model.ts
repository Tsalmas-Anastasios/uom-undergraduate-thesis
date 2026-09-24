export interface GroupUpdateForm {
    user_ids?: string[] | null;
    name: string;
    description: string;
    permissions?: Record<string, unknown> | null;
}
