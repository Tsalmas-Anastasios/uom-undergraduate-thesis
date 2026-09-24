export interface AdminConfig {
    SHOW_ADMIN_DETAILS: boolean;
    WEBUI_URL: string;
    ENABLE_SIGNUP: boolean;
    ENABLE_API_KEY: boolean;
    ENABLE_API_KEY_ENDPOINT_RESTRICTIONS: boolean;
    API_KEY_ALLOWED_ENDPOINTS: string;
    DEFAULT_USER_ROLE: string;
    JWT_EXPIRES_IN: string;
    ENABLE_COMMUNITY_SHARING: boolean;
    ENABLE_MESSAGE_RATING: boolean;
    ENABLE_CHANNELS: boolean;
    ENABLE_NOTES: boolean;
    ENABLE_USER_WEBHOOKS: boolean;
    PENDING_USER_OVERLAY_TITLE?: string | null;
    PENDING_USER_OVERLAY_CONTENT?: string | null;
    RESPONSE_WATERMARK?: string | null;
}
