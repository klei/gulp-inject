/*global describe, it*/
'use strict';

var fs = require('fs'),
  path = require('path'),
  should = require('should');
require('mocha');

var gutil = require('gulp-util'),
  inject = require('../');

function expectedFile (file) {
  var filepath = path.join('test/expected', file);
  return new gutil.File({
    path: filepath,
    cwd: 'test/',
    base: path.basename(filepath),
    contents: fs.readFileSync(filepath)
  });
}

function fixture (file) {
  var filepath = path.join('test/fixtures', file);
  return new gutil.File({
    path: filepath,
    cwd: 'test/',
    base: path.basename(filepath),
    contents: null
  });
}

describe('gulp-inject', function () {

  it('should inject stylesheets, scripts and html components into desired file', function (done) {

    var sources = [
      fixture('lib.js'),
      fixture('component.html'),
      fixture('styles.css')
    ];

    var stream = inject('fixtures/template.html');

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

    sources.forEach(function (src) {
      stream.write(src);
    });

    stream.end();
  });

  it('should inject stylesheets, scripts and html components with `ignorePath` removed from file path', function (done) {

    var sources = [
      fixture('lib.js'),
      fixture('component.html'),
      fixture('lib2.js'),
      fixture('styles.css')
    ];

    var stream = inject('fixtures/template.html', {ignorePath: 'fixtures'});

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

    sources.forEach(function (src) {
      stream.write(src);
    });

    stream.end();
  });

  it('should inject stylesheets, scripts and html components without root slash if `addRootSlash` is `false`', function (done) {

    var sources = [
      fixture('lib.js'),
      fixture('component.html'),
      fixture('styles.css')
    ];

    var stream = inject('fixtures/template.html', {addRootSlash: false});

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

    sources.forEach(function (src) {
      stream.write(src);
    });

    stream.end();
  });

  it('should use templateString as template if specified', function (done) {

    var sources = [
      fixture('lib.js'),
      fixture('component.html'),
      fixture('lib2.js'),
      fixture('styles.css')
    ];

    var stream = inject('fixtures/templateString.html', {
      ignorePath: 'fixtures',
      templateString: '<!DOCTYPE html><!-- inject:js --><!-- endinject --><h1>Hello world</h1>'
    });

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('templateString.html').contents));
      done();
    });

    sources.forEach(function (src) {
      stream.write(src);
    });

    stream.end();
  });

  it('should use starttag and endtag if specified', function (done) {

    var sources = [
      fixture('lib.js'),
      fixture('lib2.js')
    ];

    var stream = inject('fixtures/templateString.html', {
      ignorePath: 'fixtures',
      starttag: '<!DOCTYPE html>',
      endtag: '<h1>',
      templateString: '<!DOCTYPE html><h1>Hello world</h1>'
    });

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('templateStringCustomTags.html').contents));
      done();
    });

    sources.forEach(function (src) {
      stream.write(src);
    });

    stream.end();
  });

  it('should replace {{ext}} in starttag and endtag with current file extension if specified', function (done) {

    var sources = [
      fixture('lib.js'),
      fixture('component.html'),
      fixture('lib2.js')
    ];

    var stream = inject('fixtures/templateString.html', {
      ignorePath: 'fixtures',
      starttag: '<!-- {{ext}}: -->',
      endtag: '<!-- /{{ext}} -->',
      templateString: '<!DOCTYPE html><!-- js: --><!-- /js --><h1>Hello world</h1>'
    });

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('templateStringCustomTagsWithExt.html').contents));
      done();
    });

    sources.forEach(function (src) {
      stream.write(src);
    });

    stream.end();
  });

  it('should replace existing data within start and end tag', function (done) {

    var sources = [
      fixture('lib.js'),
      fixture('component.html'),
      fixture('lib2.js'),
      fixture('styles.css')
    ];

    var stream = inject('fixtures/templateString.html', {
      ignorePath: 'fixtures',
      templateString: '<!DOCTYPE html>\n<!-- inject:js -->\n<script src="/aLib.js"></script>\n<!-- endinject -->\n<h1>Hello world</h1>'
    });

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('templateStringWithExisting.html').contents));
      done();
    });

    sources.forEach(function (src) {
      stream.write(src);
    });

    stream.end();
  });

  it('should use custom transform function for each file if specified', function (done) {

    var sources = [
      fixture('lib.js'),
      fixture('component.html'),
      fixture('lib2.js'),
      fixture('styles.css')
    ];

    var stream = inject('fixtures/customTransform.json', {
      ignorePath: 'fixtures',
      templateString: '{\n  "js": [\n  ]\n}',
      starttag: '"{{ext}}": [',
      endtag: ']',
      transform: function (srcPath, file, i, length) {
        return '  "' + srcPath + '"' + (i + 1 < length ? ',' : '');
      }
    });

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

    sources.forEach(function (src) {
      stream.write(src);
    });

    stream.end();
  });

  it('should inject files ordered with a custom sorting function if specified', function (done) {

    var sources = [
      fixture('lib.js'),
      fixture('lib2.js')
    ];

    var stream = inject('fixtures/template.html', {
      ignorePath: 'fixtures',
      sort: function (a, b) {
        return b.filepath.localeCompare(a.filepath);
      }
    });

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile('customSort.html').contents));
      done();
    });

    sources.forEach(function (src) {
      stream.write(src);
    });

    stream.end();
  });

});
