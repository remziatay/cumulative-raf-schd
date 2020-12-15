# cumulative-raf-schd

A `throttle` function based on [raf-schd](https://github.com/alexreardon/raf-schd). With cumulative-raf-schd, it is possible to accumulate function arguments before execution. It is compatible with raf-schd.

[![NPM](https://img.shields.io/npm/v/cumulative-raf-schd.svg)](https://www.npmjs.com/package/cumulative-raf-schd)

### Install

```bash
npm install --save cumulative-raf-schd
```

### Usage

```js
import cumulativeRafSchd from "cumulative-raf-schd";

const expensiveFn = (...args) => {
  //...
  console.log(args);
};

const schedule = cumulativeRafSchd(expensiveFn, [true, false, true]);

schedule(1, 10, 100);
schedule(2, 20, 200);
schedule(3, 30, 300);
// animation frame fires
// => [6, 30, 600]
```

The second argument tells which args must accumulate and which must not. Examples:

```js
cumulativeRafSchd(func, true); //accumulate 1st argument
cumulativeRafSchd(func, [true]); //accumulate 1st argument
cumulativeRafSchd(func, [false, true]); //accumulate 2nd argument
cumulativeRafSchd(func, [0, 1]); //accumulate 2nd argument
cumulativeRafSchd(func, [, 1]); //accumulate 2nd argument
cumulativeRafSchd(func, [, , 1, , 1]); //accumulate 3rd and 5th arguments
cumulativeRafSchd(func, [0, (acc, val) => acc * val]); //accumulate 2nd argument with given function
cumulativeRafSchd(func, [(acc, val) => acc - val, (acc, val) => acc * val]); //accumulate 1st and 2nd arguments with given functions
```

Default accumulate function is addition

```js
(acc, val) => acc + val;
```

Default accumulate function can be set with 3rd argument

```js
// 3rd and 5th argument will be accumulated with given default accumulate function
cumulativeRafSchd(func, [, , 1, , 1], (acc, val) => acc * val);
```
