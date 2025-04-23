import React, {forwardRef, useCallback, useImperativeHandle, useRef} from "react";
import {SmartComponent} from "../SmartComponent";
import {extractTextFromNode} from "../../internal/common/utils.ts";
import {SmartComponentElementProps, ValueType} from "../../utils/types.ts";

export type SmartButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & SmartComponentElementProps;

const SmartButton = forwardRef<HTMLButtonElement, SmartButtonProps>((props, ref) => {
    const {id, smartSemantic, children, ...restProps } = props
    const buttonRef = useRef<HTMLButtonElement>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clickButton = useCallback((_unusedValue: ValueType) => {
        if (buttonRef.current) {
            buttonRef.current.click();
        }
    }, []);

    useImperativeHandle(ref, () => buttonRef.current!, []);

    return (
      <SmartComponent id={id} label={extractTextFromNode(children)} semantic={smartSemantic} type="button" smartOnChange={clickButton}>
          <button ref={buttonRef} id={id} {...restProps}>{children}</button>
      </SmartComponent>
    )
});

export {SmartButton};