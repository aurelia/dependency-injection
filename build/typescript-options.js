exports.base = function() {
  return {
    "target": "es5",
    "module": "es2015",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node",
    "stripInternal": true,
    "preserveConstEnums": true,
    "declaration": true,
    "noExternalResolve": false,
    "removeComments": true,
    "lib": ["es2015", "dom"],
    "typescript": require('typescript')
  }
}

exports.commonjs = function() {
  var options = exports.base();
  options.module = 'commonjs';
  return options;
};

exports.amd = function() {
  var options = exports.base();
  options.module = 'amd';
  return options;
};

exports.system = function() {
  var options = exports.base();
  options.module = 'system';
  return options;
};

exports.es2015 = function() {
  var options = exports.base();
  options.target = 'es2015';
  return options;
};
