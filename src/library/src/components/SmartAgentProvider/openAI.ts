import OpenAI, {AzureOpenAI} from "openai";
import {ValueUpdate} from "../types/types.ts";

export async function callAgent(client: OpenAI, systemPrompt: string, userPrompt: string): Promise<ValueUpdate[]> {
    const model = "gpt-4o";

    const response = await client.chat.completions.create({
        messages: [

            { role:"system", content: systemPrompt },

            { role:"user", content: userPrompt }

        ],
        max_tokens: 4096,
        temperature: 1,
        top_p: 1,
        model: model
    });
    const content = response.choices[0].message.content ?? '';
    return JSON.parse(content);
}

export const azureOpenAIClient = () => {
    const endpoint = import.meta.env.VITE_OPENAI_ENDPOINT;
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const deployment = "gpt-4o";
    const apiVersion = import.meta.env.VITE_OPENAI_API_VERSION;
    // Only allow in development mode. This would otherwise expose API key in production
    const dangerouslyAllowBrowser = import.meta.env.DEV;
    const options = { endpoint, apiKey, deployment, apiVersion, dangerouslyAllowBrowser: dangerouslyAllowBrowser }
    return new AzureOpenAI(options)
}
