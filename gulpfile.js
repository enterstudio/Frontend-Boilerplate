/**
 * GULPFILE - By @wearearchitect
 */

/*-----------------------------------------*\
    VARIABLES
\*-----------------------------------------*/

// Dependencies
var $ = require('gulp-load-plugins')(),
	gulp = require('gulp'),
	del = require('del'),
	fs = require('fs'),
	pngquant = require('imagemin-pngquant'),
	runSequence = require('run-sequence'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,

	// Base Paths
	basePaths = {
		src: 'assets/',
		dest: 'public/'
	},

	// Assets Folder Paths
	paths = {
		scss: basePaths.src + 'scss/**/*.scss',
		js: {
			src: basePaths.src + 'js/src/**/*.js',
			vendor: basePaths.src + 'js/vendor/*.js'
		},
		img: basePaths.src + 'img/**'
	},


/*-----------------------------------------*\
    ERROR NOTIFICATION
    - Beep!
\*-----------------------------------------*/

	onError = function(err) {
		$.notify.onError({
			title: "Gulp",
			subtitle: "Failure!",
			message: "Error: <%= error.message %>",
			sound: "Beep"
		})(err);
		this.emit('end');
	};


/*-----------------------------------------*\
    BROWSER SYNC
    - View project at test.dev:3000
\*-----------------------------------------*/

gulp.task('browser-sync', function() {
	browserSync({
		proxy: "test.dev",
		notify: false
	});
});


/*-----------------------------------------*\
   STYLES TASK
   - Catch errors via gulp-plumber
   - Compile Sass
   - Vendor prefix
   - Output unminified CSS for debugging
   - Rename
	 - Minify
	 - Output minified CSS
\*-----------------------------------------*/

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


/*-----------------------------------------*\
    SASS LINTING
    - Keep your code squeaky clean
\*-----------------------------------------*/

gulp.task('lint', function() {
	return gulp.src(paths.scss)
	.pipe( $.plumber({errorHandler: onError}) )
	.pipe( $.scssLint( {
		'bundleExec': true,
		'config': '.scss-lint.yml',
		'reporterOutput': 'scss-lint-report.xml'
	}));
});


/*-----------------------------------------*\
   SCRIPTS TASK
   - Catch errors via gulp-plumber
   - Hint
   - Concatenate assets/js into core.js
   - Output unminified JS for debugging
   - Minify
	 - Rename
	 - Output minified JS
\*-----------------------------------------*/

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


/*-----------------------------------------*\
   VENDOR SCRIPTS TASK
   - Leave vendor scripts intact
   - Minify
   - Output minified scripts
\*-----------------------------------------*/

gulp.task('vendorScripts',function(){
	return gulp.src(paths.js.vendor)
	.pipe($.uglify())
	.pipe(gulp.dest(basePaths.dest + '_js/vendor'))
	.pipe($.size({title: 'Vendor Scripts'}));
});


/*-----------------------------------------*\
   IMAGE OPTIMISATION TASK
   - Optimise only new images + SVGs
   - Output
\*-----------------------------------------*/

gulp.task('imgmin', function () {
	return gulp.src(paths.img)
		.pipe( $.cache( $.imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [ pngquant() ]
			})))
		.pipe( gulp.dest(basePaths.dest + '_img'));
});


/*-----------------------------------------*\
   DEV TASK
   - Speedy!
\*-----------------------------------------*/

gulp.task('dev', function() {
	gulp.start('scripts', 'styles');
});


/*-----------------------------------------*\
   CLEAN OUTPUT DIRECTORIES
\*-----------------------------------------*/

gulp.task('clean', function() {
	del([basePaths.dest + '_css', basePaths.dest + '_js'], { read: false })
});


/*-----------------------------------------*\
   MANUAL DEFAULT TASK
   - Does everything
   - Tasks in array run in parralel
\*-----------------------------------------*/

gulp.task('default', ['clean'], function(cb) {
	runSequence('styles', ['scripts', 'vendorScripts'], 'imgmin', cb);
});

/*-----------------------------------------*\
   WATCH
   - Watch assets & public folder
   - Auto-reload browsers
\*-----------------------------------------*/

gulp.task('watch', ['browser-sync'], function() {
	gulp.watch(paths.scss, ['styles', reload]);
	gulp.watch(paths.js.src, ['scripts', reload]);
	gulp.watch([basePaths.dest + '*.html', basePaths.dest + '*.php'], reload);
});
