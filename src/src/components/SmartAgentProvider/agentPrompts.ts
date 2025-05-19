import { SmartComponentElement } from "../SmartComponentManager";
import {getUIInteractionExamples} from "./helpers.ts";

export function getNextUIStatePrompt(uiState: SmartComponentElement[]): string {
    return `You are an agent that helps users interact with user interfaces. Don't invent new information if not asked specifically.
    This is the structure of the UI:
${JSON.stringify(uiState)}
Answer in JSON. You can interact with the UI like this:
${JSON.stringify(getUIInteractionExamples(uiState))}
Interact with the UI based on this content:`;
}