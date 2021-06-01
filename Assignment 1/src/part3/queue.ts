import * as R from "ramda";
import { State, bind } from "./state";

export type Queue = number[];

export const enqueue = (x: number): State<Queue,undefined> => {
    return (queue: Queue) => {return [R.concat(queue,[x]),undefined]};
}

export const dequeue = (queue: Queue): [Queue, number] => {
    return [R.slice(1,queue.length,queue),queue[0]];
}

export const queueManip = (queue: Queue): [Queue, number] => {
    return bind((initialQueue: Queue) => dequeue(initialQueue), (x: number) => 
    bind(bind(enqueue(2*x), (thirdQueue: undefined) => enqueue(x/3)), y => s => dequeue(s)))(queue);
}