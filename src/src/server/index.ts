import { z } from "zod";
import {zodResponseFormat} from "openai/helpers/zod";
import OpenAI from "openai";
import {AgentInput, AgentResponse, OptionalAgentInput, ToolFunction} from "../utils/types.ts";
import {
    ChatCompletionMessageParam,
} from "openai/resources/chat/completions/completions";

function createOutputSchema(idTypes: string[]) {
    const UIInteraction = z.object({
        id: z.enum(idTypes as [string, ...string[]]).describe("Id of the UI element"),
        value: z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]).describe("New value of the UI element")
    });

    const OutputSchema = z.object({
        uiInteractions: z.array(UIInteraction).describe("List of UI interactions that should be executed"),
        naturalLanguageInteraction: z.string().describe("Interaction with the user in natural language"),
    });
    return zodResponseFormat(OutputSchema, "ui_interaction");
}

async function promptAgent(client: OpenAI, agentInput: AgentInput, optionalAgentInput?: OptionalAgentInput) {
    const model = "gpt-4.1";
    return client.chat.completions.create({
        model: model,
        messages: agentInput.messages,
        temperature: 1,
        top_p: 1,
        response_format: createOutputSchema(agentInput.uiElementIds),
        tools: optionalAgentInput?.tools?.map(item => item.tool),
    });
}

export async function callAgent(client: OpenAI, agentInput: AgentInput, optionalAgentInput?: OptionalAgentInput): Promise<AgentResponse> {
    const response = await promptAgent(client, agentInput, optionalAgentInput);
    const choice = response.choices[0];
    const message = choice.message;

    console.log("firstMessage", JSON.stringify(message));
    const toolResults: ChatCompletionMessageParam[] = [];
    if(choice.finish_reason === 'tool_calls' && message.tool_calls) {
        const toolMap: Map<string, ToolFunction> = new Map();
        optionalAgentInput?.tools?.forEach(item => {
            toolMap.set(item.tool.function.name, item);
        });

        toolResults.push({
                role: "assistant",
                tool_calls: message.tool_calls
            }
        )
        for(const tool of message.tool_calls) {
            if(toolMap.has(tool.function.name)) {
                const toolFunction = toolMap.get(tool.function.name)?.function;
                if(!toolFunction) {
                    continue;
                }
                const parsedArguments = JSON.parse(tool.function.arguments);
                const result = await toolFunction(parsedArguments);
                toolResults.push({
                    role: "tool",
                    tool_call_id: tool.id,
                    content: JSON.stringify(result),
                });
            }
        }
        const newAgentInput = {...agentInput, messages: [...agentInput.messages, ...toolResults]};
        return await callAgent(client, newAgentInput, optionalAgentInput);
    }

    const messages = agentInput.messages;

    if(message.refusal) {
        return {agentOutput: {uiInteractions: [], naturalLanguageInteraction: message.refusal}, messages}
    }
    console.log("secondMessage", JSON.stringify(message))
    if(message.content) {
        return {agentOutput: JSON.parse(message.content), messages};
    }
    return {agentOutput: {uiInteractions: [], naturalLanguageInteraction: "An error occurred"}, messages};
}
