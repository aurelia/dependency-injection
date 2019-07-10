import typescript from "rollup-plugin-typescript2";
// import cfg from './tsconfig.json';

const isProduction = process.env.NODE_ENV === "production";
const entryName = "aurelia-dependency-injection";
// const defaultCfg = { ...cfg, include: ['src'], exclude: undefined };

// defaultCfg.compilerOptions.module = 'es2015';
// defaultCfg.compilerOptions.noEmitHelpers = true;
// defaultCfg.compilerOptions.importHelpers = true;

export default [{
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
      cacheRoot: ".rollupcache",
      // tsconfigDefaults: defaultCfg,
      // tsconfig: undefined,
      tsconfigOverride: {
        compilerOptions: {
          module: "es2015",
          target: "es2015",
        },
        exclude: ["src/internal.d.ts"],
        include: ["src"],
      },
      useTsconfigDeclarationDir: true,
    }),
  ],
}].concat(!isProduction
  ? []
  : [
    {
      input: `src/${entryName}.ts`,
      output: {
        // @ts-ignore
        file: `dist/es2017/${entryName}.js`,
        format: "es",
      },
      plugins: [
        typescript({
          // tsconfigDefaults: defaultCfg,
          // tsconfig: undefined,
          cacheRoot: ".rollupcache",
          tsconfigOverride: {
            compilerOptions: {
              module: "es2015",
              target: "es2017",
            },
            exclude: ["src/internal.d.ts"],
            include: ["src"],
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
          // tsconfigDefaults: defaultCfg,
          // tsconfig: undefined,
          cacheRoot: ".rollupcache",
          tsconfigOverride: {
            compilerOptions: {
              module: "es2015",
              target: "es5",
            },
            exclude: ["src/internal.d.ts"],
            include: ["src"],
          },
        }),
      ],
    },
  ],
);
