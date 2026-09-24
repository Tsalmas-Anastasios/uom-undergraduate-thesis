export interface GroupForm {
    name: string;
    description: string;
    permissions?: Record<string, unknown> | null;
}
