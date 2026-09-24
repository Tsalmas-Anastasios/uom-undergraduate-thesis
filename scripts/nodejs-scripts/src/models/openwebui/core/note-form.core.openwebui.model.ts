export interface NoteForm {
    title: string;
    data?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    access_control?: Record<string, unknown> | null;
}
