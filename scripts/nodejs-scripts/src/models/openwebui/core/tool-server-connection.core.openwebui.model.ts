export interface ToolServerConnection {
    url: string;
    path: string;
    type?: string | null;
    auth_type: string | null;
    key: string | null;
    config: Record<string, unknown> | null;
    [key: string]: unknown;
}
