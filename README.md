# gulp-inject [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> A stylesheet, javascript and webcomponent reference injection plugin for [gulp](https://github.com/wearefractal/gulp). No more manual editing of your index.html!

## Usage

First, install `gulp-inject` as a development dependency:

```shell
npm install --save-dev gulp-inject
```

Then, add it to your `gulpfile.js`:

```javascript
var inject = require("gulp-inject");

gulp.src("./src/*.ext", {read: false}) // Not necessary to read the files (will speed up things), we're only after their paths
	.pipe(inject("path/to/your/index.html"))
	.pipe(gulp.dest("./dist"));
```

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

  <!-- inject:js -->
  <!-- any *.js files among your sources will go here as: <script src="FILE"></script> -->
  <!-- endinject -->
</body>
</html>
```

## API

### inject(filename, options)

#### filename
Type: `String`


Path to template file (where your injection tags are). Is also used as filename for the plugin's output file.

#### options.templateString
Type: `String`

Default: `NULL`


Is used as template instead of the contents of given `filename`.

#### options.ignorePath
Type: `String` or `Array`

Default: `NULL`


A path or paths that should be removed from each injected file path.

#### options.addRootSlash
Type: `Boolean`

Default: `true`


The root slash is automatically added at the beginning of the path ('/').

#### options.starttag
Type: `String`

Default: `<!-- inject:{{ext}} -->`


Set the start tag that the injector is looking for. `{{ext}}` is replaced with file extension name, e.g. "css", "js" or "html".

#### options.endtag
Type: `String`

Default: `<!-- endinject -->`


Set the end tag that the injector is looking for. `{{ext}}` is replaced with file extension name, e.g. "css", "js" or "html".

#### options.transform
Type: `Function(filepath, file, index, length)`

Params:
  - `filepath` - The "unixified" path to the file with any `ignorePath`'s removed
  - `file` - The [File object](https://github.com/wearefractal/vinyl) given from `gulp.src`
  - `index` (0-based file index)
  - `length` (total number of files to inject)

Default: a function that returns:

* For css files: `<link rel="stylesheet" href="<filename>.css">`
* For js files: `<script src="<filename>.js"></script>`
* For html files: `<link rel="import" href="<filename>.html">`


Used to generate the content to inject for each file.

#### options.sort
Type: `Function(a, b)`

Params: `a`, `b` (is used as `compareFunction` for [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort))

Default: `NULL`


If set the given function is used as the compareFunction for the array sort function, to sort the source files by.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-inject
[npm-image]: https://badge.fury.io/js/gulp-inject.png

[travis-url]: http://travis-ci.org/klei/gulp-inject
[travis-image]: https://secure.travis-ci.org/klei/gulp-inject.png?branch=master

[depstat-url]: https://david-dm.org/klei/gulp-inject
[depstat-image]: https://david-dm.org/klei/gulp-inject.png
