import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const input = "src/index.js";
const name = "cumulativeRafSchd";

export default [
  // Universal module definition (UMD) build
  {
    input,
    output: { format: "umd", file: "dist/cumulative-raf-schd.js", name },
    plugins: [
      babel(),
      replace({ "process.env.NODE_ENV": JSON.stringify("development") }),
    ],
  },
  // Universal module definition (UMD) build (production)
  {
    input,
    output: { format: "umd", file: "dist/cumulative-raf-schd.min.js", name },
    plugins: [
      babel(),
      replace({ "process.env.NODE_ENV": JSON.stringify("production") }),
      terser(),
    ],
  },
  // ESM build
  {
    input,
    output: { format: "esm", file: pkg.module },
    plugins: [babel()],
  },
  // CommonJS build
  {
    input,
    output: { format: "cjs", file: pkg.main },
    plugins: [babel()],
  },
];
