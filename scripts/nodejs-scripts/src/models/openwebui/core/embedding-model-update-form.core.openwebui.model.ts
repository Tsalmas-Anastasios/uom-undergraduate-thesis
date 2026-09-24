import type * as Model from './index.core.openwebui.model.ts';

export interface EmbeddingModelUpdateForm {
    openai_config?: Model.open_webui__routers__retrieval__OpenAIConfigForm | null;
    ollama_config?: Model.open_webui__routers__retrieval__OllamaConfigForm | null;
    azure_openai_config?: Model.AzureOpenAIConfigForm | null;
    embedding_engine: string;
    embedding_model: string;
    embedding_batch_size?: number | null;
}
