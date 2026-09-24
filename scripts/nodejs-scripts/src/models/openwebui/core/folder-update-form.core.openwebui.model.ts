export interface FolderUpdateForm {
    name?: string | null;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    [key: string]: unknown;
}
