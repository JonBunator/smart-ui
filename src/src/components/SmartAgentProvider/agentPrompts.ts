import { SmartComponentElement } from "../SmartComponentManager";
import {UIInteractionExample} from "./helpers.ts";

export function getInstructionPrompt() {
    return "You are an assistant that helps users interact with user interfaces. Interact with the UI based on the content provided by the user. UI interactions are appended to the current state. Answer in JSON. Don't invent new information if not asked specifically. Explain button interactions to the user."
}

export function getNextUIStatePrompt(uiState: SmartComponentElement[], uiInteractionExamples: UIInteractionExample[]): string {
    return `UI State:${JSON.stringify(uiState)}
Interaction Examples:${JSON.stringify(uiInteractionExamples)}`;
}