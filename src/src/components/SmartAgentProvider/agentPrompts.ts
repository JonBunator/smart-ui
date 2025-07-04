import { SmartComponentElement } from "../SmartComponentManager";
import {UIInteractionExample} from "./helpers.ts";

export function getInstructionPrompt(language: string) {
    return `You are an assistant that helps users interact with user interfaces. Interact with the UI based on the content provided by the user. Answer in JSON. UI interactions are appended to the current state, you might need to revert previously suggested changes. Don't invent new information if not asked specifically. Answer in ${language}. Explain button interactions to the user.`
}

export function getNextUIStatePrompt(uiState: SmartComponentElement[], uiInteractionExamples: UIInteractionExample[]): string {
    return `UI State:${JSON.stringify(uiState)}
Interaction Examples:${JSON.stringify(uiInteractionExamples)}`;
}