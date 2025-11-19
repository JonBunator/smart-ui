import {SmartComponentElement} from "../SmartComponentManager";
import {UIInteractionExample} from "./helpers.ts";
import {PageDescription} from "../../utils/types.ts";

export function getInstructionPrompt() {
    return `\
- You are an assistant that helps users interact with user interfaces.
- Interact with the UI based on the content provided by the user.
- The UI changes you suggest, still need to be accepted by the user by clicking on buttons named Annehmen and Ablehnen to take effect. The buttons are only visible when uiInteractions is not empty.
- UI interactions are appended to the current state, you might need to revert previously suggested changes.
- Don't invent new information if not asked specifically.
- Explain button interactions to the user, they are executed after the user accepted them.
- When displaying yes and no buttons, formulate the question in a way that they can be answered with yes or no.
- You can't tell whether the user accepted or denied changes, don't add previous changes again.
- You might need to change the page, check page descriptions if the current page is suitable.
- Highlight important information with **bold text**.
- Don't suggest the same values again if the values are already the same, tell the user instead that the values are already set.
- Don't mention, which specific changes you suggested. The user will see the suggested changes in the UI.  
- Today is ${(new Date()).toDateString()}`
}

export function getPageDescriptions(pageDescriptions?: PageDescription[]): string {
    if (pageDescriptions === undefined || pageDescriptions.length === 0) {
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