import * as R from "ramda";
import { Result, makeFailure, makeOk, bind, either } from "../lib/result";

/* Library code */
const findOrThrow = <T>(pred: (x: T) => boolean, a: T[]): T => {
    for (let i = 0; i < a.length; i++) {
        if (pred(a[i])) return a[i];
    }
    throw "No element found.";
}

export const findResult = <T>(pred:(x: T) => boolean, arr: T[]): Result<T> => {
    const filteredArr = R.filter(pred,arr);
    if(filteredArr.length === 0)
        return makeFailure("No element found.");
    else
        return makeOk(filteredArr[0]);
}

/* Client code */
const returnSquaredIfFoundEven_v1 = (a: number[]): number => {
    try {
        const x = findOrThrow(x => x % 2 === 0, a);
        return x * x;
    } catch (e) {
        return -1;
    }
}

export const returnSquaredIfFoundEven_v2: (arr: number[]) => Result<number> = (arr: number[]) => {
    return bind(findResult(x => x % 2 === 0, arr), x => makeOk(x*x));
}

export const returnSquaredIfFoundEven_v3: (arr: number[]) => number = (arr: number[]) => {
    return either(findResult(x => x % 2 === 0, arr), x => x*x, x => -1);
}