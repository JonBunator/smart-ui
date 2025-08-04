import {SmartComponentElement} from "../SmartComponentManager";
import {ChatMessage, ChatMessageCreator, ValueUpdate} from "../../utils/types.ts";

type InteractionFunction = (value: SmartComponentElement) => string | boolean | number;

const typeInteractionPayload: Record<string, InteractionFunction> = {
    button: () => true,
    checkbox: () => true,
    color: () => "#ff0000",
    date: () => (new Date()).toISOString().split("T")[0],
    ["datetime-local"]: () => (new Date()).toISOString().split(":").slice(0, 2).join(":"),
    email: () => "mail@example.com",
    month: () => (new Date()).toISOString().split("-").slice(0, 2).join("-"),
    number: () => 9,
    password: () => "passsword123",
    radio: () => true,
    range: () => 9,
    reset: () => true,
    search: () => "some text",
    submit: () => true,
    tel: (value: SmartComponentElement) => value.placeholder ?? "",
    text: () => "some text",
    time: () => "4:20",
    url: () => "https://example.com",
    week: () => (new Date()).toISOString().split("-")[0] + "-W10",
    textarea: () => "some text",
    select: (value: SmartComponentElement) => value.options !== undefined ? value.options[0].value : "",
};

const ignoredTypes = new Set<string>(["radio-group", "group", "file", "hidden", "image"]);


/**
 * Gets ids of elements in current UI state.
 * @param uiStateFlat The current flattened UI state.
 */
export function getUIElementIDs(uiStateFlat: SmartComponentElement[]) {
    return uiStateFlat.map((uiState) => uiState.id);
}

export interface UIInteractionExample {
    id: string
    value: string | boolean | number
}

/**
 * Generates example interaction for the current UI state.
 * @param uiStateFlat The current flattened UI state.
 */
export function getUIInteractionExamples(uiStateFlat: SmartComponentElement[]): UIInteractionExample[] {
    const elements: SmartComponentElement[] = _getElementsForTypes(uiStateFlat);
    const exampleInteractions = [];
    for (const element of elements) {
        if(element.type === undefined) {
            continue;
        }
        const interactionFunction = typeInteractionPayload[element.type];
        if (interactionFunction) {
            exampleInteractions.push({id: element.id, value: interactionFunction(element)});
        } else if(!ignoredTypes.has(element.type)) {
            console.warn(`No interaction example found for type: ${element.type}`);
        }
    }
    return exampleInteractions;
}

/**
 * Gets for each unique type an element in the UI tree.
 * @param uiStateFlat The current flattened UI state.
 */
function _getElementsForTypes(uiStateFlat: SmartComponentElement[]): SmartComponentElement[] {
    const result: SmartComponentElement[] = [];
    const types: Set<string> = new Set();

    for (const element of uiStateFlat) {
        if (element.type && !types.has(element.type)) {
            types.add(element.type);
            result.push(element);
        }
    }

    return result;
}

/**
 * Flattens the UI state tree into a single list of elements.
 * @param uiState The current UI state.
 */
export function flattenUIState(uiState: SmartComponentElement[]): SmartComponentElement[] {
    const result: SmartComponentElement[] = [];

    function traverse(elements: SmartComponentElement[]) {
        for (const element of elements) {
            result.push(element);
            if (element.children) {
                traverse(element.children);
            }
        }
    }

    traverse(uiState);
    return result;
}

/**
 * Extracts page transition path from ui interaction. Element must have href property.
 * @param uiInteractions The elements and values the agent want to interact with.
 * @param uiStateFlat The flat state of the ui.
 */
export function getPageTransitionPath(uiInteractions: ValueUpdate[], uiStateFlat: SmartComponentElement[]): string | undefined {
    const uiStateMap = uiStateFlat.reduce<{ [key: string]: SmartComponentElement }>((acc, element) => {
        acc[element.id] = element;
        return acc;
    }, {});
    const valueUpdate = uiInteractions.find(uiInteraction => uiStateMap[uiInteraction.id].href !== undefined);
    if(valueUpdate) {
        return uiStateMap[valueUpdate.id].href;
    }
    return undefined;
}

/**
 * Finds page transition path to different page from chat history.
 * @param chatHistory The chat history with the agent.
 */
export function findPageTransitionPath(chatHistory: ChatMessage[]): string | null {
    if(chatHistory.length === 0) {
        return null;
    }
    for (let i = chatHistory.length - 1; i >= 0; i--) {
        if (chatHistory[i].message.role === ChatMessageCreator.AGENT) {
            if(chatHistory[i].message.content === undefined) {
                return null;
            }
            return JSON.parse(chatHistory[i].message.content as string).path;
        }
    }
    return null;
}