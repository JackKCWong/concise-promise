import * as chai from 'chai';
import * as cap from 'chai-as-promised';
import * as cp from '../index';

chai.use(cap);
chai.should();


class StatelessSubject {

    hello(name: string): Promise<string> {
        return Promise.resolve(name);
    }

    sayHello(name: string): Promise<string> {
        return Promise.resolve(`hello ${name}`);
    }

    bye(name: string): string {
        return `byebye ${name}`;
    }

    cu(name: string, time: string): string {
        return `see you ${time} ${name}`;
    }

    boom() {
        throw 'boom';
    }
}

class StatefulSubject {
    name: string | undefined;

    hi(name: string): Promise<void> {
        this.name = name;
        return Promise.resolve();
    }

    sayHi(): Promise<string> {
        return Promise.resolve(`hi ${this.name}`);
    }

    seeyou(time: string): string {
        return `see you ${time} ${this.name}`;
    }
}

describe("assure Test", () => {
    test("can pass down resolved from last promise", () => {
        return cp.pledge(new StatelessSubject()).hello('jack').sayHello().should.eventually
            .equal('hello jack');
    });

    test("can ignore resolved from last promise", () => {
        return cp.pledge(new StatelessSubject()).hello('jack').sayHello('rose').should.eventually
            .equal('hello rose');
    });

    test("can explicitly use resolved from last promise", () => {
        return cp.pledge(new StatelessSubject()).hello('jack').sayHello(cp.RESOLVED).should.eventually
            .equal('hello jack');
    });

    test("can explicitly use resolved from last promise with multi args", () => {
        return cp.pledge(new StatelessSubject()).hello('jack').cu(cp.RESOLVED, 'tmr').should.eventually
            .equal('see you tmr jack');
    });

    test("can turn methods return T to return Promise<T>", () => {
        return cp.pledge(new StatelessSubject()).hello('jack').bye().should.eventually
            .equal('byebye jack');
    });

    test("can catch error", () => {
        return cp.pledge(new StatelessSubject()).hello('jack').boom().should.eventually
            .rejectedWith('boom');
    });

    test("can chain like usual promise", () => {
        return cp.pledge(new StatelessSubject()).hello('jack').then(n => `see you around ${n}`).should.eventually
            .equal('see you around jack');
    });

    test("can pass down states within the subject", () => {
        return cp.pledge(new StatefulSubject()).hi('jack').sayHi().should.eventually
            .equal('hi jack');
    });

    test("can accept the right arg if last promise was Promise<Void>", () => {
        return cp.pledge(new StatefulSubject()).hi('jack').seeyou('soon').should.eventually
            .equal('see you soon jack');
    });
});
