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
	runSequence = require('run-sequence'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,

	basePaths = {
  	src: 'assets/',
  	dest: 'public/'
	},

	paths = {
		scss: 'assets/scss/*.scss',
		js: 'assets/js/*.js',
		img: 'assets/img/*'
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
		.pipe( gulp.dest('public/_css') )
		.pipe( $.rename({ suffix: '.min' }) )
		.pipe( $.minifyCss() )
		.pipe( gulp.dest('public/_css') )
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
	gulp.src(paths.js)
	.pipe( $.plumber({errorHandler: onError}) )
	.pipe( $.jshint() )
	.pipe( $.jshint.reporter('default') )
	.pipe( $.concat('core.js') )
	.pipe( gulp.dest('public/_js') )
	.pipe( $.uglify() )
	.pipe( $.rename({ suffix: '.min' }) )
	.pipe( gulp.dest('public/_js') )
	.pipe( $.size({title: 'Scripts'}));
});

// Images Task
gulp.task('imgmin', function () {
	return gulp.src(paths.img)
		.pipe( $.cache( $.imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [ pngquant() ]
			})))
		.pipe( gulp.dest('public/_img'));
});

// SVG Config
var svgPaths = {
  images: {
    src: basePaths.src + 'img/svg',
    dest: basePaths.dest + '_img'
  },
  sprite: {
    src: basePaths.src + 'img/svg/*',
    svgSymbols: '_img/svg/symbols/symbols.svg',
    svgSymbolsPreview: '_img/svg/symbols/symbols.html'
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

// Manual Dev task - speedy
gulp.task('dev', function() {
    gulp.start('scripts', 'styles');
});

// Clean Output Directories
gulp.task('clean', function() {
    del(['public/_fonts', 'public/_css', 'public/_js', 'public/_img'], { read: false })
});

// Manual Default task - does everything
gulp.task('default', ['clean'], function(cb) {
    runSequence('styles', ['scripts', 'imgmin'], 'svg', cb);
});

// Watch and auto-reload browser(s).
gulp.task('watch', ['browser-sync'], function() {
	gulp.watch('assets/scss/*.scss', ['styles', reload]);
	gulp.watch('assets/js/*.js', ['scripts', reload]);
	gulp.watch(['public/*.html', 'public/*.php'], reload);
});
