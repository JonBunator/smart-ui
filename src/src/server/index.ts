import { z } from "zod";
import {zodResponseFormat} from "openai/helpers/zod";
import OpenAI from "openai";
import {AgentInput, AgentResponse, OptionalAgentInput, ToolFunction} from "../utils/types.ts";
import {
    ChatCompletionFunctionTool,
    ChatCompletionMessageParam,
} from "openai/resources/chat/completions/completions";

function createOutputSchema(idTypes: string[], allowMultipleSteps: boolean) {
    const UIInteraction = z.object({
        id: z.enum(idTypes as [string, ...string[]]).describe("Id of the UI element."),
        value: z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]).describe("New value of the UI element.")
    });

    const UserInteractionGroup = z.object({
        uiInteractions: z.array(UIInteraction).describe("List of suggested UI interactions that should be executed."),
        naturalLanguageInteraction: z.string().describe("Interaction with the user in natural language. Use Markdown for formatting and highlighting."),
        yesNoButtons: z.boolean().describe("Show yes and no buttons to the user for answering simple questions of the agent. Is only allowed when uiInteractions is empty."),
    }).describe("Interaction with the user.");

    const OutputSchemaMultipleSteps = z.object({
        interactionWithUser: z.array(UserInteractionGroup).min(1).describe("Suggests UI interaction changes. Groups will be suggested to the user in order."),
    });

    const OutputSchemaNoMultipleSteps = z.object({
        interactionWithUser: z.array(UserInteractionGroup).min(1).max(1).describe("Suggests UI interaction changes."),
    });
    return zodResponseFormat(allowMultipleSteps ? OutputSchemaMultipleSteps : OutputSchemaNoMultipleSteps, "interaction_with_user");
}

async function promptAgent(client: OpenAI, agentInput: AgentInput, optionalAgentInput?: OptionalAgentInput) {
    const model = "gpt-4.1";
    return client.chat.completions.create({
        model: model,
        messages: agentInput.messages,
        temperature: 0.0,
        response_format: createOutputSchema(agentInput.uiElementIds, agentInput.allowMultipleSteps),
        tools: optionalAgentInput?.tools?.map(item => item.tool),
    });
}

export async function callAgent(client: OpenAI, agentInput: AgentInput, optionalAgentInput?: OptionalAgentInput): Promise<AgentResponse> {
    const response = await promptAgent(client, agentInput, optionalAgentInput);
    const choice = response.choices[0];
    const message = choice.message;

    console.log("message", JSON.stringify(message));
    const toolResults: ChatCompletionMessageParam[] = [];
    if(choice.finish_reason === 'tool_calls' && message.tool_calls) {
        const toolMap: Map<string, ToolFunction> = new Map();
        optionalAgentInput?.tools?.filter(item => item.tool.type === "function")
            .forEach(item => {
                const tool = item.tool as ChatCompletionFunctionTool;
                toolMap.set(tool.function.name, item);
            });

        toolResults.push({
                role: "assistant",
                tool_calls: message.tool_calls
            }
        )
        for(const tool of message.tool_calls) {
            if(tool.type === "custom") {
                continue;
            }
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
        return {agentOutput: [{uiInteractions: [], naturalLanguageInteraction: message.refusal, yesNoButtons: false}], messages}
    }
    if(message.content) {
        try {
            // Workaround because openai sometimes returns multiple JSON outputs
            const content = message.content.split("\n{")[0];
            const parsedContent = JSON.parse(content).interactionWithUser;

            return {agentOutput: parsedContent, messages};
        } catch(e) {
            console.error(e);
        }
    }
    return {agentOutput: [{uiInteractions: [], naturalLanguageInteraction: "An error occurred", yesNoButtons: false}], messages};
}
