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
  lazypipe = require('lazypipe'),
  argv = require('yargs').argv,
  pngquant = require('imagemin-pngquant'),
  runSequence = require('run-sequence'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,

  // Environments
  production = !!(argv.production), // true if --prod flag is used

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
   - Output unminified CSS for debugging
   - Rename
   - Minify
   - Output minified CSS
\*-----------------------------------------*/

gulp.task('styles', function () {
  return gulp.src(paths.scss)
    .pipe( $.plumber({errorHandler: onError}) )
    .pipe($.sass({ style: 'expanded', }))
    .pipe( $.autoprefixer('last 2 version') )
    .pipe( gulp.dest(basePaths.dest) )
    .pipe( $.rename({ suffix: '.min' }) )
    .pipe( $.minifyCss() )
    .pipe( gulp.dest(basePaths.dest) )
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
  .pipe( $.if(!production, $.plumber({errorHandler: onError}) ))
  .pipe( $.if(!production, $.jshint() ))
  .pipe( $.if(!production, $.jshint.reporter('default') ))
  .pipe( $.concat('core.js') )
  .pipe( gulp.dest(basePaths.dest + 'javascript') )
  .pipe( $.uglify() )
  .pipe( $.rename({ suffix: '.min' }) )
  .pipe( gulp.dest(basePaths.dest + 'javascript') )
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
  .pipe(gulp.dest(basePaths.dest + 'javascript'))
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
        use: [ pngquant() ]
      })))
    .pipe( gulp.dest(basePaths.dest + 'images'));
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
    src: basePaths.src + 'svg',
    dest: 'images'
  },
  sprite: {
    src: basePaths.src + 'img/svg/*.svg',
    svgSymbols: 'svg/icons.svg'
  }
};

// SVG Symbols Task
// Create SVG Symbols for icons.
gulp.task('svgSymbols', function () {
  return gulp.src(svgPaths.sprite.src)
  .pipe( stripAttrs() )
  .pipe( $.svgSprite({
    mode : {
        symbol     : {
        prefix     : ".icon-%s",
        dimensions : "%s",
        sprite     : "svg/icons/icons.svg",
        dest       : svgPaths.images.dest,
        inline     : true,
        "example"  : {
          "dest": "icons-preview.html"
        }
      }
    },
    svg : {
      dimensionAttributes : false
    }
  }))
  .pipe(gulp.dest(basePaths.dest))
  .pipe($.size({title: 'SVG Symbols'}));
});

// SVG Document Injection
// Inject SVG <symbol> block just after opening <body> tag.
gulp.task('inject', function () {
  var symbols = gulp.src(basePaths.dest + svgPaths.sprite.svgSymbols);

  function fileContents (filePath, file) {
    return file.contents.toString();
  }

  return gulp.src('./public/index.php')
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
  del([basePaths.dest + 'javascript', basePaths.dest + 'images'], { read: false });
});

/*-----------------------------------------*\
   CLEAR CACHE
\*-----------------------------------------*/

gulp.task('clear', function (done) {
  return $.cache.clearAll(done);
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
   - Watch assets & public folder
   - Auto-reload browsers
\*-----------------------------------------*/

gulp.task('watch', ['browser-sync'], function() {
  gulp.watch(paths.scss, ['styles', reload]);
  gulp.watch(paths.js.src, ['scripts', reload]);
  gulp.watch([basePaths.dest + '*.html', basePaths.dest + '*.php'], reload);
});

/*-----------------------------------------*\
   CUSTOM PIPES
   - Any pipes used more than once
\*-----------------------------------------*/

// Strips attributes from SVGs
var stripAttrs = lazypipe()
  .pipe( $.cheerio, {
    run: function ($) {
      $('[fill]').removeAttr('fill');
    },
    parserOptions: { xmlMode: true }
  });
