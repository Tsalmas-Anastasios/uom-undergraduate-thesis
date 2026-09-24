export interface UpdateConfigForm {
    ENABLE_EVALUATION_ARENA_MODELS?: boolean | null;
    EVALUATION_ARENA_MODELS?: Record<string, unknown>[] | null;
}
