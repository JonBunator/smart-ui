import React, {forwardRef, useCallback, useImperativeHandle, useRef} from "react";
import {SmartComponent} from "../SmartComponent";
import {SmartComponentElementProps, ValueType} from "../../utils/types.ts";
import {extractTextFromNode, sleep} from '../../utils/helpers.ts'

export type SmartButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & SmartComponentElementProps;

const SmartButton = forwardRef<HTMLButtonElement, SmartButtonProps>((props, ref) => {
    const {id, smartSemantic, children, className, ...restProps } = props
    const buttonRef = useRef<HTMLButtonElement>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clickButton = useCallback(async (_unusedValue: ValueType) => {
        // Sleep before clicking on button to wait for state update.
        await sleep(1000);
        if (buttonRef.current) {
            buttonRef.current.click();
        }
    }, []);

    useImperativeHandle(ref, () => buttonRef.current!, []);

    return (
      <SmartComponent id={id} label={extractTextFromNode(children)} semantic={smartSemantic} type="button" smartOnChange={clickButton} updateAfterApproval={true}>
          <button ref={buttonRef} className={`${className} smart-component`} id={id} {...restProps}>{children}</button>
      </SmartComponent>
    )
});

export {SmartButton};