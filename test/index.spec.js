import { replaceRaf } from "raf-stub";
import rafSchedule from "../src/";

replaceRaf();

beforeEach(() => {
  requestAnimationFrame.reset();
});

describe("behaviour", () => {
  it("should not execute a callback before a animation frame", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock);

    fn();

    expect(myMock).toHaveBeenCalledTimes(0);
  });

  it("should execute a callback after an animation frame", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock);

    fn();
    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
  });

  it("should not execute multiple times if waiting for a frame", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock);

    fn();
    fn();
    fn();
    fn();

    requestAnimationFrame.step();
    expect(myMock).toHaveBeenCalledTimes(1);

    // should have no impact
    requestAnimationFrame.step();
    requestAnimationFrame.flush();
    expect(myMock).toHaveBeenCalledTimes(1);
  });

  it("should execute the callback with the latest value", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock);

    fn(1);
    fn(2);
    fn(3);
    fn(4);
    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0][0]).toBe(4);
  });

  it("should execute the callbacks with the latest value when there are multiple args", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock);

    fn(1, 2, 3);
    fn(4, 5, 6);
    fn(7, 8, 9);
    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0]).toEqual([7, 8, 9]);
  });

  it("should return the exact value that was passed to the callback", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock);
    const value = { hello: "world" };

    fn(value);
    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0][0]).toBe(value);
  });

  it("should allow cancelling of a frame using .cancel", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock);

    fn(10);
    fn.cancel();
    // would normally release the function
    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(0);
  });

  it("should permit future frames after cancelling a frame", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock);

    // first frame is cancelled
    fn(10);
    fn.cancel();
    // would normally release the function
    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(0);

    // second frame is not cancelled
    fn(20);
    requestAnimationFrame.step();
    expect(myMock).toHaveBeenCalledWith(20);
  });
});

describe('respecting original "this" context', () => {
  it("should respect new bindings", () => {
    const mock = jest.fn();
    const Foo = function (a) {
      this.a = a;
    };
    Foo.prototype.callMock = function () {
      return mock(this.a);
    };
    const foo = new Foo(10);
    const schedule = rafSchedule(function () {
      foo.callMock();
    });

    schedule();
    requestAnimationFrame.step();

    expect(mock).toBeCalledWith(10);
  });

  it("should respect explicit bindings", () => {
    const mock = jest.fn();
    const callMock = function () {
      mock(this.a);
    };
    const foo = {
      a: 50,
    };
    const bound = callMock.bind(foo);
    const schedule = rafSchedule(bound);

    schedule();
    requestAnimationFrame.step();

    expect(mock).toBeCalledWith(foo.a);
  });

  it("should respect implicit bindings", () => {
    const mock = jest.fn();
    const foo = {
      a: 50,
      callMock: function () {
        mock(this.a);
      },
    };

    const schedule = rafSchedule(function () {
      foo.callMock();
    });

    schedule();
    requestAnimationFrame.step();

    expect(mock).toBeCalledWith(foo.a);
  });

  it("should respect ignored bindings", () => {
    const mock = jest.fn();
    const callMock = function () {
      // $ExpectError - this should throw!
      mock(this.a);
    };
    const schedule = rafSchedule(function () {
      callMock.call(null);
    });

    schedule();

    expect(() => requestAnimationFrame.step()).toThrow();
  });
});

describe("cumulative behaviour", () => {
  it("should not accumulate when config is undefined", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock);

    fn(1);
    fn(2);
    fn(3);
    fn(4);

    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0]).toEqual([4]);
  });

  it("should accumulate when config is truthy", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock, [true]);

    fn(1);
    fn(2);
    fn(3);
    fn(4);

    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0]).toEqual([1 + 2 + 3 + 4]);
  });

  it("should accumulate according to config function", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock, [(acc, val) => acc * val]);

    fn(1);
    fn(2);
    fn(3);
    fn(4);

    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0]).toEqual([1 * 2 * 3 * 4]);
  });

  it("should respect different accumulative options", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock, [false, true]);

    fn(1, 1);
    fn(2, 2);
    fn(3, 3);
    fn(4, 4);

    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0]).toEqual([4, 1 + 2 + 3 + 4]);
  });

  it("should treat empty slots as falsy", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock, [, true]);

    fn(1, 1, 1);
    fn(2, 2, 2);
    fn(3, 3, 3);
    fn(4, 4, 4);

    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0]).toEqual([4, 1 + 2 + 3 + 4, 4]);
  });

  it("should also accept single argument instead of array", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock, (acc, val) => acc - val);

    fn(1, 1);
    fn(2, 2);
    fn(3, 3);
    fn(4, 4);

    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0]).toEqual([1 - 2 - 3 - 4, 4]);
  });

  it("should apply default accumulator if given", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock, [false, true], (acc, val) => acc * val);

    fn(1, 1);
    fn(2, 2);
    fn(3, 3);
    fn(4, 4);

    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0]).toEqual([4, 1 * 2 * 3 * 4]);
  });

  it("should reset accumulator on every frame", () => {
    const myMock = jest.fn();
    const fn = rafSchedule(myMock, [, 1]);

    fn(1, 1);
    fn(2, 2);
    requestAnimationFrame.step();
    fn(3, 3);
    fn(4, 4);
    requestAnimationFrame.step();
    

    expect(myMock).toHaveBeenCalledTimes(2);
    expect(myMock.mock.calls[0]).toEqual([2, 1 + 2]);
    expect(myMock.mock.calls[1]).toEqual([4, 3 + 4]);
  });

});
