import {ReactNode} from "react";
import {ChatCompletionMessageParam, ChatCompletionTool} from "openai/resources/chat/completions/completions";

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
    /**
     * Navigates to new page when interacting with element.
     */
    href?: string;
    /**
     * Specifies that the user must fill in a value.
     */
    required?: boolean;
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
 * Properties of smart button element.
 */
export interface SmartButtonElementProps extends SmartComponentElementProps {
    /**
     * Signals the agent that clicking on the button transitions to a new page specified by the href.
     */
    smartHref?: string;
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
     * Chat message
     */
    message: ChatCompletionMessageParam
    /**
     * Time the message was sent. In RFC 1123 date format.
     */
    sentTime: string
}

export interface AgentOutput {
    /**
     * List of ui interactions that should be executed
     */
    uiInteractions: ValueUpdate[]
    /**
     * Interaction with the user in natural language
     */
    naturalLanguageInteraction: string
}

export interface AgentResponse {
    /**
     * Output of the agent.
     */
    agentOutput: AgentOutput
    /**
     * New messages that contain appended messages from agent.
     */
    messages: ChatCompletionMessageParam[]
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

export interface ToolFunction {
    /**
     * Info about the tool.
     */
    tool: ChatCompletionTool
    /**
     * The function that should be invoked.
     */
    function: (args: any) => any;
}

export interface OptionalAgentInput {
    /**
     * Tools that can be called by agent.
     */
    tools?: ToolFunction[]
}

export interface PageDescription {
    /**
     * Path of the page.
     */
    path: string
    /**
     * Describes what the page is used for.
     */
    description: string
}