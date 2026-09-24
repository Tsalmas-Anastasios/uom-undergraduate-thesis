export interface STTConfigForm {
    OPENAI_API_BASE_URL: string;
    OPENAI_API_KEY: string;
    ENGINE: string;
    MODEL: string;
    SUPPORTED_CONTENT_TYPES?: string[];
    WHISPER_MODEL: string;
    DEEPGRAM_API_KEY: string;
    AZURE_API_KEY: string;
    AZURE_REGION: string;
    AZURE_LOCALES: string;
    AZURE_BASE_URL: string;
    AZURE_MAX_SPEAKERS: string;
}
