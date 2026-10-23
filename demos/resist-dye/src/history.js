export function record(past,previous){return [...past,structuredClone(previous)].slice(-80);}
export function undo(current,past,future){if(!past.length)return {state:current,past,future};return {state:structuredClone(past.at(-1)),past:past.slice(0,-1),future:[...future,structuredClone(current)]};}
export function redo(current,past,future){if(!future.length)return {state:current,past,future};return {state:structuredClone(future.at(-1)),past:record(past,current),future:future.slice(0,-1)};}
