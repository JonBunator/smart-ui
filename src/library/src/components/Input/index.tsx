import React from "react";


export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...restProps } = props


  return <input className={`${className}`} {...restProps} />
}