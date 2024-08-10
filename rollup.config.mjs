/// <reference types="node" />
import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

const isProduction = process.env.NODE_ENV === "production";
const entryName = "aurelia-dependency-injection";

export default [defineConfig({
  input: `src/${entryName}.ts`,
  output: [
    {
      file: `dist/es2015/${entryName}.js`,
      format: "es",
    },
    {
      file: `dist/umd-es2015/${entryName}.js`,
      format: "umd",
      globals: {
        "aurelia-metadata": "au",
        "aurelia-binding": "au",
        "aurelia-dependency-injection": "au",
        "aurelia-logging": "au.LogManager",
        "aurelia-pal": "au",
        "aurelia-task-queue": "au",
        "aurelia-templating": "au",
      },
      name: "au.validation",
    },
  ],
  plugins: [
    typescript({
      compilerOptions: {
        module: "es2015",
        target: "es2015",
      },
    }),
  ],
})].concat(!isProduction
  ? []
  : defineConfig([
    {
      input: `src/${entryName}.ts`,
      output: [{
        file: `dist/es2017/${entryName}.js`,
        format: "es",
      }],
      plugins: [
        typescript({
          compilerOptions: {
            module: "es2015",
            target: "es2017",
          },
        }),
      ],
    },
    {
      input: `src/${entryName}.ts`,
      output: [
        { file: `dist/commonjs/${entryName}.js`, format: "cjs" },
        { file: `dist/amd/${entryName}.js`, format: "amd", amd: { id: entryName } },
        { file: `dist/native-modules/${entryName}.js`, format: "es" },
        { file: `dist/umd/${entryName}.js`,
          format: "umd",
          globals: {
            "aurelia-metadata": "au",
            "aurelia-binding": "au",
            "aurelia-dependency-injection": "au",
            "aurelia-logging": "au.LogManager",
            "aurelia-pal": "au",
            "aurelia-task-queue": "au",
            "aurelia-templating": "au",
          },
          name: "au.validation",
        },
        { file: `dist/system/${entryName}.js`, format: "system" },
      ],
      plugins: [
        typescript({
          compilerOptions: {
            module: "es2015",
            target: "es5",
          },
        }),
      ],
    },
  ]),
).map(config => {
  config.external = [
    "aurelia-metadata",
    "aurelia-binding",
    "aurelia-dependency-injection",
    "aurelia-logging",
    "aurelia-pal",
    "aurelia-task-queue",
    "aurelia-templating",
  ];
  if (Array.isArray(config.output)) {
    config.output.forEach(output => output.sourcemap = true);
  }
  config.onwarn = /** @type {import('rollup').WarningHandlerWithDefault} */ (warning, warn) => {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning.message);
  };

  return config;
});
