export interface GenerateImageForm {
    model?: string | null;
    prompt: string;
    size?: string | null;
    n?: number;
    negative_prompt?: string | null;
}
