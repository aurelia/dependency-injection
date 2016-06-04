var gulp = require('gulp');
var runSequence = require('run-sequence');
var to5 = require('gulp-babel');
var paths = require('../paths');
var compilerOptions = require('../babel-options');
var compilerTsOptions = require('../typescript-options');
var assign = Object.assign || require('object.assign');
var through2 = require('through2');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var rename = require('gulp-rename');
var tools = require('aurelia-tools');
var ts = require('gulp-typescript');
var jsName = paths.packageName + '.js';

gulp.task('build-index', function() {
  var importsToAdd = [];
  var files = ['resolvers.js', 'invokers.js', 'registrations.js', 'container.js', 'injection.js'].map(function(file){
    return paths.root + file;
  });

  return gulp.src(files)
    .pipe(through2.obj(function(file, enc, callback) {
      file.contents = new Buffer(tools.extractImports(file.contents.toString("utf8"), importsToAdd));
      this.push(file);
      return callback();
    }))
    .pipe(concat(jsName))
    .pipe(insert.transform(function(contents) {
      return tools.createImportBlock(importsToAdd) + contents;
    }))
    .pipe(gulp.dest(paths.output));
});

var indexSrc = gulp
  .src(paths.output + paths.packageName + '.js')
  .pipe(rename(function (path) {
    if (path.extname == '.js') {
      path.extname = '.ts'
    }
  }))

gulp.task('build-ts-es2015', function () {
  var tsProjectES2015 = ts.createProject(compilerTsOptions.es2015(), ts.reporter.defaultReporter());
  var tsResult = indexSrc.pipe(ts(tsProjectES2015));
  return tsResult.js
    .pipe(gulp.dest(paths.output + 'es2015'));
});

gulp.task('build-ts-commonjs', function () {
  var tsProjectCommonJS = ts.createProject(compilerTsOptions.commonjs(), ts.reporter.defaultReporter());
  var tsResult = indexSrc.pipe(ts(tsProjectCommonJS));
  return tsResult.js
    .pipe(gulp.dest(paths.output + 'commonjs'));
});

gulp.task('build-ts-amd', function () {
  var tsProjectAmd = ts.createProject(compilerTsOptions.amd(), ts.reporter.defaultReporter());
  var tsResult = indexSrc.pipe(ts(tsProjectAmd));
  return tsResult.js
    .pipe(gulp.dest(paths.output + 'amd'));
});

gulp.task('build-ts-system', function () {
  var tsProjectSystem = ts.createProject(compilerTsOptions.system(), ts.reporter.defaultReporter());
  var tsResult = indexSrc.pipe(ts(tsProjectSystem));
  return tsResult.js
    .pipe(gulp.dest(paths.output + 'system'));
});

gulp.task('build-dts', function() {
  var tsProjectDTS = ts.createProject(compilerTsOptions.dts(), ts.reporter.defaultReporter());
  var tsResult = indexSrc.pipe(ts(tsProjectDTS));
  return tsResult.dts
    .pipe(gulp.dest(paths.output));
})

gulp.task('build-babel-es2015', function () {
  return gulp.src(paths.output + jsName)
    .pipe(to5(assign({}, compilerOptions.es2015())))
    .pipe(gulp.dest(paths.output + 'es2015'));
});

gulp.task('build-babel-commonjs', function () {
  return gulp.src(paths.output + jsName)
    .pipe(to5(assign({}, compilerOptions.commonjs())))
    .pipe(gulp.dest(paths.output + 'commonjs'));
});

gulp.task('build-babel-amd', function () {
  return gulp.src(paths.output + jsName)
    .pipe(to5(assign({}, compilerOptions.amd())))
    .pipe(gulp.dest(paths.output + 'amd'));
});

gulp.task('build-babel-system', function () {
  return gulp.src(paths.output + jsName)
    .pipe(to5(assign({}, compilerOptions.system())))
    .pipe(gulp.dest(paths.output + 'system'));
});

gulp.task('build-babel-modules', function () {
  return gulp.src(paths.output + jsName)
    .pipe(to5(assign({}, compilerOptions.modules())))
    .pipe(gulp.dest(paths.output + 'modules'));
});

gulp.task('build', function(callback) {
  return runSequence(
    'clean',
    'build-index',
    ['build-babel-es2015', 'build-babel-commonjs', 'build-babel-amd', 'build-babel-system', 'build-babel-modules', 'build-dts'],
    callback
  );
});

gulp.task('build-ts', function(callback) {
  return runSequence(
    'clean',
    'build-index',
    ['build-ts-es2015', 'build-ts-commonjs', 'build-ts-amd', 'build-ts-system', /** TypeScript cannot yet transpile to es5 with es2015 modules */ 'build-babel-modules', 'build-dts'],
    callback
  );
});
