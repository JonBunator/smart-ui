import React from "react";

/**
 * Returns text content of react node. Node <div><div>Test<div/><div>123<div/><div/>
 * will return string Test 123.
 * @param node
 */
export const extractTextFromNode = (node: React.ReactNode): string | undefined => {
    let textContent = '';
    React.Children.forEach(node, (child) => {
        if (typeof child === 'string' || typeof child === 'number') {
            textContent += " " + child;
        } else if (React.isValidElement(child)) {
            const element = child as React.ReactElement<{ children?: React.ReactNode }>;
            textContent += extractTextFromNode(element.props.children);
        }
    });
    return textContent === '' ? undefined : textContent.trim();
};

/**
 * Sleeps for milliseconds.
 * @param ms Delay in milliseconds.
 */
export const sleep = (ms: number) => new Promise(
    resolve => setTimeout(resolve, ms)
);