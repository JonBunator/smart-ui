import { z } from "zod";
import {zodResponseFormat} from "openai/helpers/zod";
import {ValueUpdate} from "../../utils/types";
import OpenAI from "openai";
import {ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";

const UIInteraction = z.object({
    id: z.string().describe("Id of the ui element"),
    value: z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]).describe("New value of the ui element")
});

const OutputSchema = z.object({
    uiInteractions: z.array(UIInteraction).describe("List of ui interactions that should be executed"),
    naturalLanguageInteraction: z.string().describe("Interaction with the user in natural language"),
});

export type AgentResponse = {
    /**
     * List of ui interactions that should be executed
     */
    uiInteractions: ValueUpdate[]
    /**
     * Interaction with the user in natural language
     */
    naturalLanguageInteraction: string
}

export async function callAgent(client: OpenAI, messages: ChatCompletionMessageParam[]): Promise<AgentResponse> {
    const model = "gpt-4o";
    const response = await client.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 1,
        top_p: 1,
        response_format: zodResponseFormat(OutputSchema, "ui_interaction"),
    });
    const message = response.choices[0].message;
    if(message.refusal) {
        return {uiInteractions: [], naturalLanguageInteraction: message.refusal}
    }
    if(message.content) {
        return JSON.parse(message.content);
    }
    return {uiInteractions: [], naturalLanguageInteraction: "An error occured"};
}
