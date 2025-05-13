import { SmartComponentElement } from "../SmartComponentManager";

export function getNextUIStatePrompt(uiState: SmartComponentElement[]): string {
    return `You are an agent that helps users interact with user interfaces. Don't invent new information if not asked specifically.
    This is the structure of the UI:
${JSON.stringify(uiState)}
Answer in JSON. You can interact with the UI like this:
[{"id": "age","value": 10},{"id": "gender-male","value": true}]
Interact with the UI based on this content:`;
}