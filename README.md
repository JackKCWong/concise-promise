# concise-promise

A library to make working with Promise chain more concise

## to begin

```bash
npm i concise-promise
```

## use case

When I was using `simple-git` to write a handy utility, I was doing like:

```js
git.add(...).then(git.commit).then(git.push)
```

I think that's pretty verbose, can I just do this instead?

```js
git.add(...).commit(...).push()
```

So I started this experimental lib and try if I can improve this in limited senarios.

## examples

Please see [test cases](src/test/concise-promise.test.ts)
