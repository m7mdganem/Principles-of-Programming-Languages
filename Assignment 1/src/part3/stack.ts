import * as R from "ramda";
import { State, bind } from "./state";

export type Stack = number[];

export const push = (x: number): State<Stack,undefined> => {
    return (stack: Stack) => {return [R.concat([x],stack),undefined]};
}

export const pop = (stack: Stack): [Stack, number] => {return [R.slice(1,stack.length,stack),stack[0]];
}

export const stackManip = (stack: Stack): [Stack, undefined] => {
    return bind((initialStack: Stack) => pop(initialStack), (x: number) => 
    bind(bind(push(x*x), (A: undefined) => (B: Stack) => pop(B)), (y: number) => push(x+y)))(stack);
}

console.log(stackManip([4, 5, 6]));