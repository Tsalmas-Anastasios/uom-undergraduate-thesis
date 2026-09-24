export interface CreateModelForm {
    model?: string | null;
    stream?: boolean | null;
    path?: string | null;
    [key: string]: unknown;
}
