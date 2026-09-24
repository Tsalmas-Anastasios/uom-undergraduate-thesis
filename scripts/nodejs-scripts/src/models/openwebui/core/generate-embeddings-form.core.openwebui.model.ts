export interface GenerateEmbeddingsForm {
    model: string;
    prompt: string;
    options?: Record<string, unknown> | null;
    keep_alive?: number | string | null;
}
