export interface FileMeta {
    name?: string | null;
    content_type?: string | null;
    size?: number | null;
    [key: string]: unknown;
}
