export interface FileMetadataResponse {
    id: string;
    hash?: string | null;
    meta: Record<string, unknown>;
    created_at: number;
    updated_at: number;
}
