

type ReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? Promise<R> :
    T extends (...args: any[]) => infer R ? Promise<R> : any;


export type Concise<T> = {
    [M in keyof T]: (...args: any[]) => Concise<T> & ReturnType<T[M]>;
}


class ConcisePromiseHanlder<T> implements ProxyHandler<Promise<T>>{
    promiseKeeper: T;

    constructor(promiseKeeper: T) {
        this.promiseKeeper = promiseKeeper;
    }

    get(lastPromise: Promise<T>, p: PropertyKey, receiver: any): any {
        if (p === 'then') {
            return lastPromise.then;
        }

        const original = (<any>this.promiseKeeper)[p];
        if (typeof original === 'function') {
            const self = this.promiseKeeper;
            return function (...args: any[]): any {
                return lastPromise.then(arg => {
                    if(arg) {
                        return original.bind(self, arg)(args);
                    } else {
                        return original.bind(self)(args);
                    }
                });
            };
        }

        throw Error(`${original} is not a function`);
    }
}

export function concise<T extends object>(obj: T): Concise<T> {
    const handler: ProxyHandler<T> = {
        get(targetThis: T, p: PropertyKey, receiver: any): any {
            const original = (<any>targetThis)[p];
            if (typeof original === 'function') {
                return function (...args: any[]): any {
                    const originalOutput = original.bind(targetThis)(args);
                    if (originalOutput instanceof Promise) {
                        return new Proxy(originalOutput, new ConcisePromiseHanlder(targetThis));
                    } else {
                        return originalOutput;
                    }
                };
            }

            return original;
        }
    };

    return <Concise<T>>new Proxy(obj, handler);
}

