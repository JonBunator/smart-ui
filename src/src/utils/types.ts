import {ReactNode} from "react";
import {ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";

export interface SmartComponentValue {
    /**
     * Unique identifier.
     */
    id: string;
    /**
     * Type to differentiate the smart component. Can be text, select, button etc.
     */
    type?: string;
    /**
     * Label to describe the smart component. For buttons this is the button text.
     */
    label?: string;
    /**
     * Value of the smart component. For textfields this can be the inputted text.
     */
    value?: ValueType;
    /**
     * Options of the select component.
     */
    options?: OptionType[];
    /**
     * Pattern used for telephone input.
     */
    pattern?: string;
    /**
     * Placeholder for some input components.
     */
    placeholder?: string;
    /**
     * Additional semantic descriptions.
     */
    semantic?: string;
}

/**
 * Allowed values for the value of a smart component.
 */
export type ValueType = string | number | boolean | readonly string[] | null | undefined;

/**
 * Option of a select.
 */
export type OptionType = {
    /**
     * Value of the option.
     */
    value: string;
    /**
     * Label describing the option.
     */
    label?: string;
}

/**
 * Is used to update the value of a smart component.
 */
export type ValueUpdate = {
    /**
     * Unique identifier.
     */
    id: string;
    /**
     * Updated value.
     */
    value: ValueType;
}

/**
 * Properties for components that use SmartComponent internally.
 */
export interface SmartComponentElementProps {
    /**
     * Semantic description of the component.
     */
    smartSemantic?: string;
    /**
     * Children elements.
     */
    children?: ReactNode;
}

/**
 * Creator of a chat message.
 */
export enum ChatMessageCreator {
    AGENT = 'assistant',
    USER = 'user',
    SYSTEM = 'system',
}

/**
 * User or agent chat message.
 */
export interface ChatMessage {
    /**
     * Creator of the message
     */
    creator: ChatMessageCreator
    /**
     * Chat message
     */
    message: string
    /**
     * Time the message was sent. In RFC 1123 date format.
     */
    sentTime: string
}

export interface AgentResponse {
    /**
     * List of ui interactions that should be executed
     */
    uiInteractions: ValueUpdate[]
    /**
     * Interaction with the user in natural language
     */
    naturalLanguageInteraction: string
}

export interface AgentInput {
    /**
     * Messages sent to the agent.
     */
    messages: ChatCompletionMessageParam[]
    /**
     * Ids of the UI elements
     */
    uiElementIds: string[]
}