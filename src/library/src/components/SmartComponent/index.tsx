import {ReactNode, useEffect} from "react";
import SmartComponentParent, {useSmartComponentParent} from "../../internal/SmartComponentParent";
import {useSmartComponentManager} from "../SmartComponentManager";
import {SmartComponentValue} from "../types/types.ts";


export type SmartComponentProps = SmartComponentValue & {
    /**
     * Callback that is invoked by AI agent. Changes value of component.
     * @param value
     */
    smartOnChange?: (value: string | number | readonly string[]) => void;
    children?: ReactNode;
}

export function SmartComponent(props: SmartComponentProps) {
    const { children, smartOnChange, ...smartProps } = props

    const { parentID } = useSmartComponentParent();
    const { addComponent, removeComponent } = useSmartComponentManager();

    useEffect(() => {
        addComponent(parentID, smartProps);

        return () => {
            removeComponent(parentID, smartProps.id);
        }
    }, [parentID, addComponent, smartProps.id, smartProps.semantic, smartProps.type, smartProps.value]);

    return <SmartComponentParent identifier={smartProps.id}>{children}</SmartComponentParent>
}