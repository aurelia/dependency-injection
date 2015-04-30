System.config({
  "transpiler": "babel",
  "babelOptions": {
    "optional": [
      "runtime",
      "es7.decorators",
      "es7.classProperties"
    ]
  },
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "aurelia-dependency-injection/*": "dist/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "aurelia-logging": "github:aurelia/logging@0.4.0",
    "aurelia-metadata": "github:aurelia/metadata@0.5.0",
    "babel": "npm:babel-core@5.1.13",
    "babel-runtime": "npm:babel-runtime@5.1.13",
    "core-js": "npm:core-js@0.9.5",
    "github:aurelia/metadata@0.4.0": {
      "core-js": "github:zloirock/core-js@0.8.1"
    },
    "github:aurelia/metadata@0.5.0": {
      "core-js": "npm:core-js@0.9.5"
    },
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "npm:core-js@0.9.5": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});

