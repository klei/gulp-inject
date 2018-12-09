/* eslint-env mocha */
'use strict';

var fs = require('fs');
var path = require('path');
var es = require('event-stream');
var should = require('should');
var fancyLog = require('fancy-log');
var Vinyl = require('vinyl');
var stripColor = require('strip-color');
var inject = require('../../.');

describe('gulp-inject', function () {
  var log;

  beforeEach(function () {
    log = fancyLog.info;
  });

  afterEach(function () {
    fancyLog.info = log;
  });

  it('should throw an error when the old api with target as string is used', function () {
    should(function () {
      inject('fixtures/template.html');
    }).throw();
  });

  it('should throw an error if sources stream is undefined', function () {
    should(function () {
      inject();
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

  it('should inject stylesheets, scripts, images, jsx and html components into desired file', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css',
      'image.png',
      'lib.jsx'
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
      'image.png',
      'lib.jsx'
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
      'styles.css',
      'lib.jsx'
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
      '../../yet-another/styles.css',
      '../components/lib.jsx'
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
      'styles.css',
      'lib.jsx'
    ]);

    var stream = target.pipe(inject(sources, {addPrefix: 'my-test-dir'}));

    streamShouldContain(stream, ['addPrefix.html'], done);
  });

  it('should inject stylesheets, scripts and html components with `addSuffix` added to file path', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'lib2.js',
      'styles.css',
      'lib.jsx'
    ]);

    var stream = target.pipe(inject(sources, {addSuffix: '?my-test=suffix'}));

    streamShouldContain(stream, ['addSuffix.html'], done);
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
      'styles.css',
      'lib.jsx'
    ]);

    var stream = target.pipe(inject(sources, {addRootSlash: false}));

    streamShouldContain(stream, ['noRootSlash.html'], done);
  });

  it('should inject stylesheets, scripts and html components without root slash if `addRootSlash` is `false` and `ignorePath` is set', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'a/folder/lib.js',
      'a/folder/component.html',
      'a/folder/styles.css',
      'a/folder/lib.jsx'
    ]);

    var stream = target.pipe(inject(sources, {addRootSlash: false, ignorePath: 'fixtures'}));

    streamShouldContain(stream, ['noRootSlashWithIgnorePath.html'], done);
  });

  it('should use starttag and endtag if specified', function (done) {
    var target = src(['templateCustomTags.html'], {read: true});
    var sources = src([
      'lib.js',
      'lib2.js',
      'style.css'
    ]);

    var stream = target.pipe(inject(sources, {
      ignorePath: 'fixtures',
      starttag: '<!DOCTYPE html>',
      endtag: '<h1>'
    }));

    streamShouldContain(stream, ['customTags.html'], done);
  });

  it('should use starttag and endtag with specified name if specified', function (done) {
    var target = src(['templateCustomName.html'], {read: true});
    var sources = src([
      'lib.js',
      'lib2.js'
    ]);

    var stream = target.pipe(inject(sources, {name: 'head'}));

    streamShouldContain(stream, ['customName.html'], done);
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

  it('should replace {{path}} in starttag and endtag with current file path if specified', function (done) {
    var target = src(['templateTagsWithPath.html'], {read: true});
    var sources = src([
      'template.html',
      'partial.html',
      'template2.html'
    ], {read: true});

    var stream = target.pipe(inject(sources, {
      starttag: '<!-- {{path}}: -->',
      endtag: '<!-- :{{path}} -->',
      transform: function (filePath, file) {
        return file.contents.toString('utf8');
      }
    }));

    streamShouldContain(stream, ['customTagsWithPath.html'], done);
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
      ignorePath: 'fixtures'
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

  it('should use special default tags when injecting into jsx files', function (done) {
    var target = src(['template.jsx'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['defaults.jsx'], done);
  });

  it('should use special default tags when injecting into jade files', function (done) {
    var target = src(['template.jade'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['defaults.jade'], done);
  });

  it('should use special default tags when injecting into pug files', function (done) {
    var target = src(['template.pug'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['defaults.pug'], done);
  });

  it('should be able to inject jsx into jade files (Issue #144)', function (done) {
    var target = src(['issue144.jade'], {read: true});
    var sources = src([
      'lib.js',
      'component.jsx'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['issue144.jade'], done);
  });

  it('should be able to inject jsx into pug files (Issue #144)', function (done) {
    var target = src(['issue144.pug'], {read: true});
    var sources = src([
      'lib.js',
      'component.jsx'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['issue144.pug'], done);
  });

  it('should use special default tags when injecting into slm files', function (done) {
    var target = src(['template.slm'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['defaults.slm'], done);
  });

  it('should use special default tags when injecting into slim files', function (done) {
    var target = src(['template.slim'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['defaults.slim'], done);
  });

  it('should use special default tags when injecting into haml files', function (done) {
    var target = src(['template.haml'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['defaults.haml'], done);
  });

  it('should use special default tags when injecting into less files', function (done) {
    var target = src(['template.less'], {read: true});
    var sources = src([
      'lib.css',
      'component.less',
      'styles.less'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['defaults.less'], done);
  });

  it('should use special default tags when injecting into sass files', function (done) {
    var target = src(['template.sass'], {read: true});
    var sources = src([
      'lib.css',
      'component.sass',
      'styles.sass',
      'component.scss',
      'styles.scss'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['defaults.sass'], done);
  });

  it('should use special default tags when injecting into scss files', function (done) {
    var target = src(['template.scss'], {read: true});
    var sources = src([
      'lib.css',
      'component.sass',
      'styles.sass',
      'component.scss',
      'styles.scss'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['defaults.scss'], done);
  });

  it('should be able to chain inject calls with different names without overrides (Issue #39)', function (done) {
    var target = src(['issue39.html'], {read: true});
    var sources1 = src([
      'lib1.js',
      'lib3.js'
    ]);
    var sources2 = src([
      'lib2.js',
      'lib4.js'
    ]);

    var stream = target
      .pipe(inject(sources1, {name: 'head'}))
      .pipe(inject(sources2));

    streamShouldContain(stream, ['issue39.html'], done);
  });

  it('should be able to inject hashed files (Issue #71)', function (done) {
    var target = src(['issue71.html'], {read: true});
    var sources = src([
      'lib.js?abcdef0123456789',
      'styles.css?0123456789abcdef'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['issue71.html'], done);
  });

  it('should be able to inject when tags are missing whitespace (Issue #56)', function (done) {
    var target = src(['issue56.html'], {read: true});
    var sources = src([
      'lib.js'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['issue56.html'], done);
  });

  it('should not crash when transform function returns undefined (Issue #74)', function (done) {
    var target = src(['issue74.html'], {read: true});
    var sources = src([
      'lib.js'
    ]);

    var stream = target.pipe(inject(sources, {transform: function () {}}));

    streamShouldContain(stream, ['issue74.html'], done);
  });

  it('should be able to remove tags if removeTags option is set', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css',
      'image.png',
      'lib.jsx'
    ]);

    var stream = target.pipe(inject(sources, {removeTags: true}));

    streamShouldContain(stream, ['removeTags.html'], done);
  });

  it('should be able to remove tags without removing whitespace (issue #177)', function (done) {
    var target = src(['template.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css',
      'morestyles.css',
      'andevenmore.css',
      'image.png',
      'lib.jsx'
    ]);

    var stream = target.pipe(inject(sources, {removeTags: true}));

    streamShouldContain(stream, ['issue177.html'], done);
  });

  it('should not produce log output if quiet option is set', function (done) {
    var logOutput = [];
    fancyLog.info = function () {
      logOutput.push(arguments);
    };

    var target = src(['template.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css',
      'image.png'
    ]);

    var stream = target.pipe(inject(sources, {quiet: true}));

    // Dummy data reader to make the `end` event be triggered
    stream.on('data', function () {
    });

    stream.on('end', function () {
      logOutput.should.have.length(0);
      done();
    });
  });

  it('should produce log output if quiet option is not set', function (done) {
    var logOutput = [];
    fancyLog.info = function () {
      logOutput.push(arguments);
    };

    var target = src(['template.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css',
      'image.png'
    ]);

    var stream = target.pipe(inject(sources));

    // Dummy data reader to make the `end` event be triggered
    stream.on('data', function () {
    });

    stream.on('end', function () {
      logOutput.should.have.length(1);
      done();
    });
  });

  it('should produce log output only for files actually injected (issue #184)', function (done) {
    var logOutput = [];
    fancyLog.info = function (a, b) {
      logOutput.push(a + ' ' + b);
    };

    var target = src(['template2.html'], {read: true});
    var sources = src([
      'lib.js',
      'component.html',
      'styles.css',
      'image.png'
    ]);

    var stream = target.pipe(inject(sources));

    // Dummy data reader to make the `end` event be triggered
    stream.on('data', function () {
    });

    stream.on('end', function () {
      logOutput.should.have.length(1);
      stripColor(logOutput[0]).should.equal('gulp-inject 1 file into template2.html.');
      done();
    });
  });

  it('should produce log output for multiple files actually injected (issue #192)', function (done) {
    var logOutput = [];
    fancyLog.info = function (a, b) {
      logOutput.push(a + ' ' + b);
    };

    var target = src(['template2.html'], {read: true});
    var sources = src([
      'styles.css',
      'app.css'
    ]);

    var stream = target.pipe(inject(sources));

    // Dummy data reader to make the `end` event be triggered
    stream.on('data', function () {
    });

    stream.on('end', function () {
      logOutput.should.have.length(1);
      stripColor(logOutput[0]).should.equal('gulp-inject 2 files into template2.html.');
      done();
    });
  });

  it('should be able to modify only the filepath (Issue #107)', function (done) {
    var version = '1.0.0';

    var target = src(['issue107.html'], {read: true});
    var sources = src([
      'lib.js'
    ]);

    var stream = target.pipe(inject(sources, {
      transform: function (filepath) {
        arguments[0] = filepath + '?v=' + version;
        return inject.transform.apply(inject.transform, arguments);
      }
    }));

    streamShouldContain(stream, ['issue107.html'], done);
  });

  it('should be able to inject source maps (Issue #176)', function (done) {
    var target = src(['issue176.html'], {read: true});
    var sources = src([
      'lib.js',
      'lib.js.map'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['issue176.html'], done);
  });

  it('should be able to empty tags when there are no files for that tag and empty option is set', function (done) {
    var target = src(['templateWithExistingData2.html'], {read: true});
    var sources = src([
      'lib.js'
    ]);

    var stream = target.pipe(inject(sources, {empty: true}));

    streamShouldContain(stream, ['emptyTags.html'], done);
  });

  it('should be able both leave and replace tag contents when there are no files for some tags and empty option is not set', function (done) {
    var target = src(['templateWithExistingData2.html'], {read: true});
    var sources = src([
      'picture.png'
    ]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['existingDataAndReplaced.html'], done);
  });

  it('should be able to empty all tags when there are no files at all and empty option is set', function (done) {
    var target = src(['templateWithExistingData2.html'], {read: true});
    var sources = src([]);

    var stream = target.pipe(inject(sources, {empty: true}));

    streamShouldContain(stream, ['emptyTags2.html'], done);
  });

  it('should leave all tags when there are no files at all and empty option is not set', function (done) {
    var target = src(['templateWithExistingData2.html'], {read: true});
    var sources = src([]);

    var stream = target.pipe(inject(sources));

    streamShouldContain(stream, ['templateWithExistingData2.html'], done);
  });

  it('should be able to remove and empty tags when there are no files for that tag and empty and removeTags option is set', function (done) {
    var target = src(['templateWithExistingData2.html'], {read: true});
    var sources = src([
      'lib.js'
    ]);

    var stream = target.pipe(inject(sources, {empty: true, removeTags: true}));

    streamShouldContain(stream, ['removeAndEmptyTags.html'], done);
  });

  it('should be able to empty custom tags when there are no files at all and empty option is set', function (done) {
    var target = src(['templateWithExistingData3.html'], {read: true});
    var sources = src([]);

    var stream = target.pipe(inject(sources, {empty: true, starttag: '<!-- custominject -->', endtag: '<!-- endcustominject -->'}));

    streamShouldContain(stream, ['emptyTags3.html'], done);
  });

  it('should throw an error when there is nothing to inject', function (done) {
    var logOutput = [];
    fancyLog.info = function (a, b) {
      logOutput.push(a + ' ' + b);
    };

    var target = src(['templateWithExistingData2.html'], {read: true});

    var sources = src([]);

    var stream = target.pipe(inject(sources, {throwErrorIfNoInject: true}));

    // Dummy data reader to make the `end` event be triggered
    stream.on('data', function () {
    });

    stream.on('error', function (error) {
      error.should.not.be.undefined();
      logOutput.should.have.length(0);
      done();
    });
  });

  it('should log when there is nothing to inject', function (done) {
    var logOutput = [];
    fancyLog.info = function (a, b) {
      logOutput.push(a + ' ' + b);
    };
    var target = src(['templateWithExistingData2.html'], {read: true});

    var sources = src([]);

    var stream = target.pipe(inject(sources));

    // Dummy data reader to make the `end` event be triggered
    stream.on('data', function () {
    });

    stream.on('end', function () {
      logOutput.should.have.length(1);
      done();
    });
  });
});

function src(files, opt) {
  opt = opt || {};
  var stream = es.readArray(files.map(function (file) {
    return fixture(file, opt.read);
  }));
  return stream;
}

function streamShouldContain(stream, files, done) {
  var received = 0;

  stream.on('error', function (error) {
    should.exist(error);
    done(error);
  });

  var contents = files.map(function (file) {
    return String(expectedFile(file).contents);
  });

  stream.on('data', function (newFile) {
    should.exist(newFile);
    should.exist(newFile.contents);

    if (contents.length === 1) {
      String(newFile.contents).should.equal(contents[0]);
    } else {
      contents.should.containEql(String(newFile.contents));
    }

    if (++received === files.length) {
      done();
    }
  });
}

function expectedFile(file) {
  var filepath = path.resolve(__dirname, 'expected', file);
  return new Vinyl({
    path: filepath,
    cwd: __dirname,
    base: path.resolve(__dirname, 'expected', path.dirname(file)),
    contents: fs.readFileSync(filepath)
  });
}

function fixture(file, read) {
  var filepath = path.resolve(__dirname, 'fixtures', file);
  return new Vinyl({
    path: filepath,
    cwd: __dirname,
    base: path.resolve(__dirname, 'fixtures', path.dirname(file)),
    contents: read ? fs.readFileSync(filepath) : null
  });
}
