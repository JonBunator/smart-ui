import React, {ReactNode, useRef} from "react";
import { SmartComponent } from "../SmartComponent";


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
     * @param value The new value.
     */
    function updateValue(value: string | number | readonly string[]) {

        if (inputRef.current) {
            if(type === "button" || type === "radio" || type === "checkbox") {
                inputRef.current.click();
                return;
            }
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value')?.set;
            nativeInputValueSetter?.call(inputRef.current, value);

            const event = new Event('input', { bubbles: true });
            inputRef.current.dispatchEvent(event);
        }
    }

  return (
      <SmartComponent id={id ?? "UNIQUE_STRING"} value={value} semantic={smartSemantic} type={type as string}>
          <input ref={inputRef} value={value} onChange={onChange} type={type ?? "text"} {...restProps}/>
          <button onClick={() => {updateValue("sports")}}>test</button>
      </SmartComponent>
  )
}