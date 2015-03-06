/*!
 * The Ultimate Gulp File
 * $ npm install gulp-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-rename gulp-cache gulp-bower gulp-scss-lint gulp-size gulp-uglify browser-sync del --save
 */

// Variables
var $ = require('gulp-load-plugins')(),
	gulp = require('gulp'),
	del = require('del'),
	fs = require('fs'),
	pngquant = require('imagemin-pngquant'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,

	basePaths = {
  	src: 'assets/',
  	dest: 'public/'
	},

	paths = {
		scss: basePaths.src + 'scss/*.scss',
	  js: { src: basePaths.src + 'js/src/*.js', vendor: basePaths.src + 'js/vendor/*.js' },
		img: basePaths.src + 'img/**'
	},

	onError = function(err) {
		$.notify.onError({
			title: "Gulp",
			subtitle: "Failure!",
			message: "Error: <%= error.message %>",
			sound: "Beep"
		})(err);
		this.emit('end');
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
		.pipe( $.plumber({errorHandler: onError}) )
		.pipe( $.sass({ style: 'expanded', }) )
		.pipe( $.autoprefixer('last 2 version') )
		.pipe( gulp.dest(basePaths.dest + '_css') )
		.pipe( $.rename({ suffix: '.min' }) )
		.pipe( $.minifyCss() )
		.pipe( gulp.dest(basePaths.dest + '_css') )
		.pipe( $.size({title: 'Styles'}));
});

// Sass Linting
gulp.task('lint', function() {
	return gulp.src(paths.scss)
	.pipe( $.plumber({errorHandler: onError}) )
	.pipe( $.scssLint( {
		'bundleExec': true,
		'config': '.scss-lint.yml',
		'reporterOutput': 'scss-lint-report.xml'
	}));
});

// Scripts Task
gulp.task('scripts',function(){
	gulp.src(paths.js.src)
	.pipe( $.plumber({errorHandler: onError}) )
	.pipe( $.jshint() )
	.pipe( $.jshint.reporter('default') )
	.pipe( $.concat('core.js') )
	.pipe( gulp.dest(basePaths.dest + '_js') )
	.pipe( $.uglify() )
	.pipe( $.rename({ suffix: '.min' }) )
	.pipe( gulp.dest(basePaths.dest + '_js') )
	.pipe( $.size({title: 'Scripts'}));
});

// Leave vendor scripts intact, uglify and copy to public folder.
gulp.task('vendorScripts',function(){
  return gulp.src(paths.js.vendor)
    .pipe($.uglify())
    .pipe(gulp.dest(basePaths.dest + '_js/vendor'))
    .pipe($.size({title: 'Vendor Scripts'}));
});

// Images Task
gulp.task('imgmin', function () {
	return gulp.src(paths.img)
		.pipe( $.cache( $.imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [ pngquant() ]
			})))
		.pipe( gulp.dest(basePaths.dest + '_img'));
});

// Manual Dev task - speedy
gulp.task('dev', function() {
	gulp.start('scripts', 'styles');
});

// Clean Output Directories
gulp.task('clean', function() {
	del([basePaths.dest + '_css', basePaths.dest + '_js'], { read: false })
});

// Manual Default task - does everything
gulp.task('default', ['clean'], function() {
	gulp.start('styles', 'scripts', 'vendorScripts', 'imgmin');
});

// Watch and auto-reload browser(s).
gulp.task('watch', ['browser-sync'], function() {
	gulp.watch(basePaths.src + 'scss/*.scss', ['styles', reload]);
	gulp.watch(basePaths.src + '/js/*.js', ['scripts', reload]);
	gulp.watch([basePaths.src * '.html', basePaths.src + '.php'], reload);
});
