System.config({
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "aurelia-dependency-injection/*": "dist/*.js"
  }
});

System.config({
  "map": {
    "aurelia-metadata": "github:aurelia/metadata@0.2.3",
    "es6-shim": "github:paulmillr/es6-shim@0.21.1"
  }
});

