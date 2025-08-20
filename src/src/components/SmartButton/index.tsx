import React, {forwardRef, useCallback, useImperativeHandle, useRef} from "react";
import {SmartComponent} from "../SmartComponent";
import {SmartButtonElementProps, ValueType} from "../../utils/types.ts";
import {extractTextFromNode} from '../../utils/helpers.ts'

export type SmartButtonProps =
    React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
    & SmartButtonElementProps;

const SmartButton = forwardRef<HTMLButtonElement, SmartButtonProps>((props, ref) => {
    const {id, smartSemantic, smartHref, children, className, ...restProps} = props
    const buttonRef = useRef<HTMLButtonElement>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clickButton = useCallback(async (_unusedValue: ValueType) => {
        if (buttonRef.current) {
            buttonRef.current.click();
            return true;
        }
        return false;
    }, []);

    useImperativeHandle(ref, () => buttonRef.current!, []);

    return (
        <SmartComponent id={id} label={extractTextFromNode(children)} semantic={smartSemantic} type="button"
                        smartOnChange={clickButton} updateAfterApproval={true} href={smartHref}>
            <button ref={buttonRef} className={`${className} smart-component`}
                    id={id} {...restProps}>{children}</button>
        </SmartComponent>
    )
});

export {SmartButton};