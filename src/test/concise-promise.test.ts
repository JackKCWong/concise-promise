import * as chai from 'chai';
import * as cap from 'chai-as-promised';
import cp = require('../index');

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
    test("can pass down result from last promise", () => {
        return cp(new StatelessSubject()).hello('jack').sayHello().should.eventually.equal('hello jack');
    });

    test("can turn methods return T to return Promise<T>", () => {
        return cp(new StatelessSubject()).hello('jack').bye().should.eventually.equal('byebye jack');
    })

    test("can pass down states within the subject", () => {
        return cp(new StatefulSubject()).hi('jack').sayHi().should.eventually.equal('hi jack');
    });

    test("can accept the right arg if last promise was Promise<Void>", () => {
        return cp(new StatefulSubject()).hi('jack').seeyou('soon').should.eventually.equal('see you soon jack');
    })
});
