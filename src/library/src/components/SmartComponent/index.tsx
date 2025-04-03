import {ReactNode, useEffect, useState} from "react";
import SmartComponentParent, {useSmartComponentParent} from "../../internal/SmartComponentParent";
import {useSmartComponentManager} from "../SmartComponentManager";
import {SmartComponentValue, ValueType} from "../types/types.ts";

function getID() {
    return Math.random().toString(36).substr(2, 9);
}

export type SmartComponentProps = Omit<SmartComponentValue, 'id'> & {
    /**
     * Unique identifier.
     */
    id?: string;
    /**
     * Callback that is invoked by AI agent. Changes value of component.
     * @param value The newly set value.
     */
    smartOnChange?: (value: ValueType) => void;
    children?: ReactNode;
}

export function SmartComponent(props: SmartComponentProps) {
    const { children, id, smartOnChange, ...smartProps } = props;

    const { parentID } = useSmartComponentParent();
    const { addComponent, removeComponent, updateOnChange } = useSmartComponentManager();

    const [componentId] = useState(id ?? getID());

    useEffect(() => {
        updateOnChange(componentId, smartOnChange);
    }, [componentId, smartOnChange, updateOnChange]);

    useEffect(() => {
        addComponent(parentID, {...smartProps, id: componentId}, smartOnChange);

        return () => {
            removeComponent(parentID, componentId);
        }
    }, [parentID, addComponent, componentId, smartProps.semantic, smartProps.type, smartProps.value]);

    return <SmartComponentParent identifier={componentId}>{children}</SmartComponentParent>
}
