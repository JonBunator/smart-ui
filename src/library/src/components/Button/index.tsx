import React from "react";
import {SmartComponent} from "../SmartComponent";

export function Button(props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
  const {id, ...restProps } = props

  return (
      <SmartComponent id={id ?? "other_val"}>
        <button id={id} {...restProps} />
      </SmartComponent>
  )
}