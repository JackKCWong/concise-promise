

type Promisify<T> = T extends (...args: any[]) => Promise<infer R> ? Promise<R> :
    T extends (...args: any[]) => infer R ? Promise<R> : T;


export type PromiseKeeper<T> = {
    [M in keyof T]: (...args: any[]) => PromiseKeeper<T> & Promisify<T[M]>;
}


export const RESOLVED = Symbol();

class MemberMethodHanlder<T> implements ProxyHandler<Promise<T>>{
    promiseKeeper: T;

    constructor(promiseKeeper: T) {
        this.promiseKeeper = promiseKeeper;
    }

    get(lastPromise: Promise<T>, p: PropertyKey, receiver: any): any {
        switch (p) {
            case 'then':
                return lastPromise.then.bind(lastPromise);
            case 'catch':
                return lastPromise.catch.bind(lastPromise);
        }

        const original = (<any>this.promiseKeeper)[p];
        if (typeof original === 'function') {
            const self = this.promiseKeeper;
            return function (...args: any[]): any {
                return lastPromise.then(resolved => {
                    if (args[0] === RESOLVED) {
                        return original.bind(self, resolved)(args.slice(1));
                    } else if (original.length === args.length + 1) {
                        return original.bind(self, resolved)(args);
                    } else {
                        return original.bind(self)(args);
                    }
                });
            };
        }

        throw Error(`${original} is not a function`);
    }
}

export function pledge<T extends object>(obj: T): PromiseKeeper<T> {
    const handler: ProxyHandler<T> = {
        get(targetThis: T, p: PropertyKey, receiver: any): any {
            const original = (<any>targetThis)[p];
            if (typeof original === 'function') {
                return function (...args: any[]): any {
                    const originalOutput = original.bind(targetThis)(args);
                    if (originalOutput instanceof Promise) {
                        return new Proxy(originalOutput, new MemberMethodHanlder(targetThis));
                    } else {
                        return originalOutput;
                    }
                };
            }

            return original;
        }
    };

    return <PromiseKeeper<T>>new Proxy(obj, handler);
}

