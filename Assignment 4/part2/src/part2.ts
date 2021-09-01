/* 2.1 */

export const MISSING_KEY = '___MISSING___'

type PromisedStore<K, V> = {
    get(key: K): Promise<V>,
    set(key: K, value: V): Promise<void>,
    delete(key: K): Promise<void>
}


export function makePromisedStore<K, V>(): PromisedStore<K, V> {
    var myMap:Map<K, V> = new Map<K, V>();
    return {
        get(key: K) {
            return new Promise<V> ((resolve, reject) => {
                let value:V|undefined = myMap.get(key);
                if(value === undefined)
                    reject(MISSING_KEY);
                else
                    resolve(value);
            })
        },
        set(key: K, value: V) {
            return new Promise<void> ((resolve, reject) => {
                myMap.set(key,value);
                resolve();
            })
        },
        delete(key: K) {
            return new Promise<void> ((resolve, reject) => 
                myMap.delete(key) ? resolve():
                reject(MISSING_KEY)
            )
        },
    }
}

export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): Promise<V[]> {
    return Promise.all(keys.map((key: K) => store.get(key)));
}

/* 2.2 */
export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
    const store: PromisedStore<T,R> = makePromisedStore<T,R>();
    return async (param: T) => {
        try{
            const value: R = await store.get(param);
            return value;
        }catch{
            let ret: R = f(param);
            store.set(param, ret);
            return ret;
        }
    }
}

/* 2.3 */

export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: (x: T) => boolean): () => Generator<T> {
    let gen: Generator<T> =  genFn();
    return function* () {
        for (let t of gen)
            if (filterFn(t))
                yield t;
    }
}

export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: (x: T) => R): () => Generator<R> {
    let gen: Generator<T> =  genFn();
    return function* () {
        for (let t of gen)
            yield (mapFn(t));
    }
}

/* 2.4 */
export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...((p: any) => Promise<any>)[]]): Promise<any> {
    let result: Promise<any> = fns[0]().catch(() => {
        return new Promise<any>((resolve, reject) => 
            setTimeout(() => resolve(fns[0]().catch(() => 
                new Promise<any>((resolve,reject) => 
                    setTimeout(() => resolve(fns[0]().catch((err) => {throw(err)})),2000)
                )
            )),2000)
        )
    });
    for(let i = 1; i < fns.length; i++){
            let input: any = await result;
            result = fns[i](input).catch(() => {
                return new Promise<any>((resolve, reject) => 
                    setTimeout(() =>  resolve(fns[i](input).catch(() => 
                        new Promise<any>((resolve,reject) => 
                            setTimeout(() => resolve(fns[i](input).catch((err) => {throw(err)})),2000)
                        )
                    )),2000)
                )
            });
    }
    return result;
}

