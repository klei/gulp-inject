/*global describe, it*/
'use strict';

var fs = require('fs'),
  path = require('path'),
  es = require('event-stream'),
  should = require('should');

var gutil = require('gulp-util'),
  inject = require('./');

function expectedFile (file) {
  var filepath = path.resolve(__dirname, 'expected', file);
  return new gutil.File({
    path: filepath,
    cwd: __dirname,
    base: path.resolve(__dirname, 'expected', path.dirname(file)),
    contents: fs.readFileSync(filepath)
  });
}

function fixture (file, read) {
  var filepath = path.resolve(__dirname, 'fixtures', file);
  return new gutil.File({
    path: filepath,
    cwd: __dirname,
    base: path.resolve(__dirname, 'fixtures', path.dirname(file)),
    contents: read ? fs.readFileSync(filepath) : null
  });
}

describe('gulp-inject', function () {
  it('should throw an error when the old api with target as string is used', function () {
    should(function () {
      var stream = inject('fixtures/template.html');
    }).throw();
  });

  it('should throw an error if sources stream is undefined', function () {
    should(function () {
      var stream = inject();
    }).throw();
  });

  it('should throw an error if `templateString` option is specified', function () {
    should(function () {
      src(['template.html'], {read: true})
        .pipe(inject(src(['file.js']), {templateString: '<html></html>'}));
    }).throw();
  });

  it('should throw an error if `sort` option is specified', function () {
    should(function () {
      src(['template.html'], {read: true})
        .pipe(inject(src(['file.js']), {sort: function () {}}));
    }).throw();
  });

  it('should inject stylesheets, scripts, images and html components into desired file', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css',
      'image.png',
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['defaults.html'], done);
  });

  it('should inject sources into multiple targets', function (done) {

    var target = src(['template.html', 'template2.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css',
      'image.png'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['defaults.html', 'defaults2.html'], done);
  });

  it('should inject stylesheets, scripts and html components with `ignorePath` removed from file path', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'lib2.js',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources, {ignorePath: '/fixtures'}));

    streamShouldContain(stream, ['ignorePath.html'], done);
  });

  it('should inject stylesheets, scripts and html components with relative paths to target file if `relative` is truthy', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      '../../folder/lib.js',
      '../../another/component.html',
      '../a-folder/lib2.js',
      '../../yet-another/styles.css'
    ]);

    var stream = target.pipe(inject(sources, {relative: true}));

    streamShouldContain(stream, ['relative.html'], done);
  });

  it('should inject stylesheets, scripts and html components with `addPrefix` added to file path', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'lib2.js',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources, {addPrefix: 'my-test-dir'}));

    streamShouldContain(stream, ['addPrefix.html'], done);
  });

  it('should inject stylesheets and html components with self closing tags if `selfClosingTag` is truthy', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'component.html',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources, {selfClosingTag: true}));

    streamShouldContain(stream, ['selfClosingTag.html'], done);
  });

  it('should inject stylesheets, scripts and html components without root slash if `addRootSlash` is `false`', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources, {addRootSlash: false}));

    streamShouldContain(stream, ['noRootSlash.html'], done);
  });

  it('should inject stylesheets, scripts and html components without root slash if `addRootSlash` is `false` and `ignorePath` is set', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'a/folder/lib.js',
      'a/folder/component.html',
      'a/folder/styles.css'
    ]);

    var stream = target.pipe(inject(sources, {addRootSlash: false, ignorePath: 'fixtures'}));

    streamShouldContain(stream, ['noRootSlashWithIgnorePath.html'], done);
  });

  it('should use starttag and endtag if specified', function (done) {
    var target = src(['templateCustomTags.html'], {read: true});
    var sources = src([
      'lib.js',
      'lib2.js'
    ]);

    var stream = target.pipe(inject(sources, {
      ignorePath: 'fixtures',
      starttag: '<!DOCTYPE html>',
      endtag: '<h1>'
    }));

    streamShouldContain(stream, ['customTags.html'], done);
  });

  it('should replace {{ext}} in starttag and endtag with current file extension if specified', function (done) {
    var target = src(['templateTagsWithExt.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'lib2.js'
    ]);

    var stream = target.pipe(inject(sources, {
      ignorePath: 'fixtures',
      starttag: '<!-- {{ext}}: -->',
      endtag: '<!-- /{{ext}} -->'
    }));

    streamShouldContain(stream, ['customTagsWithExt.html'], done);
  });

  it('should replace existing data within start and end tag', function (done) {
    var target = src(['templateWithExistingData.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'lib2.js',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources, {
      ignorePath: 'fixtures',
    }));

    streamShouldContain(stream, ['existingData.html'], done);
  });

  it('should use custom transform function for each file if specified', function (done) {
    var target = src(['template.json'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'lib2.js',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources, {
      ignorePath: 'fixtures',
      starttag: '"{{ext}}": [',
      endtag: ']',
      transform: function (srcPath, file, i, length) {
        return '  "' + srcPath + '"' + (i + 1 < length ? ',' : '');
      }
    }));

    streamShouldContain(stream, ['customTransform.json'], done);
  });

});

function src (files, opt) {
  opt = opt || {};
  var stream = es.readArray(files.map(function (file) {
    return fixture(file, opt.read);
  }));
  return stream;
}

function streamShouldContain (stream, files, done) {
  var received = 0;

  stream.on('error', function(err) {
    should.exist(err);
    done(err);
  });

  var contents = files.map(function (file) {
    return String(expectedFile(file).contents);
  });

  stream.on('data', function (newFile) {
    should.exist(newFile);
    should.exist(newFile.contents);

    contents.should.containEql(String(newFile.contents));

    if (++received === files.length) {
      done();
    }
  });
}
