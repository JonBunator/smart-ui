import {ReactNode} from "react";

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