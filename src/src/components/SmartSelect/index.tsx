import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import {SmartComponent} from "../SmartComponent";
import {OptionType, SmartComponentElementProps, ValueType} from "../types/types.ts";

export type SmartSelectProps =  React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & SmartComponentElementProps;

const SmartSelect = forwardRef<HTMLSelectElement, SmartSelectProps>((props, ref) => {
    const {id, value, smartSemantic, children, ...restProps } = props
    const selectRef = useRef<HTMLSelectElement>(null);
    const [options, setOptions] = useState<OptionType[]>([]);

    useEffect(() => {
        if (selectRef.current) {
            const options = Array.from(selectRef.current.options);
            const optionsData = options.map(option => ({
                value: option.value,
                label: option.textContent ?? ''
            }));
            setOptions(optionsData);
        }
    }, []);


    /**
     * Simulates user input value update.
     * @param newValue The new value.
     */
    const updateValue = useCallback((newValue: ValueType) => {
        if (selectRef.current) {
            const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLSelectElement.prototype,
                "value"
            )?.set;
            nativeSelectValueSetter?.call(selectRef.current, newValue);

            const event = new Event('change', { bubbles: true });
            selectRef.current.dispatchEvent(event);
        }
    }, []);

    useImperativeHandle(ref, () => selectRef.current!, []);

    return (
        <SmartComponent id={id} value={value} options={options} semantic={smartSemantic} type="select" smartOnChange={updateValue}>
            <select ref={selectRef} value={value} id={id} {...restProps}>{children}</select>
        </SmartComponent>
    )
});

export {SmartSelect};