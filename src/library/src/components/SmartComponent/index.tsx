import {ReactNode, useEffect} from "react";
import SmartComponentProvider, {useSmartComponentParent} from "../SmartComponentProvider";
import {SmartComponentValue, useSmartComponentManager} from "../SmartComponentManager";


interface SmartComponentProps extends SmartComponentValue {
    children?: ReactNode;
}

export function SmartComponent(props: SmartComponentProps) {
    const { children, ...smartProps } = props

    const { parentID } = useSmartComponentParent();
    const { addComponent, removeComponent } = useSmartComponentManager();

    useEffect(() => {
        addComponent(parentID, smartProps);

        return () => {
            removeComponent(parentID, smartProps.id);
        }
    }, [parentID, addComponent, smartProps.id, smartProps.semantic, smartProps.type, smartProps.value]);

    return <SmartComponentProvider identifier={smartProps.id}>{children}</SmartComponentProvider>
}