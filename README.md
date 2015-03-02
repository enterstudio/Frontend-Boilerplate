Architect Front-end Boilerplate
===============================

A starting point for Architect front-end projects.

## Installation:

- Download and unzip into project directory 
```wget https://github.com/wearearchitect/Frontend-Boilerplate/archive/master.zip```
- run `npm install`
- run `bundle install`
- Away you go…

## Gulp

The standard build tool we’re now using is Gulp with the following plugins:

- browser-sync
- gulp-autoprefixer
- gulp-bower
- gulp-cache
- gulp-concat
- gulp-imagemin
- gulp-jshint
- gulp-load-plugins
- gulp-minify-css
- gulp-plumber
- gulp-rename
- gulp-sass (Node Sass)
- gulp-scss-lint
- gulp-size
- gulp-uglify

In the `gulpfile`, plugins are loaded with `gulp-load-plugins` so should be used with the `$.` prefix.

Tasks:

- `gulp dev` - task to run during development
- `gulp lint` - task to lint Sass code (should be run often - code should pass lint tests before a PR is accepted)
- `gulp` - task to run on before staging or production (on server)

## Structure

The main directory is `assets` that contains all the styles, scripts, and images used to create the front-end. The `assets` directory structure is:

```assets/
|- img/           # use appropriate sub-folders 
|- js/
|  |- vendor/
|  `- src/
|     `- core.js
`- scss/
|  |- base/
|  |- components/
|  |- pages/
|  |- patterns/
|  |- sections/
|  |- settings/
|  |- tools/
|  |- vendor/
   |- print.scss
   |- ie.scss     # IE stylesheet based on main.scss
   `- main.scss   # Main manifest file
```

Files are by default output to the `public` directory in the following folder structure:

```public/
|- img/     # matches assets directory structure
|- _js/
|- _css/ ```

However the output directories can be changed based on the specific project using the `paths` object at the top of the `gruntfile`:

```paths = {
	scss: 'assets/scss/*.scss',
	js: 'assets/js/*.js',
	img: 'assets/img/*'
} ```

### Sass structure

The base structure of the Sass directory should remain, whether being used or not.

_NOTE: Rendering and non-rendering Sass should remain separate, see this post for more information: https://robots.thoughtbot.com/separate-rendering-sass-from-non-rendering-sass_

Non-rendering Sass should be placed in the following folders:
- tools
- settings
- patterns

Rendering Sass should go in the remaining folders:
- base
- components
- pages
- sections
- vendor

### Sub-folders

The use of sub-folders is encouraged to further break down related files. 

In JavaScript a sub-folder of `modules` inside of  the `src` folder would be good practice to break down any smaller functionality that is used by the files in the `src` folder. 

In Sass, sub-folders are encouraged to keep partial size down and keep related styles together. When creating a sub-folder within one of the main Sass folders, also create a manifest partial of the same name to include the partials contained within. For example, in the following file structure:

```components/
|- forms/
   |- _select.scss
   |- _radio.scss
   |- _checkbox.scss
|- _forms.scss ```

The `_forms.scss` partial, should contain the manifest for the forms folder:

```@import “forms/select”;
@import “forms/radio”;
@import “forms/checkbox”; ```

## License

GPL2