import React, {ReactNode, useRef} from "react";
import { SmartComponent } from "../SmartComponent";
import {ValueType} from "../types/types.ts";


interface SmartComponent {
  smartSemantic: string;
  children?: ReactNode;
}

export type SmartInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & SmartComponent;

export function SmartInput(props: SmartInputProps) {
    const { value, onChange, type, id, smartSemantic, ...restProps } = props
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * Simulates user input value update.
     * @param newValue The new value.
     */
    function updateValue(newValue: ValueType) {

        if (inputRef.current) {
            if(type === "button") {
                inputRef.current.click();
                return;
            }

            let eventName = 'value';

            if(type === "radio" || type === "checkbox") {
                eventName = 'checked';
            }
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                eventName)?.set;
            nativeInputValueSetter?.call(inputRef.current, newValue);

            const event = new Event('input', { bubbles: true });
            inputRef.current.dispatchEvent(event);
        }
    }

  return (
      <SmartComponent id={id} value={value} semantic={smartSemantic} type={type as string} smartOnChange={updateValue}>
          <input ref={inputRef} id={id} value={value} onChange={onChange} type={type ?? "text"} {...restProps}/>
      </SmartComponent>
  )
}