import {ReactNode, useEffect} from "react";
import SmartComponentProvider, {SmartComponentValue, useSmartComponentManager} from "../SmartComponentProvider";


interface SmartComponentProps extends SmartComponentValue {
    children?: ReactNode;
}

export function SmartComponent(props: SmartComponentProps) {
    const { children, ...smartProps } = props

    const { addComponent } = useSmartComponentManager();

    useEffect(() => {
        addComponent(smartProps);
    }, [addComponent, smartProps]);

    return <SmartComponentProvider identifier={smartProps.smartID}>{children}</SmartComponentProvider>
}