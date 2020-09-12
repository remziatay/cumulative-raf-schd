const sum = (a, b) => a + b;

const cumulativeRafSchd = (fn, config = [], defaultAccumulator = sum) => {
  let lastArgs = [];
  let frameId = null;

  if (!Array.isArray(config)) config = [config];
  config = Array.from(config, func =>
    func && typeof func !== "function" ? defaultAccumulator : func
  );

  const wrapperFn = (...args) => {
    config.forEach((func, i) => {
      if (func && lastArgs[i] !== undefined)
        args[i] = func(lastArgs[i], args[i]);
    });

    lastArgs = args; // Always capture the latest value

    if (frameId) return; // There is already a frame queued

    // Schedule a new frame
    frameId = requestAnimationFrame(() => {
      frameId = null;
      const newArgs = [...lastArgs]
      lastArgs = []
      fn(...newArgs);
    });
  };

  // Adding cancel property to result function
  wrapperFn.cancel = () => {
    if (!frameId) return;

    cancelAnimationFrame(frameId);
    frameId = null;
  };

  return wrapperFn;
};

export default cumulativeRafSchd;
