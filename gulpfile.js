"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var uglify = require("gulp-uglify");
var pump = require('pump');
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var rename = require("gulp-rename");
var del = require("del");
var server = require("browser-sync").create();
var run = require("run-sequence");

gulp.task("style", function () {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("html", function () {
  return gulp.src("*.html")
  .pipe(posthtml([
    include()
  ]))
  .pipe(gulp.dest("build"));
});

gulp.task("images", function () {
  return gulp.src("img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("img"));
});

gulp.task("copy", function () {
  return gulp.src([
    "img/**",
    "js/**"
  ], {
    base: "."
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task('copy-html', function () {
  return gulp.src('*.{html,ico}')
    .pipe(gulp.dest('build'))
    .pipe(server.stream());
});

gulp.task('copy-js', function () {
  return gulp.src('js/*.js')
    .pipe(gulp.dest('build/js'));
});

gulp.task("jsmin", function() {
	pump([
				gulp.src("js/*.js"),
				uglify(),
				rename("script.min.js"),
				gulp.dest("build/js")
		]);
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch('*.html').on('change', function(e) {
    if (e.type !== 'deleted') {
      gulp.start('copy-html');
    }
  });
});

gulp.task("build", function (done) {
  run("clean", "copy", "style", "html", "copy-js", "jsmin", done);
});
