import OpenAI, {AzureOpenAI} from "openai";
import {ValueUpdate} from "../types/types.ts";
import { z } from "zod";
import {zodResponseFormat} from "openai/helpers/zod";

const UIInteraction = z.object({
    id: z.string(),
    value: z.union([z.string(), z.boolean(), z.number()])
});

const OutputSchema = z.object({
    interactions: z.array(UIInteraction),
});


export async function callAgent(client: OpenAI, systemPrompt: string, userPrompt: string): Promise<ValueUpdate[]> {
    const model = "gpt-4o";
    const response = await client.chat.completions.create({        model: model,
        messages: [
            { role:"system", content: systemPrompt },
            { role:"user", content: userPrompt }
        ],
        max_tokens: 4096,
        temperature: 1,
        top_p: 1,
        response_format: zodResponseFormat(OutputSchema, "ui_interaction"),
    });
    const content = response.choices[0].message.content ?? '';
    console.log(content);
    return JSON.parse(content).interactions;
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
