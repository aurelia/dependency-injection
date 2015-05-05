var path = require('path');
var paths = require('./paths');

module.exports = {
  filename: '',
  filenameRelative: '',
  modules: '',
  sourceMap: true,
  sourceMapName: '',
  sourceRoot: '',
  moduleRoot: path.resolve('src').replace(/\\/g, '/'),
  moduleIds: false,
  experimental: false,
  comments: false,
  compact: false,
  code:true,
  stage:2,
  loose: "all",
  optional: [
    "es7.decorators",
    "es7.classProperties"
  ],
  plugins: [
    "babel-dts-generator"
  ],
  extra: {
    packageName: paths.dts.name,
    typings: paths.dts.output
  }
};
