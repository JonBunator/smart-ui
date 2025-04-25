/**
 * Sleeps for milliseconds.
 * @param ms Delay in milliseconds.
 */
export const sleep = (ms: number) => new Promise(
    resolve => setTimeout(resolve, ms)
);