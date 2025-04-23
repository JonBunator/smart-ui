import React, {forwardRef, useCallback, useImperativeHandle, useRef} from "react";
import { SmartComponent } from "../SmartComponent";
import {SmartComponentElementProps, ValueType} from "../../utils/types.ts";

export type SmartInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & SmartComponentElementProps;

const SmartInput = forwardRef<HTMLInputElement, SmartInputProps>((props, ref) => {
    const { value, onChange, type, id, checked, smartSemantic, ...restProps } = props
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * Simulates user input value update.
     * @param newValue The new value.
     */
    const updateValue = useCallback((newValue: ValueType) => {
        if (inputRef.current) {
            if(type === "button") {
                inputRef.current.click();
                return;
            }

            if(type === "radio" || type === "checkbox") {
                if(checked !== newValue) {
                    inputRef.current.click();
                }
                return
            }
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value")?.set;
            nativeInputValueSetter?.call(inputRef.current, newValue);

            const event = new Event('input', { bubbles: true });
            inputRef.current.dispatchEvent(event);
        }
    }, [checked, type]);

    useImperativeHandle(ref, () => inputRef.current!, []);

  return (
      <SmartComponent id={id}
                      value={type !== "button" ? value : undefined}
                      label={type === "button" ? value : undefined}
                      semantic={smartSemantic} type={type ?? "text" as string} smartOnChange={updateValue}>
          <input ref={inputRef} id={id} checked={checked} value={value} onChange={onChange} type={type} {...restProps}/>
      </SmartComponent>
  )
});

export {SmartInput};