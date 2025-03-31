import React from "react";
import { SmartComponent } from "../SmartComponent";


interface SmartComponent {
  smartID: string;
  smartSemantic: string;
}

export type SmartInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & SmartComponent;

export function SmartInput(props: SmartInputProps) {
  const { smartID, value, type, smartSemantic, ...restProps } = props

  return (
      <SmartComponent id={smartID ?? "UNIQUE_STRING"} value={value} semantic={smartSemantic} type={type}>
          <input value={value} type={type} {...restProps} />
      </SmartComponent>
  )
}