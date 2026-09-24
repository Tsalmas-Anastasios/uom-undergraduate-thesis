export interface KnowledgeForm {
    name: string;
    description: string;
    data?: Record<string, unknown> | null;
    access_control?: Record<string, unknown> | null;
}
