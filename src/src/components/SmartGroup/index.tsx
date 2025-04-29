import {SmartComponent, SmartComponentProps} from "../SmartComponent";

export type SmartGroupProps = Omit<SmartComponentProps, 'smartOnChange'>

/**
 * Used to group smart components together.
 */
export function SmartGroup(props: SmartComponentProps) {
    return <SmartComponent {...props}/>
}