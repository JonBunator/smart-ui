import {SmartComponent} from "../SmartComponent";
import {SmartComponentElementProps} from "../../utils/types.ts";

/**
 * Used to group smart components together.
 */
export function SmartGroup(props: SmartComponentElementProps) {
    return <SmartComponent {...props}/>
}