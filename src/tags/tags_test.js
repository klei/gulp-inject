/* eslint-env mocha */
/* eslint max-nested-callbacks:[1, 5] */
'use strict';
var should = require('should');

describe('tags', function () {
  var tags;
  var tagsModule;

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
        tags.start('html', 'less').should.equal('<!-- inject:less -->');
        tags.start('html', 'sass').should.equal('<!-- inject:sass -->');
        tags.start('html', 'scss').should.equal('<!-- inject:scss -->');
        tags.start('html', 'UNKNOWN').should.equal('<!-- inject:UNKNOWN -->');
      });

      it('should return jsx comments for jsx target files', function () {
        tags.start('jsx', 'css').should.equal('{/* inject:css */}');
        tags.start('jsx', 'html').should.equal('{/* inject:html */}');
        tags.start('jsx', 'js').should.equal('{/* inject:js */}');
        tags.start('jsx', 'less').should.equal('{/* inject:less */}');
        tags.start('jsx', 'sass').should.equal('{/* inject:sass */}');
        tags.start('jsx', 'scss').should.equal('{/* inject:scss */}');
        tags.start('jsx', 'UNKNOWN').should.equal('{/* inject:UNKNOWN */}');
      });

      it('should return jade comments for jade target files', function () {
        tags.start('jade', 'css').should.equal('//- inject:css');
        tags.start('jade', 'html').should.equal('//- inject:html');
        tags.start('jade', 'js').should.equal('//- inject:js');
        tags.start('jade', 'less').should.equal('//- inject:less');
        tags.start('jade', 'sass').should.equal('//- inject:sass');
        tags.start('jade', 'scss').should.equal('//- inject:scss');
        tags.start('jade', 'UNKNOWN').should.equal('//- inject:UNKNOWN');
      });

      it('should return slm comments for slm target files', function () {
        tags.start('slm', 'css').should.equal('/ inject:css');
        tags.start('slm', 'html').should.equal('/ inject:html');
        tags.start('slm', 'js').should.equal('/ inject:js');
        tags.start('slm', 'less').should.equal('/ inject:less');
        tags.start('slm', 'sass').should.equal('/ inject:sass');
        tags.start('slm', 'scss').should.equal('/ inject:scss');
        tags.start('slm', 'UNKNOWN').should.equal('/ inject:UNKNOWN');
      });

      it('should return haml comment tag for haml files', function () {
        tags.start('haml', 'css').should.equal('-# inject:css');
        tags.start('haml', 'html').should.equal('-# inject:html');
        tags.start('haml', 'js').should.equal('-# inject:js');
        tags.start('haml', 'less').should.equal('-# inject:less');
        tags.start('haml', 'sass').should.equal('-# inject:sass');
        tags.start('haml', 'scss').should.equal('-# inject:scss');
        tags.start('haml', 'UNKNOWN').should.equal('-# inject:UNKNOWN');
      });

      it('should return less comment tag for less files', function () {
        tags.start('less', 'css').should.equal('/* inject:css */');
        tags.start('less', 'html').should.equal('/* inject:html */');
        tags.start('less', 'js').should.equal('/* inject:js */');
        tags.start('less', 'less').should.equal('/* inject:less */');
        tags.start('less', 'sass').should.equal('/* inject:sass */');
        tags.start('less', 'scss').should.equal('/* inject:scss */');
        tags.start('less', 'UNKNOWN').should.equal('/* inject:UNKNOWN */');
      });

      it('should return sass comment tag for sass files', function () {
        tags.start('sass', 'css').should.equal('/* inject:css */');
        tags.start('sass', 'html').should.equal('/* inject:html */');
        tags.start('sass', 'js').should.equal('/* inject:js */');
        tags.start('sass', 'less').should.equal('/* inject:less */');
        tags.start('sass', 'sass').should.equal('/* inject:sass */');
        tags.start('sass', 'scss').should.equal('/* inject:scss */');
        tags.start('sass', 'UNKNOWN').should.equal('/* inject:UNKNOWN */');
      });

      it('should return sass comment tag for sass files', function () {
        tags.start('scss', 'css').should.equal('/* inject:css */');
        tags.start('scss', 'html').should.equal('/* inject:html */');
        tags.start('scss', 'js').should.equal('/* inject:js */');
        tags.start('scss', 'less').should.equal('/* inject:less */');
        tags.start('scss', 'sass').should.equal('/* inject:sass */');
        tags.start('scss', 'scss').should.equal('/* inject:scss */');
        tags.start('scss', 'UNKNOWN').should.equal('/* inject:UNKNOWN */');
      });

      it('should return html comment tag for other target files', function () {
        tags.start('txt', 'css').should.equal('<!-- inject:css -->');
        tags.start('txt', 'html').should.equal('<!-- inject:html -->');
        tags.start('txt', 'js').should.equal('<!-- inject:js -->');
        tags.start('txt', 'less').should.equal('<!-- inject:less -->');
        tags.start('txt', 'sass').should.equal('<!-- inject:sass -->');
        tags.start('txt', 'scss').should.equal('<!-- inject:scss -->');
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

      it('should return haml comments for haml target files', function () {
        tags.end('less', 'UNKNOWN').should.equal('/* endinject */');
      });

      it('should return sass comments for sass target files', function () {
        tags.end('sass', 'UNKNOWN').should.equal('/* endinject */');
      });

      it('should return scss comments for scss target files', function () {
        tags.end('scss', 'UNKNOWN').should.equal('/* endinject */');
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
