# gulp-inject [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> A stylesheet, javascript and webcomponent reference injection plugin for [gulp](https://github.com/wearefractal/gulp). No more manual editing of your index.html!

## Installation

First, install `gulp-inject` as a development dependency:

```shell
npm install --save-dev gulp-inject
```

## Basic usage

In your `gulpfile.js`:

```javascript
var inject = require("gulp-inject");

gulp.src('./src/index.html')
  .pipe(inject(gulp.src(["./src/*.js", "./src/*.css"], {read: false}))) // Not necessary to read the files (will speed up things), we're only after their paths
  .pipe(gulp.dest("./dist"));
```

**N.B:** The old behavior, where you specify target as a string is deprecated since `v.1.0`.

### Template contents

Add injection tags to your `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My index</title>
  <!-- inject:html -->
  <!-- any *.html files among your sources will go here as: <link rel="import" href="FILE"> -->
  <!-- endinject -->
  <!-- inject:css -->
  <!-- any *.css files among your sources will go here as: <link rel="stylesheet" href="FILE"> -->
  <!-- endinject -->
</head>
<body>
  <!-- inject:png -->
  <!-- any *.png files among your sources will go here as: <img src="FILE"> -->
  <!-- endinject -->
  <!-- inject:gif -->
  <!-- any *.gif files among your sources will go here as: <img src="FILE"> -->
  <!-- endinject -->
  <!-- inject:jpg -->
  <!-- any *.jpg files among your sources will go here as: <img src="FILE"> -->
  <!-- endinject -->
  <!-- inject:jpeg -->
  <!-- any *.jpeg files among your sources will go here as: <img src="FILE"> -->
  <!-- endinject -->

  <!-- inject:js -->
  <!-- any *.js files among your sources will go here as: <script src="FILE"></script> -->
  <!-- endinject -->
</body>
</html>
```

## More examples

### Injecting files from multiple streams

This example demonstrates how to inject files from multiple different streams into the same injection placeholder.

