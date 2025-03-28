import {ReactNode, useEffect} from "react";
import SmartComponentProvider, {SmartComponentValue, useSmartComponentParent} from "../SmartComponentProvider";
import {useSmartComponentManager} from "../SmartComponentManager";


interface SmartComponentProps extends SmartComponentValue {
    children?: ReactNode;
}

export function SmartComponent(props: SmartComponentProps) {
    const { children, ...smartProps } = props

    const { parentID } = useSmartComponentParent();
    const { addComponent, removeComponent } = useSmartComponentManager();

    useEffect(() => {
        addComponent(parentID, smartProps);
        console.log(parentID, smartProps.smartID);

        return () => {
            removeComponent(parentID, smartProps.smartID);
        }
    }, [parentID, addComponent, smartProps.smartID, smartProps.smartSemantic, smartProps.value]);

    return <SmartComponentProvider identifier={smartProps.smartID}>{children}</SmartComponentProvider>
}