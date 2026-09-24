export interface GenerateCompletionForm {
    model: string;
    prompt: string;
    suffix?: string | null;
    images?: string[] | null;
    format?: Record<string, unknown> | string | null;
    options?: Record<string, unknown> | null;
    system?: string | null;
    template?: string | null;
    context?: number[] | null;
    stream?: boolean | null;
    raw?: boolean | null;
    keep_alive?: number | string | null;
}
