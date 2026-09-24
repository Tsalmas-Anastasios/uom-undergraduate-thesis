import type * as Model from './index.core.openwebui.model.ts';

export interface AudioConfigUpdateForm {
    tts: Model.TTSConfigForm;
    stt: Model.STTConfigForm;
}
