/*!
 * The Ultimate Gulp File
 * $ npm install gulp-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-rename gulp-cache gulp-bower gulp-scss-lint gulp-size gulp-uglify browser-sync del --save
 */

// Variables
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var paths = {
    scss: 'assets/scss/*.scss',
    js: 'assets/js/*.js'
};

// Browser Sync
gulp.task('browser-sync', function() {
    browserSync({
        proxy: "test.dev",
        notify: false
    });
});

// Styles Task
gulp.task('styles', function () {
  return gulp.src(paths.scss)
    .pipe($.plumber())
    .pipe($.sass({ style: 'expanded', }))
	.pipe($.autoprefixer('last 2 version'))
	.pipe(gulp.dest('public/_css'))
    .pipe($.rename({ suffix: '.min' }))
	.pipe($.minifyCss())
    .pipe(gulp.dest('public/_css'))
    .pipe($.size({title: 'Styles'}));
});

// Scripts Task
gulp.task('scripts',function(){
  gulp.src(paths.js)
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'))
    .pipe($.concat('scripts.js'))
    .pipe(gulp.dest('public/_js'))
    .pipe($.uglify())
    .pipe($.rename({ suffix: '.min' }))
    .pipe(gulp.dest('public/_js'))
    .pipe($.size({title: 'Scripts'}));
});

// Sass Linting
gulp.task('lint', function() {
  return gulp.src(paths.scss)
    .pipe($.scssLint({
        // 'bundleExec': true,
        'config': '.scss-lint.yml',
        'reporterOutput': 'scss-lint-report.xml'
    }));
});

// // Bower
// gulp.task('bower', function() {
//   return $.bower()
//   .pipe(gulp.dest('public/_components'))
// });

// Manual Dev task - speedy
gulp.task('dev', function() {
    gulp.start('scripts', 'styles');
});

// Clean Output Directories
gulp.task('clean', function() {
    del(['public/_css', 'public/_js'], { read: false })
});

// Manual Default task - does everything
// add 'Bower' if needed
gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts');
});

// Watch and auto-reload browser(s).
gulp.task('watch', ['browser-sync'], function() {
  gulp.watch('assets/scss/*.scss', ['styles', reload]);
  gulp.watch('assets/js/*.js', ['scripts', reload]);
  gulp.watch(['public/*.html', 'public/*.php'], reload);
});
