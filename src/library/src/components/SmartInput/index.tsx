import React from "react";
import { SmartComponent } from "../SmartComponent";


interface SmartComponent {
  smartID: string;
  smartSemantic: string;
}

interface SmartInputProps extends React.InputHTMLAttributes<HTMLInputElement>, SmartComponent {}

export function SmartInput(props: SmartInputProps) {
  const { smartID, value, smartSemantic, ...restProps } = props

  return (
      <SmartComponent id={smartID ?? "UNIQUE_STRING"} value={value} semantic={smartSemantic} type="textfield">
          <input  value={value} {...restProps} />
      </SmartComponent>
  )
}