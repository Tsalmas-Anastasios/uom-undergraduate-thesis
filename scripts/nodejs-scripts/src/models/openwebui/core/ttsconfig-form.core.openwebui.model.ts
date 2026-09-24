export interface TTSConfigForm {
    OPENAI_API_BASE_URL: string;
    OPENAI_API_KEY: string;
    OPENAI_PARAMS?: Record<string, unknown> | null;
    API_KEY: string;
    ENGINE: string;
    MODEL: string;
    VOICE: string;
    SPLIT_ON: string;
    AZURE_SPEECH_REGION: string;
    AZURE_SPEECH_BASE_URL: string;
    AZURE_SPEECH_OUTPUT_FORMAT: string;
}
