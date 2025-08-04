import React, {cloneElement, ReactNode, useCallback, useEffect, useRef, useState} from "react";
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
    smartOnChange?: (value: ValueType) => Promise<boolean>;
    /**
     * Callback that is invoked by AI agent. Approves agent changes.
     * @param value The newly set value.
     */
    onApprove?: (accept: boolean) => void;
    /**
     * When true, the value is only updated after approval. Defaults to false.
     */
    updateAfterApproval?: boolean;
    /**
     * When true, the value will not be reset after suggested changes are denied.
     */
    noResetAfterDeny?: boolean;
    children?: ReactNode;
}

export function SmartComponent(props: SmartComponentProps) {
    const { children, id, smartOnChange, onApprove, updateAfterApproval = false, noResetAfterDeny = false, ...smartProps } = props;

    const [changesSuggested, setChangesSuggested] = useState<boolean>(false);
    const initialValue = useRef<ValueType|undefined>(undefined);

    const { parentID } = useSmartComponentParent();
    const { addComponent, removeComponent } = useSmartComponentManager();

    const [componentId] = useState(id ?? getID());


    const onChange = useCallback(async (value: ValueType) => {
        // Only set initial value on first onChange call, must be reset via handleChangeApproval
        if(initialValue.current === undefined) {
            initialValue.current = smartProps.value;
        }

        if(value === smartProps.value) {
            return false;
        }

        let result = true;
        if(!updateAfterApproval && smartOnChange) {
            result = await smartOnChange?.(value);
        }
        // Changes suggestion should not be shown when reverted to initial value
        if(initialValue.current !== undefined && value === initialValue.current) {
            setChangesSuggested(false);
            return false;
        }
        setChangesSuggested(true);
        return result;
    }, [smartOnChange, smartProps.value, updateAfterApproval]);

    const handleChangeApproval = useCallback(async (accept: boolean, value: ValueType) => {
        let result = true;
        if(!noResetAfterDeny) {
            if(!accept && !updateAfterApproval) {
                result = await smartOnChange?.(initialValue.current) ?? true;
            } else if(accept && updateAfterApproval) {
                result = await smartOnChange?.(value) ?? true;
            }
        }
        setChangesSuggested(false);
        onApprove?.(accept);
        initialValue.current = undefined;
        return result;
    }, [onApprove, noResetAfterDeny, smartOnChange, updateAfterApproval]);

    useEffect(() => {
        addComponent(parentID, {...smartProps, id: componentId}, onChange, handleChangeApproval);

        return () => {
            removeComponent(parentID, componentId);
        }
    }, [parentID, addComponent, componentId, smartProps.semantic, smartProps.type, smartProps.value, smartProps.label, smartProps.options, smartProps.href, smartProps.required, removeComponent, onChange, handleChangeApproval]);


    /**
     * Applies className to children that contain smart-component class when changes are suggested. Generally it's not recommended
     * to use cloneElement, but it's used here for easier library use.
     */
    const childrenWithAppendedClassName = useCallback(() => {
        return React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                const element = child as React.ReactElement<{ className?: string }>;
                const existingClassName = element.props.className || "";
                let newClassName = existingClassName;
                if (existingClassName.includes("smart-component") && changesSuggested) {
                    newClassName += " smart-changes"
                }
                return cloneElement(element, {...element.props, className: newClassName});
            }
            return child;
        });
    }, [changesSuggested, children]);

    return <SmartComponentParent identifier={componentId}>{childrenWithAppendedClassName()}</SmartComponentParent>
}