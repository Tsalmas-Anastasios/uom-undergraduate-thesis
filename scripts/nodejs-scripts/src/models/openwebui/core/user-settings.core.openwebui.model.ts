export interface UserSettings {
    ui?: Record<string, unknown> | null;
    [key: string]: unknown;
}
