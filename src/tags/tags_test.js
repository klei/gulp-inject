'use strict';

var should = require('should');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');

describe('tags', function () {
  var tags, tagsModule;

  it('should not crash when required', function () {
    should(function () {
      tagsModule = require('./');
    }).not.throw();
  });

  beforeEach(function () {
    if (!tagsModule) {
      return;
    }
    tags = tagsModule();
  });

  describe('name', function () {
    it('should be "inject" by default', function () {
      tags.name.should.equal('inject');
    });
  });

  describe('start()', function () {
    describe('with no default', function () {
      it('should return html comment tag for html target files', function () {
        tags.start('html', 'css').should.equal('<!-- inject:css -->');
        tags.start('html', 'html').should.equal('<!-- inject:html -->');
        tags.start('html', 'js').should.equal('<!-- inject:js -->');
        tags.start('html', 'UNKNOWN').should.equal('<!-- inject:UNKNOWN -->');
      });

      it('should return jsx comments for jsx target files', function () {
        tags.start('jsx', 'css').should.equal('{/* inject:css */}');
        tags.start('jsx', 'html').should.equal('{/* inject:html */}');
        tags.start('jsx', 'js').should.equal('{/* inject:js */}');
        tags.start('jsx', 'UNKNOWN').should.equal('{/* inject:UNKNOWN */}');
      });

      it('should return jade comments for jade target files', function () {
        tags.start('jade', 'css').should.equal('//- inject:css');
        tags.start('jade', 'html').should.equal('//- inject:html');
        tags.start('jade', 'js').should.equal('//- inject:js');
        tags.start('jade', 'UNKNOWN').should.equal('//- inject:UNKNOWN');
      });

      it('should return slm comments for slm target files', function () {
        tags.start('slm', 'css').should.equal('/ inject:css');
        tags.start('slm', 'html').should.equal('/ inject:html');
        tags.start('slm', 'js').should.equal('/ inject:js');
        tags.start('slm', 'UNKNOWN').should.equal('/ inject:UNKNOWN');
      });

      it('should return haml comment tag for haml files', function () {
        tags.start('haml', 'css').should.equal('-# inject:css');
        tags.start('haml', 'html').should.equal('-# inject:html');
        tags.start('haml', 'js').should.equal('-# inject:js');
        tags.start('haml', 'UNKNOWN').should.equal('-# inject:UNKNOWN');
      });

      it('should return html comment tag for other target files', function () {
        tags.start('txt', 'css').should.equal('<!-- inject:css -->');
        tags.start('txt', 'html').should.equal('<!-- inject:html -->');
        tags.start('txt', 'js').should.equal('<!-- inject:js -->');
        tags.start('txt', 'UNKNOWN').should.equal('<!-- inject:UNKNOWN -->');
      });
    });

    describe('given a string as default', function () {
      it('should return string with "{{ext}}" replaced by source extension', function () {
        tags.start('json', 'css', '"{{ext}}": [').should.equal('"css": [');
      });

      it('should leave strings without "{{ext}}" as is', function () {
        tags.start('txt', 'html', '# inject\n').should.equal('# inject\n');
      });

      it('should return strings with "{{name}}" replaced by `tags.name`', function () {
        tags.start('txt', 'html', '# {{name}}\n').should.equal('# ' + tags.name + '\n');
      });
    });

    describe('given a function as default', function () {
      it('should receive target file and source file extensions as parameters', function () {
        tags.start('html', 'css', function (targetExt, sourceExt) {
          targetExt.should.equal('html');
          sourceExt.should.equal('css');
        });
      });

      it('should return result of function with "{{ext}}" replaced by source extension', function () {
        tags.start('json', 'css', function () {
          return '"{{ext}}": [';
        }).should.equal('"css": [');
      });

      it('should leave function results without "{{ext}}" as is', function () {
        tags.start('txt', 'html', function () {
          return '# inject\n';
        }).should.equal('# inject\n');
      });

      it('should return strings with "{{name}}" replaced by `tags.name`', function () {
        tags.start('txt', 'html', function () {
          return '# {{name}}\n';
        }).should.equal('# ' + tags.name + '\n');
      });
    });
  });

  describe('end()', function () {
    describe('with no default', function () {
      it('should return html comment tag for html target files', function () {
        tags.end('html', 'UNKNOWN').should.equal('<!-- endinject -->');
      });

      it('should return jsx comments for jsx target files', function () {
        tags.end('jsx', 'UNKNOWN').should.equal('{/* endinject */}');
      });

      it('should return jade comments for jade target files', function () {
        tags.end('jade', 'UNKNOWN').should.equal('//- endinject');
      });

      it('should return slm comments for slm target files', function () {
        tags.end('slm', 'UNKNOWN').should.equal('/ endinject');
      });

      it('should return haml comments for haml target files', function () {
        tags.end('haml', 'UNKNOWN').should.equal('-# endinject');
      });

      it('should return html comment tag for other target files', function () {
        tags.end('txt', 'UNKNOWN').should.equal('<!-- endinject -->');
      });
    });

    describe('given a string as default', function () {
      it('should return string with "{{ext}}" replaced by source extension', function () {
        tags.end('json', 'css', '] // {{ext}}').should.equal('] // css');
      });

      it('should leave strings without "{{ext}}" as is', function () {
        tags.end('txt', 'html', '# endinject\n').should.equal('# endinject\n');
      });

      it('should return strings with "{{name}}" replaced by `tags.name`', function () {
        tags.end('txt', 'html', '# {{name}}\n').should.equal('# ' + tags.name + '\n');
      });
    });

    describe('given a function as default', function () {
      it('should receive target file and source file extensions as parameters', function () {
        tags.end('html', 'css', function (targetExt, sourceExt) {
          targetExt.should.equal('html');
          sourceExt.should.equal('css');
        });
      });

      it('should return result of function with "{{ext}}" replaced by source extension', function () {
        tags.end('json', 'css', function () {
          return '] // {{ext}}';
        }).should.equal('] // css');
      });

      it('should leave function results without "{{ext}}" as is', function () {
        tags.end('txt', 'html', function () {
          return '# endinject\n';
        }).should.equal('# endinject\n');
      });

      it('should return strings with "{{name}}" replaced by `tags.name`', function () {
        tags.end('txt', 'html', function () {
          return '# {{name}}\n';
        }).should.equal('# ' + tags.name + '\n');
      });
    });
  });


});

function fixture (file, read) {
  var filepath = path.resolve(__dirname, 'fixtures', file);
  return new gutil.File({
    path: filepath,
    cwd: __dirname,
    base: path.resolve(__dirname, 'fixtures', path.dirname(file)),
    contents: read ? fs.readFileSync(filepath) : null
  });
}
