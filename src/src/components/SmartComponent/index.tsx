import {ReactNode, useEffect, useState} from "react";
import SmartComponentParent, {useSmartComponentParent} from "../../internal/SmartComponentParent";
import {SmartComponentValue, ValueType} from "../../utils/types.ts";
import {useSmartComponentManager} from "../SmartComponentManager";

function getID() {
    return Math.random().toString(36).substring(2, 9);
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
    const { addComponent, removeComponent } = useSmartComponentManager();

    const [componentId] = useState(id ?? getID());

    useEffect(() => {
        addComponent(parentID, {...smartProps, id: componentId}, smartOnChange);

        return () => {
            removeComponent(parentID, componentId);
        }
    }, [parentID, addComponent, componentId, smartProps.semantic, smartProps.type, smartProps.value, smartProps.label, smartProps.options, smartOnChange, removeComponent]);

    return <SmartComponentParent identifier={componentId}>{children}</SmartComponentParent>
}
