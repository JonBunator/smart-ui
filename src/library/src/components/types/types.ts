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
     * Value of the smart component. For textfields this can be the inputted text.
     */
    value?: ValueType;
    /**
     * Additional properties.
     */
    [key: string]: any;
}

export type ValueType = string | number | readonly string[] | boolean;

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