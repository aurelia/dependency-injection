var gulp = require('gulp');
var runSequence = require('run-sequence');
var to5 = require('gulp-babel');
var paths = require('../paths');
var compilerOptions = require('../babel-options');
var assign = Object.assign || require('object.assign');
var through2 = require('through2');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var rename = require('gulp-rename');

gulp.task('build-index', function(){
  var relativeImports = /import\s+{[a-zA-Z,\s]+}\s+from\s+'\.\/[a-zA-Z\-]+';\s+/g;
  var nonRelativeImports = /import\s+{?[a-zA-Z,\s]+}?\s+from\s+'[a-zA-Z\-]+';\s+/g;
  var importGrouper = /import\s+{([a-zA-Z,\s]+)}\s+from\s+'([a-zA-Z\-]+)';\s+/g;
  var importsToAdd = [];

  return gulp.src(paths.source)
    .pipe(through2.obj(function(file, enc, callback) {
      var content = file.contents.toString("utf8");
      var matchesToKeep = content.match(nonRelativeImports);
      if(matchesToKeep) importsToAdd = importsToAdd.concat(matchesToKeep);
      content = content.replace(nonRelativeImports, '');
      content = content.replace(relativeImports, '');
      file.contents = new Buffer(content);
      this.push(file);
      return callback();
    }))
    .pipe(concat('index.js'))
    .pipe(insert.transform(function(contents) {
      var finalImports = {}, importBlock = '';

      importsToAdd.forEach(function(toAdd){
        var groups = importGrouper.exec(toAdd);
        if(!groups) {
          toAdd = toAdd.trim();
          if(importBlock.indexOf(toAdd) === -1){
            importBlock += toAdd + '\n';
          }

          return;
        };

        var theImports = groups[1].split(',');
        var theSource = groups[2];
        var theList = finalImports[theSource] || (finalImports[theSource] = []);

        theImports.forEach(function(item){
          item = item.trim();
          if(theList.indexOf(item) == -1){
            theList.push(item);
          }
        });
      });

      Object.keys(finalImports).forEach(function(key) {
        importBlock += 'import {' + finalImports[key].join(',') + '} from \'' + key + '\';\n';
      });

      return importBlock + '\n' + contents;
    }))
    .pipe(gulp.dest(paths.output));
});

gulp.task('build-es6', function () {
  return gulp.src(paths.output + 'index.js')
    .pipe(gulp.dest(paths.output + 'es6'));
});

gulp.task('build-commonjs', function () {
  return gulp.src(paths.output + 'index.js')
    .pipe(to5(assign({}, compilerOptions, {modules:'common'})))
    .pipe(gulp.dest(paths.output + 'commonjs'));
});

gulp.task('build-amd', function () {
  return gulp.src(paths.output + 'index.js')
    .pipe(to5(assign({}, compilerOptions, {modules:'amd'})))
    .pipe(gulp.dest(paths.output + 'amd'));
});

gulp.task('build-system', function () {
  return gulp.src(paths.output + 'index.js')
    .pipe(to5(assign({}, compilerOptions, {modules:'system'})))
    .pipe(gulp.dest(paths.output + 'system'));
});

gulp.task('build-dts', function(){
  return gulp.src(paths.output + 'index.d.ts')
      .pipe(rename(paths.packageName + '.d.ts'))
      .pipe(gulp.dest(paths.output + 'es6'))
      .pipe(gulp.dest(paths.output + 'commonjs'))
      .pipe(gulp.dest(paths.output + 'amd'))
      .pipe(gulp.dest(paths.output + 'system'));
});

gulp.task('build', function(callback) {
  return runSequence(
    'clean',
    'build-index',
    ['build-es6', 'build-commonjs', 'build-amd', 'build-system'],
    'build-dts',
    callback
  );
});
