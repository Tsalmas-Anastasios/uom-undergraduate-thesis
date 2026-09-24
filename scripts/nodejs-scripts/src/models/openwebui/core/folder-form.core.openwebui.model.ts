export interface FolderForm {
    name: string;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    [key: string]: unknown;
}