Install [`event-stream`](https://www.npmjs.org/package/event-stream) with: `npm install --save-dev event-stream` and use its [`merge`](https://github.com/dominictarr/event-stream#merge-stream1streamn) function.

**Code:**

```javascript
var es = require('event-stream'),
    inject = require('gulp-inject');

// Concatenate vendor scripts
var vendorStream = gulp.src(['./src/vendors/*.js'])
  .pipe(concat('vendors.js'))
  .pipe(gulp.dest('./dist'));

// Concatenate AND minify app sources
var appStream = gulp.src(['./src/app/*.js'])
  .pipe(concat('app.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./dist'));

gulp.src('./src/index.html')
  .pipe(inject(es.merge(vendorStream, appStream)))
  .pipe(gulp.dest('./dist'));
```

### Injecting some files into `<head>` and some into `<body>`

Use `gulp-inject`'s `starttag` option.

**Code:**

```javascript
var inject = require('gulp-inject');

gulp.src('./src/index.html')
  .pipe(inject(gulp.src('./src/importantFile.js', {read: false}), {starttag: '<!-- inject:head:{{ext}} -->'}))
  .pipe(inject(gulp.src(['./src/*.js', '!./src/importantFile.js'], {read: false})))
  .pipe(gulp.dest('./dist'));
```

And in your `./src/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My index</title>
  <!-- inject:head:js -->
  <!-- only importantFile.js will be injected here -->
  <!-- endinject -->
</head>
<body>

  <!-- inject:js -->
  <!-- the rest of the *.js files will be injected here -->
  <!-- endinject -->
</body>
</html>
```

### Injecting all files for development

If you use [Bower](http://bower.io/) for frontend dependencies I recommend using [`main-bower-files`](https://www.npmjs.org/package/main-bower-files) and injecting them as well.

**Code:**

```javascript
var bowerFiles = require('main-bower-files'),
    inject = require('gulp-inject'),
    stylus = require('gulp-stylus'),
    es = require('event-stream');

var cssFiles = gulp.src('./src/**/*.styl')
  .pipe(stylus())
  .pipe(gulp.dest('./build'));

gulp.src('./src/index.html')
  .pipe(inject(es.merge(
    gulp.src(bowerFiles(), {read: false}),
    cssFiles,
    gulp.src('./src/app/**/*.js', {read: false})
  )))
  .pipe(gulp.dest('./build'));
```

**Note** remember to mount `./bower_components`, `./build` and `./src/app` as static resources in your server to make this work.

### Injecting AngularJS scripts for development

If you're writing an AngularJS application and follow [Google's Angular APP Structure Recommendations](https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub), which I think you should, it's important that the script files are injected in the correct order to avoid module instantiation problems like `Uncaught Error: [$injector:modulerr]`.

To do this you can use [`gulp-angular-filesort`](https://www.npmjs.org/package/gulp-angular-filesort) together with `gulp-inject` like so:

```javascript
var angularFilesort = require('gulp-angular-filesort'),
    inject = require('gulp-inject');

gulp.src('./src/index.html')
  .pipe(inject(
    gulp.src('./src/app/**/*.js') // gulp-angular-filesort depends on file contents, so don't use {read: false} here
      .pipe(angularFilesort())
    }
  )))
  .pipe(gulp.dest('./build'));
```

### Injecting into a json-file

You can customize `gulp-inject` further by using the `transform` function option, e.g. by injecting files into a json-file.

**Code:**

```javascript
gulp.src('./files.json')
  .pipe(inject(gulp.src(['./src/*.js', './src/*.css', './src/*.html'], {read: false}), {
    starttag: '"{{ext}}": [',
    endtag: ']',
    transform: function (filepath, file, i, length) {
      return '  "' + filepath + '"' + (i + 1 < length ? ',' : '');
    }
  }))
  .pipe(gulp.dest('./'));
```

Initial contents of `files.json`:

```json
{
  "js": [
  ],
  "css": [
  ],
  "html": [
  ]
}
```

### Injecting dist files into bower.json's main section

**Code:**

```javascript
gulp.src('./bower.json')
  .pipe(inject(gulp.src(['./dist/app.min.js', './dist/app.min.css'], {read: false}), {
    starttag: '"main": [',
    endtag: ']',
    transform: function (filepath, file, i, length) {
      return '  "' + filepath + '"' + (i + 1 < length ? ',' : '');
    }
  }))
  .pipe(gulp.dest('./'));
```

### Injecting all javascript files into a karma config file

**Code:**

```javascript
gulp.src('./karma.conf.js')
  .pipe(inject(gulp.src(['./src/**/*.js'], {read: false}), {
    starttag: 'files: [',
    endtag: ']',
    transform: function (filepath, file, i, length) {
      return '  "' + filepath + '"' + (i + 1 < length ? ',' : '');
    }
  }))
  .pipe(gulp.dest('./'));
```

### Injecting files contents

In order to inject files contents you have to provide custom `transform` function, that will return file contents as string. You also have to omit `{read: false}` option of `gulp.src` in this case. Example below shows how to inject contents of html partials into head of `index.html`:

***Code:***

```javascript
gulp.src('./src/index.html')
  .pipe(inject(gulp.src(['./src/partials/head/*.html']), {
    starttag: '<!-- inject:head:{{ext}} -->',
    transform: function (filePath, file) {
      // return file contents as string
      return file.contents.toString('utf8')
    }
  }))
  .pipe(gulp.dest('./dest'));
```

And in your `./src/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My index</title>
  <!-- inject:head:html -->
  <!-- contents of html partials will be injected here -->
  <!-- endinject -->
</head>
<body>
</body>
</html>
```

## API

### inject(sources, options)

#### sources
Type: `Stream`

Provide a Vinyl File Stream as input to `inject`, see examples above.

#### options.ignorePath
Type: `String` or `Array`

Default: `NULL`


A path or paths that should be removed from each injected file path.

#### options.addPrefix
Type: `String`

Default: `NULL`


A path that should be prefixed to each injected file path.

#### options.addRootSlash
Type: `Boolean`

Default: `true`


The root slash is automatically added at the beginning of the path ('/'), or removed if set to `false`.

#### options.starttag
Type: `String`

Default: `<!-- inject:{{ext}} -->`


Set the start tag that the injector is looking for. `{{ext}}` is replaced with file extension name, e.g. "css", "js" or "html".

#### options.endtag
Type: `String`

Default: `<!-- endinject -->`


Set the end tag that the injector is looking for. `{{ext}}` is replaced with file extension name, e.g. "css", "js" or "html".

#### options.selfClosingTag
Type: `Boolean`

Default: `false`

Affects the default `options.transform` function, see below.


#### options.transform

**Type**: `Function(filepath, file, index, length, targetFile)`

**Params:**
  - `filepath` - The "unixified" path to the file with any `ignorePath`'s removed and `addPrefix` added
  - `file` - The [File object](https://github.com/wearefractal/vinyl) to inject given from `gulp.src`
  - `index` - 0-based file index
  - `length` - Total number of files to inject for the current file extension
  - `targetFile` - The target [file](https://github.com/wearefractal/vinyl) to inject into

**Purpose:**

Used to generate the content to inject for each file.

##### Default:

A function dependent on target file type and source file type that returns:

**Injecting into `html`**

* css files: `<link rel="stylesheet" href="<filename>.css">`
* js files: `<script src="<filename>.js"></script>`
* coffee files: `<script type="text/coffeescript" src="<filename>.coffee"></script>`
* html files: `<link rel="import" href="<filename>.html">`
* png files: `<img src="<filename>.png">`
* gif files: `<img src="<filename>.gif">`
* jpg files: `<img src="<filename>.jpg">`
* jpeg files: `<img src="<filename>.jpeg">`

If `options.selfClosingTag` is `true` the default transformer above will make the `<link>` and `<img>` tags self close, i.e: `<link ... />` and `<img ... />` respectively.

**Injecting into `jsx`**

The same as for injecting into `html` above with `options.selfClosingTag` set to `true`.

**Injecting into `jade`**

* css files: `link(rel="stylesheet", href="<filename>.css")`
* js files: `script(src="<filename>.js")`
* coffee files: `script(type="text/coffeescript", src="<filename>.coffee")`
* html files: `link(rel="import", href="<filename>.html")`
* png files: `img(src="<filename>.png")`
* gif files: `img(src="<filename>.gif")`
* jpg files: `img(src="<filename>.jpg")`
* jpeg files: `img(src="<filename>.jpeg")`

#### ~~options.templateString~~

***DEPRECATED!***

*Deprecated since `v.1.0`. Use [`gulp-file`](https://www.npmjs.org/package/gulp-file) instead:*

```javascript
var gulp = require('gulp');
var file = require('gulp-file');
var inject = require('gulp-inject');

file('index.html', '<html><head></head></html>')
  .pipe(inject(gulp.src(['./src/app/**/*.js']), {
    starttag: '<head>',
    endtag: '</head>'
  }))
  .pipe(gulp.dest('./dest'));
```

#### ~~options.sort~~

***DEPRECATED!***

*Deprecated since `v.1.0`. Use [`sort-stream`](https://www.npmjs.org/package/sort-stream) instead:*

```javascript
var gulp = require('gulp');
var sort = require('sort-stream');
var inject = require('gulp-inject');

gulp.src('index.html')
  .pipe(inject(gulp.src(['./src/app/**/*.js'])))
  .pipe(sort(function (a, b) {
    // Sort condition here...
  }))
  .pipe(gulp.dest('./dest'));
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-inject
[npm-image]: https://badge.fury.io/js/gulp-inject.svg

[travis-url]: http://travis-ci.org/klei/gulp-inject
[travis-image]: https://secure.travis-ci.org/klei/gulp-inject.svg?branch=master

[depstat-url]: https://david-dm.org/klei/gulp-inject
[depstat-image]: https://david-dm.org/klei/gulp-inject.svg
