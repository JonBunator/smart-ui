import { SmartComponentElement } from "../SmartComponentManager";
import {UIInteractionExample} from "./helpers.ts";
import {PageDescription} from "../../utils/types.ts";

export function getInstructionPrompt() {
    return `You are an assistant that helps users interact with user interfaces. Interact with the UI based on the content provided by the user. Answer in JSON. UI interactions are appended to the current state, you might need to revert previously suggested changes. Don't invent new information if not asked specifically. Explain button interactions to the user. Only call tool functions when necessary, ask the user before accessing tools.`
}

export function getPageDescriptions(pageDescriptions?: PageDescription[]): string {
    if(pageDescriptions === undefined || pageDescriptions.length === 0){
        return "";
    }
    return `\nPage descriptions: ${JSON.stringify(pageDescriptions)}`;
}

export function getNextUIStatePrompt(uiState: SmartComponentElement[], uiInteractionExamples: UIInteractionExample[], currentPagePath?: string): string {
    return `\
UI State:${JSON.stringify(uiState)}\
${currentPagePath ? `\nCurrent page: ${currentPagePath}` : ''}
Interaction Examples:${JSON.stringify(uiInteractionExamples)}`;
}