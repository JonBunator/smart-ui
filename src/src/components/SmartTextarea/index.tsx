import React, {forwardRef, ReactNode, useCallback, useImperativeHandle, useRef} from "react";
import { SmartComponent } from "../SmartComponent";
import {SmartComponentElementProps, ValueType} from "../../utils/types.ts";
import {extractTextFromNode} from "../../utils/helpers.ts";

export type SmartTextareaProps =  React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> & SmartComponentElementProps & {
    /**
     Label of the input.
     */
    label?: ReactNode
};

const SmartTextarea = forwardRef<HTMLTextAreaElement, SmartTextareaProps>((props, ref) => {
    const { value, id, className, smartSemantic, label, ...restProps } = props
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /**
     * Simulates user input value update.
     * @param newValue The new value.
     */
    const updateValue = useCallback(async (newValue: ValueType) => {
        if (textareaRef.current) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype,
                "value")?.set;
            nativeInputValueSetter?.call(textareaRef.current, newValue ?? '');

            const event = new Event('input', { bubbles: true });
            textareaRef.current.dispatchEvent(event);
        }
    }, []);

    useImperativeHandle(ref, () => textareaRef.current!, []);

  return (
      <SmartComponent id={id}
                      value={value}
                      type="textarea"
                      label={extractTextFromNode(label)}
                      semantic={smartSemantic}
                      smartOnChange={updateValue}>
          <textarea ref={textareaRef} className={`${className} smart-component`} id={id} value={value} {...restProps}/>
      </SmartComponent>
  )
});

export {SmartTextarea};