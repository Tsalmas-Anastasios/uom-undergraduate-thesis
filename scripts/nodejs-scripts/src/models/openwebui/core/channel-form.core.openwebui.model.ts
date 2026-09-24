export interface ChannelForm {
    name: string;
    description?: string | null;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    access_control?: Record<string, unknown> | null;
}
