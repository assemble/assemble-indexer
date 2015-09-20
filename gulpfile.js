var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
var del = require('rimraf');
require('jshint-stylish');

gulp.task('coverage', function () {
  return gulp.src(['index.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('coverage:clean', function (cb) {
  del('coverage', cb);
});

gulp.task('mocha', ['coverage'], function () {
  return gulp.src('test.js')
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports());
});

gulp.task('jshint', function () {
  return gulp.src(['index.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('default', ['mocha', 'jshint']);
