import {SmartComponentElement} from "../SmartComponentManager";

type InteractionFunction = (value?: SmartComponentElement) => string | boolean | number;

const typeInteractionPayload: Record<string, InteractionFunction> = {
    button: () => true,
    radio: () => true,
    number: () => 9,
    checkbox: () => true,
    text: () => "some text",
    textarea: () => "some text",
    email: () => "mail@example.com",
    select: (value?: SmartComponentElement) => value?.options !== undefined ? value.options[0].value : "",
    date: () => (new Date()).toISOString().split("T")[0],
};

const ignoredTypes = new Set<string>(["radio-group", "group"]);

/**
 * Generates example interaction for the current ui state.
 * @param uiState The current UI state.
 */
export function getUIInteractionExamples(uiState: SmartComponentElement[]) {
    const elements: SmartComponentElement[] = _getElementsForTypes(uiState);
    console.log(elements);
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
 * @param uiState The current UI state.
 */
function _getElementsForTypes(uiState: SmartComponentElement[]): SmartComponentElement[] {
    const result: SmartComponentElement[] = [];
    const types: Set<string> = new Set();

    function traverse(elements: SmartComponentElement[]) {
        for (const element of elements) {
            if (element.type && !types.has(element.type)) {
                types.add(element.type);
                result.push(element);
            }
            if (element.children) {
                traverse(element.children);
            }
        }
    }

    traverse(uiState);
    return result;
}