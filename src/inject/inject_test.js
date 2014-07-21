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

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);
      newFile.base.should.equal(path.join(__dirname, 'fixtures'));

      String(newFile.contents).should.equal(String(expectedFile('defaults.html').contents));
      done();
    });

    target.resume();
    sources.resume();
  });

  it('should take a Vinyl File Stream with files to inject into current stream', function (done) {

    var target = src(['template.html', 'template2.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css',
      'image.png'
    ]);

    var stream = target.pipe(inject(sources));

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    var received = 0;
    stream.on('data', function (newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile(received ? 'defaults2.html' : 'defaults.html').contents));

      if (++received === 2) {
        done();
      }
    });

    target.resume();
    sources.resume();
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

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('ignorePath.html').contents));
      done();
    });

    target.resume();
    sources.resume();
  });

  it('should inject stylesheets, scripts and html components with relative paths if `relative` is truthy', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      '../../folder/lib.js',
      '../../another/component.html',
      '../a-folder/lib2.js',
      '../../yet-another/styles.css'
    ]);

    var stream = target.pipe(inject(sources, {relative: true}));

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('relative.html').contents));

      done();
    });

    target.resume();
    sources.resume();
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

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('addPrefix.html').contents));
      done();
    });

    target.resume();
    sources.resume();
  });

  it('should inject stylesheets and html components with self closing tags if `selfClosingTag` is truthy', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'component.html',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources, {selfClosingTag: true}));

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('selfClosingTag.html').contents));
      done();
    });

    target.resume();
    sources.resume();
  });

  it('should inject stylesheets, scripts and html components without root slash if `addRootSlash` is `false`', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources, {addRootSlash: false}));

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('noRootSlash.html').contents));
      done();
    });

    target.resume();
    sources.resume();
  });

  it('should inject stylesheets, scripts and html components without root slash if `addRootSlash` is `false` and `ignorePath` is set', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'a/folder/lib.js',
      'a/folder/component.html',
      'a/folder/styles.css'
    ]);

    var stream = target.pipe(inject(sources, {addRootSlash: false, ignorePath: 'fixtures'}));

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('noRootSlashWithIgnorePath.html').contents));
      done();
    });

    target.resume();
    sources.resume();
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

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('customTags.html').contents));
      done();
    });

    target.resume();
    sources.resume();
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

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('customTagsWithExt.html').contents));
      done();
    });

    target.resume();
    sources.resume();
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

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('existingData.html').contents));
      done();
    });

    target.resume();
    sources.resume();
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

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('customTransform.json').contents));
      done();
    });

    target.resume();
    sources.resume();
  });

});

function src (files, opt) {
  opt = opt || {};
  var stream = es.readArray(files.map(function (file) {
    return fixture(file, opt.read);
  }));
  stream.pause();
  return stream;
}
