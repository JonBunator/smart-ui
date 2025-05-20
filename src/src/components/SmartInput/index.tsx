import React, {forwardRef, ReactNode, useCallback, useImperativeHandle, useRef, useState} from "react";
import { SmartComponent } from "../SmartComponent";
import {SmartComponentElementProps, ValueType} from "../../utils/types.ts";
import {extractTextFromNode} from "../../utils/helpers.ts";

export type SmartInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & SmartComponentElementProps & {
    /**
     Label of the input.
     */
    label?: ReactNode
};

const SmartInput = forwardRef<HTMLInputElement, SmartInputProps>((props, ref) => {
    const { value, onChange, type, id, checked, className, smartSemantic, label, ...restProps } = props
    const inputRef = useRef<HTMLInputElement>(null);
    const [checkedValue, setCheckedValue] = useState<ValueType|undefined>(undefined);

    /**
     * Simulates user input value update.
     * @param newValue The new value.
     */
    const updateValue = useCallback(async (newValue: ValueType) => {
        if (inputRef.current) {
            if(type === "button") {
                inputRef.current.click();
                return true;
            }

            if(type === "checkbox") {
                if(checked !== newValue) {
                    inputRef.current.click();
                }
                return true;
            }

            if(type === "radio") {
                setCheckedValue(newValue);
            }
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value")?.set;
            nativeInputValueSetter?.call(inputRef.current, newValue ?? '');

            const event = new Event('input', { bubbles: true });
            inputRef.current.dispatchEvent(event);
            return true;
        }
        return false;
    }, [checked, type]);

    /**
     * Radio value should be updated after approval, because click can't be undone.
     */
    const handleApprove = useCallback(async (accept: boolean) => {
        if (accept && inputRef.current && type === "radio") {
            if(checked !== checkedValue) {
                inputRef.current.click();
            }
        }
        setCheckedValue(undefined);
    }, [checked, checkedValue, type]);

    useImperativeHandle(ref, () => inputRef.current!, []);

  return (
      <SmartComponent id={id}
                      value={type !== "button" ? value : undefined}
                      label={type === "button" ? value?.toString() : extractTextFromNode(label)}
                      semantic={smartSemantic} type={type ?? "text" as string} smartOnChange={updateValue}
                      onApprove={handleApprove}>
          <input ref={inputRef} className={`${className} smart-component`} id={id} checked={checked} value={value} onChange={onChange} type={type} {...restProps}/>
      </SmartComponent>
  )
});

export {SmartInput};