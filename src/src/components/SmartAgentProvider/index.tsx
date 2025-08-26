import {
    InternalSmartAgentProvider,
    SmartAgentProviderProps
} from "../../internal/InternalSmartAgentProvider";
import {SmartComponentManager} from "../../internal/SmartComponentManager";

export function SmartAgentProvider(props: SmartAgentProviderProps) {
    const {children, ...restProps} = props;

    return (
        <SmartComponentManager>
            <InternalSmartAgentProvider {...restProps}>{children}</InternalSmartAgentProvider>
        </SmartComponentManager>
    )
}