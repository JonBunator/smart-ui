import { SmartComponentElement } from "../SmartComponentManager";
import {getUIInteractionExamples} from "./helpers.ts";

export function getInstructionPrompt() {
    return "You are an assistant that helps users interact with user interfaces. Interact with the UI based on the content provided by the user. UI interactions are appended to the current state. Answer in JSON. Don't invent new information if not asked specifically"
}

export function getNextUIStatePrompt(uiState: SmartComponentElement[]): string {
    return `${JSON.stringify(uiState)}
Interaction Examples:
${JSON.stringify(getUIInteractionExamples(uiState))}`;
}