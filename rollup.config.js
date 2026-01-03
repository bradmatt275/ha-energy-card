import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import serve from "rollup-plugin-serve";

const dev = process.env.ROLLUP_WATCH;

export default {
  input: "src/energy-flow-card.ts",
  output: {
    file: "dist/energy-flow-card.js",
    format: "es",
    sourcemap: dev ? true : false,
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      declaration: false,
      declarationMap: false,
    }),
    json(),
    !dev && terser({
      format: {
        comments: false,
      },
    }),
    dev && serve({
      contentBase: ["./dist"],
      host: "0.0.0.0",
      port: 5000,
      allowCrossOrigin: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }),
  ].filter(Boolean),
};
