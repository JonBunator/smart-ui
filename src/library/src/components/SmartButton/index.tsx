import React, {useCallback, useRef} from "react";
import {SmartComponent} from "../SmartComponent";
import {SmartComponentElementProps, ValueType} from "../types/types.ts";
import {extractTextFromNode} from "../../internal/common/utils.ts";

export type SmartButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & SmartComponentElementProps;

export function SmartButton(props: SmartButtonProps) {
    const {id, smartSemantic, children, ...restProps } = props
    const buttonRef = useRef<HTMLButtonElement>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clickButton = useCallback((_unusedValue: ValueType) => {
        if (buttonRef.current) {
            buttonRef.current.click();
        }
    }, []);

    return (
      <SmartComponent id={id} label={extractTextFromNode(children)} semantic={smartSemantic} type="button" smartOnChange={clickButton}>
          <button ref={buttonRef} id={id} {...restProps}>{children}</button>
      </SmartComponent>
    )
}