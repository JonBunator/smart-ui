import { z } from "zod";
import {zodResponseFormat} from "openai/helpers/zod";
import OpenAI from "openai";
import {AgentInput, AgentResponse} from "../utils/types.ts";

function createOutputSchema(idTypes: string[]) {
    const UIInteraction = z.object({
        id: z.enum(idTypes as [string, ...string[]]).describe("Id of the UI element"),
        value: z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]).describe("New value of the UI element")
    });

    const OutputSchema = z.object({
        uiInteractions: z.array(UIInteraction).describe("List of UI interactions that should be executed"),
        naturalLanguageInteraction: z.string().describe("Interaction with the user in natural language"),
    });
    return  zodResponseFormat(OutputSchema, "ui_interaction");
}


export async function callAgent(client: OpenAI, agentInput: AgentInput): Promise<AgentResponse> {

    const model = "gpt-4o";
    const response = await client.chat.completions.create({
        model: model,
        messages: agentInput.messages,
        temperature: 1,
        top_p: 1,
        response_format: createOutputSchema(agentInput.uiElementIds),
    });
    const message = response.choices[0].message;
    if(message.refusal) {
        return {uiInteractions: [], naturalLanguageInteraction: message.refusal}
    }
    if(message.content) {
        return JSON.parse(message.content);
    }
    return {uiInteractions: [], naturalLanguageInteraction: "An error occurred"};
}
