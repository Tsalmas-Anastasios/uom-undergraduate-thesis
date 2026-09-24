export interface PromptForm {
    command: string;
    title: string;
    content: string;
    access_control?: Record<string, unknown> | null;
}
