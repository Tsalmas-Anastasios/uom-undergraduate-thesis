export interface ComfyUIConfigForm {
    COMFYUI_BASE_URL: string;
    COMFYUI_API_KEY: string;
    COMFYUI_WORKFLOW: string;
    COMFYUI_WORKFLOW_NODES: Record<string, unknown>[];
}
