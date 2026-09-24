export interface GenerateEmbedForm {
    model: string;
    input: string[] | string;
    truncate?: boolean | null;
    options?: Record<string, unknown> | null;
    keep_alive?: number | string | null;
    [key: string]: unknown;
}
