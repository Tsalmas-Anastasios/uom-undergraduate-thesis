export interface ModelMeta {
    profile_image_url?: string | null;
    description?: string | null;
    capabilities?: Record<string, unknown> | null;
    [key: string]: unknown;
}
