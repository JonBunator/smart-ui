export interface SmartComponentValue {
    /**
     * Unique identifier.
     */
    id: string;
    /**
     * Type to differentiate the smart component. Can be text, select, button etc.
     */
    type: string;
    /**
     * Value of the smart component. For textfields this can be the inputted text.
     */
    value?: string | number | readonly string[];
    /**
     * Additional properties.
     */
    [key: string]: any;
}