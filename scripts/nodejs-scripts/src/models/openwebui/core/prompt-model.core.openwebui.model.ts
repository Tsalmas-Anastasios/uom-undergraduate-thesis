export interface PromptModel {
    command: string;
    user_id: string;
    title: string;
    content: string;
    timestamp: number;
    access_control?: Record<string, unknown> | null;
}
