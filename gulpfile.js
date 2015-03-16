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

	// Folder Paths
	paths = {
		scss: basePaths.src + 'scss/**/*.scss',
		js: {
			src: basePaths.src + 'js/src/**/*.js',
			vendor: basePaths.src + 'js/vendor/*.js'
		},
		img: basePaths.src + 'img/**/*'
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
   - Ouput unminified CSS
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
   - Ouput uncompressed JS
   - Compress
	 - Rename
	 - Output compressed JS
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
   - Compress
   - Ouput compressed JS files
\*-----------------------------------------*/

gulp.task('vendorScripts',function(){
	return gulp.src(paths.js.vendor)
	.pipe($.uglify())
	.pipe(gulp.dest(basePaths.dest + '_js/vendor'))
	.pipe($.size({title: 'Vendor Scripts'}));
});


/*-----------------------------------------*\
   IMAGE OPTIMISATION  TASK
   - Optimise new images
   - Ouput
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
   SVG ICONS TASKS
   - Config
   - Create Symbol Sprites
   - Create and add Symbol ID (id="icon-example")
   - Create icon library preview page
   - Output compiled icon library
   - Inject into page

   NB: Imgmin optimises all SVGs, then
   outputs them to the _img folder.
   So we have the icon library and the
   individual SVGs at ourt disposal.
\*-----------------------------------------*/

var svgPaths = {
  images: {
    src: basePaths.src + 'img/svg',
    dest: basePaths.dest + '_img'
  },
  sprite: {
    src: basePaths.src + 'img/svg/*.svg',
    svgSymbols: '_img/svg/icons/icons.svg',
    svgSymbolsPreview: '_img/svg/icons/icons-preview.html'
  }
};

// SVG Symbols Task
// Create SVG Symbols for icons.
gulp.task('svgSymbols', function () {
  return gulp.src(svgPaths.sprite.src)
    .pipe($.svgSprites({
      mode: "symbols",
      selector: "icon-%f",
      svg: {
        symbols: svgPaths.sprite.svgSymbols
      },
      preview: {
        symbols: svgPaths.sprite.svgSymbolsPreview
      }
    }))
    .pipe(gulp.dest(basePaths.dest))
    .pipe($.size({title: 'SVG Symbols'}));
});

// SVG Document Injection
// Inject SVG <symbol> block just after opening <body> tag.
gulp.task('inject', function () {
  var symbols = gulp
    .src(basePaths.dest + svgPaths.sprite.svgSymbols)

  function fileContents (filePath, file) {
      return file.contents.toString();
  }

  return gulp
    .src('./public/index.php')
    .pipe($.inject(symbols, { transform: fileContents }))
    .pipe(gulp.dest('./public'));
});

// Run all SVG tasks
gulp.task('svg', function(cb) {
  runSequence('svgSymbols', 'inject', cb);
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
	del([basePaths.dest + '_*'], { read: false })
});


/*-----------------------------------------*\
   MANUAL DEFAULT TASK
   - Does everything
   - Tasks in array run in parralel
\*-----------------------------------------*/

gulp.task('default', ['clean'], function(cb) {
	runSequence('styles', ['scripts', 'vendorScripts', 'imgmin'], 'svg', cb);
});


/*-----------------------------------------*\
   WATCH
   - Watch assets then auto-reload browsers
\*-----------------------------------------*/

gulp.task('watch', ['browser-sync'], function() {
	gulp.watch('assets/scss/**/*.scss', ['styles', reload]);
	gulp.watch('assets/js/**/*.js', ['scripts', reload]);
	gulp.watch([basePaths.dest + '*.html', basePaths.dest + '*.php'], reload);
});
