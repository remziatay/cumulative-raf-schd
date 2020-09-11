const sum = (a, b) => a + b;

const cumulativeRafSchd = (fn, config = []) => {
  let lastArgs = [];
  let frameId = null;

  if (!Array.isArray(config)) config = [config];
  config = Array.from(config, func =>
    func && typeof func !== "function" ? sum : func
  );

  const wrapperFn = (...args) => {
    config.forEach((func, i) => {
      if (func && lastArgs[i] !== undefined)
        args[i] = func(lastArgs[i], args[i]);
    });

    // Always capture the latest value
    lastArgs = args;

    // There is already a frame queued
    if (frameId) {
      return;
    }

    // Schedule a new frame
    frameId = requestAnimationFrame(() => {
      frameId = null;
      fn(...lastArgs);
    });
  };

  // Adding cancel property to result function
  wrapperFn.cancel = () => {
    if (!frameId) {
      return;
    }

    cancelAnimationFrame(frameId);
    frameId = null;
  };

  return wrapperFn;
};

export default cumulativeRafSchd;
