import React, {ReactNode, useCallback, useRef} from "react";
import { SmartComponent } from "../SmartComponent";
import {ValueType} from "../types/types.ts";


interface SmartComponent {
  smartSemantic: string;
  children?: ReactNode;
}

export type SmartInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & SmartComponent;

export function SmartInput(props: SmartInputProps) {
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

  return (
      <SmartComponent id={id} value={value} semantic={smartSemantic} type={type as string} smartOnChange={updateValue}>
          <input ref={inputRef} id={id} checked={checked} value={value} onChange={onChange} type={type ?? "text"} {...restProps}/>
      </SmartComponent>
  )
}