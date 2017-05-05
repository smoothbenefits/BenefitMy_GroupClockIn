'use strict';

var gulp = require('gulp');

// plugins
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var ngConfig = require('gulp-ng-config');
var path = require('path');
var fs = require('fs');
var config = require('./config.js');
var ngAnnotate = require('gulp-ng-annotate');

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
    .pipe(gulp.dest('./assets/sass/'))
});
gulp.task('minify-js', function() {
    gulp.src('./app/**/*.js')
        .pipe(uglify({
            // inSourceMap:
            // outSourceMap: "app.js.map"
        }))
        .pipe(gulp.dest('./dist/app/'))
});
gulp.task('add-annotation', function () {
    return gulp.src('./app/**/*.js')
        .pipe(ngAnnotate())
        .pipe(gulp.dest('./app/'));
});

gulp.task('copy-bower-components', function () {
  gulp.src('./bower_components/**')
    .pipe(gulp.dest('dist/bower_components'));
});
gulp.task('copy-files', function () {
  gulp.src('./app/**/*.html')
    .pipe(gulp.dest('dist/app/'));
});
gulp.task('copy-html-file', function () {
    gulp.src('./*.html')
        .pipe(gulp.dest('dist/'));
});
gulp.task('copy-assets', function () {
    gulp.src('./assets/**/*')
        .pipe(gulp.dest('dist/assets/'));
});

gulp.task('server', function() {
  connect.server({
    root: './',
    port: 8001,
    livereload: true
  });
});
gulp.task('connectDist', function () {
  connect.server({
    root: './dist/',
    port: 9997,
    livereload: true 
  });
});

gulp.task('html', function() {
  gulp.src('./**/*.html')
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch(['./**/*.html'], ['html']);
});

gulp.task('default', ['lint', 'server', 'watch']);

gulp.task('build', function() {
  runSequence(
    //['clean'],
    ['lint', 'minify-css', 'add-annotation', 'minify-js', 'copy-files', 'copy-html-file', 'copy-assets', 'copy-bower-components', 'connectDist']
  );
});

gulp.task('ng-config', function() {
    fs.writeFileSync('./config.json',
        JSON.stringify(config[ENV]));
    gulp.src('./config.json')
        .pipe(
            ngConfig('timeTrackingApp.config', {
                createModule: false
            })
        )
        .pipe(gulp.dest('./app/scripts/'))
});

gulp.task('browserify', ['ng-config'], function() {
    return browserify(paths.app.scripts.app).bundle()
        .on('success', gutil.log.bind(gutil, 'Browserify Rebundled'))
        .on('error', gutil.log.bind(gutil, 'Browserify ' +
            'Error: in browserify gulp task'))
        .pipe(source('application.js'))
        .pipe(gulp.dest('./public/js/'));
});