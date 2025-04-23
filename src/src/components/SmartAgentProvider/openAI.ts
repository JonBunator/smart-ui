import {AzureOpenAI} from "openai";
import { z } from "zod";
import {zodResponseFormat} from "openai/helpers/zod";
import {ValueUpdate} from "../../utils/types.ts";

const UIInteraction = z.object({
    id: z.string(),
    value: z.union([z.string(), z.boolean(), z.number()])
});

const OutputSchema = z.object({
    interactions: z.array(UIInteraction),
});


export async function callAgent(client: AzureOpenAI, systemPrompt: string, userPrompt: string): Promise<ValueUpdate[]> {
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
