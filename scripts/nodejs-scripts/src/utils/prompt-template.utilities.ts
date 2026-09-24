import { appPrompts } from '../prompts/app.prompts.ts';

class PromptTemplateUtilities {
    parseTemplate(data: { promptName: string; parameters: Record<string, unknown> }): string {
        const promptTemplate = (appPrompts as unknown as Record<string, unknown>)[data.promptName];
        if (typeof promptTemplate !== 'string') {
            throw new TypeError(`Prompt template not found for promptName: ${data.promptName}`);
        }

        return promptTemplate.replaceAll(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
            if (!(key in data.parameters)) {
                return match;
            }

            const value = data.parameters[key];
            if (typeof value === 'string') {
                return value;
            }

            return JSON.stringify(value);
        });
    }
}

export const promptTemplateUtilities = new PromptTemplateUtilities();
