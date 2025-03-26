import React from "react";


interface SmartComponent {
  smartSemantic: string;
}

interface SmartInputProps extends React.InputHTMLAttributes<HTMLInputElement>, SmartComponent {

}

export function SmartInput(props: SmartInputProps) {
  const { className, ...restProps } = props


  return <input className={`${className}`} {...restProps} />
}