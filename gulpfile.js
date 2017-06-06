'use strict';

var ENV = process.env.APP_ENV || 'development';

// Here, we use dotenv  to load our env vars in the .env, into process.env
require('dotenv').config();

var gulp = require('gulp');

// plugins
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var path = require('path');
var fs = require('fs');
var ngAnnotate = require('gulp-ng-annotate');

var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');

// tasks
gulp.task('lint', function() {
  gulp.src('./app/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});
gulp.task('clean', function() {
    gulp.src('./dist/*')
      .pipe(clean({force: true}));
});
gulp.task('minify-css', function() {
  var opts = {comments:true,spare:true};
  gulp.src('./assets/sass/**/*.css')
    .pipe(minifyCSS(opts))
      .pipe(rev())
      .pipe(gulp.dest('./assets/sass/'))
      .pipe(rev.manifest())
    .pipe(gulp.dest('./rev/assets/sass/'))
});

gulp.task('minify-js', function() {
    gulp.src('./app/**/*.js')
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('./dist/app/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/app/'));
});

gulp.task('add-annotation', function () {
    return gulp.src('./app/**/*.js')
        .pipe(ngAnnotate())
        .pipe(gulp.dest('./app/'));
});

gulp.task('copy-files', function () {
  gulp.src('./app/**/*.html')
    .pipe(gulp.dest('dist/app/'));

  // gulp.src('./index.html').pipe(gulp.dest('dist/'));
});

gulp.task('copy-html-file', ['minify-css'], function () {
    gulp.src(['rev/**/*.json', './*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('dist/'));
});

gulp.task('copy-assets', function () {
    gulp.src('./assets/**/*')
        .pipe(gulp.dest('dist/assets/'));
});

gulp.task('serve-dev', function() {
  connect.server({
    root: './',
    port: 8001,
    livereload: true
  });
});

gulp.task('serve', function () {
  connect.server({
    root: './dist/',
    port: 9997,
    livereload: false
  });
});

gulp.task('html', function() {
  gulp.src('./**/*.html')
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch(['./**/*.html'], ['html']);
});

gulp.task('default', ['lint', 'serve-dev', 'watch']);

gulp.task('build', function() {
  runSequence(
    //['clean'],
    ['lint', 'minify-css', 'add-annotation', 'minify-js', 'copy-files', 'copy-html-file', 'copy-assets']
  );
});
