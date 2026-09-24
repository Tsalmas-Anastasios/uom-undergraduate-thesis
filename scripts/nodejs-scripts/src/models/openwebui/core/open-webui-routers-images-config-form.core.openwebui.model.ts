/* eslint-disable sonarjs/class-name */
import type * as Model from './index.core.openwebui.model.ts';

export interface open_webui__routers__images__ConfigForm {
    enabled: boolean;
    engine: string;
    prompt_generation: boolean;
    openai: Model.open_webui__routers__images__OpenAIConfigForm;
    automatic1111: Model.Automatic1111ConfigForm;
    comfyui: Model.ComfyUIConfigForm;
    gemini: Model.GeminiConfigForm;
}
