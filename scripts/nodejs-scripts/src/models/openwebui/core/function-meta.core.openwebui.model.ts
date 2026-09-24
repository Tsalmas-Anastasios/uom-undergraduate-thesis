export interface FunctionMeta {
    description?: string | null;
    manifest?: Record<string, unknown> | null;
    [key: string]: unknown;
}
