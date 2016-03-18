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
        tags.start('html').should.equal('<!-- {{name}}:{{ext}} -->');
      });

      it('should return jsx comments for jsx target files', function () {
        tags.start('jsx').should.equal('{/* {{name}}:{{ext}} */}');
      });

      it('should return jade comments for jade target files', function () {
        tags.start('jade', 'css').should.equal('//- {{name}}:{{ext}}');
      });

      it('should return slm comments for slm target files', function () {
        tags.start('slm').should.equal('/ {{name}}:{{ext}}');
      });

      it('should return haml comment tag for haml files', function () {
        tags.start('haml').should.equal('-# {{name}}:{{ext}}');
      });

      it('should return less comment tag for less files', function () {
        tags.start('less').should.equal('/* {{name}}:{{ext}} */');
      });

      it('should return sass comment tag for sass files', function () {
        tags.start('sass').should.equal('/* {{name}}:{{ext}} */');
      });

      it('should return sass comment tag for sass files', function () {
        tags.start('scss').should.equal('/* {{name}}:{{ext}} */');
      });

      it('should return html comment tag for other target files', function () {
        tags.start('txt').should.equal('<!-- {{name}}:{{ext}} -->');
      });
    });

    describe('given a string as default', function () {
      it('should return the string', function () {
        tags.start('json', 'css', '"{{ext}}": [').should.equal('"{{ext}}": [');
      });
    });

    describe('given a function as default', function () {
      it('should receive target file and source file extensions as parameters', function () {
        tags.start('html', 'css', function (targetExt, sourceExt) {
          targetExt.should.equal('html');
          sourceExt.should.equal('css');
        });
      });

      it('should return result of function untouched', function () {
        tags.start('json', 'css', function () {
          return '"{{ext}}": [';
        }).should.equal('"{{ext}}": [');
      });
    });
  });

  describe('end()', function () {
    describe('with no default', function () {
      it('should return html comment tag for html target files', function () {
        tags.end('html').should.equal('<!-- endinject -->');
      });

      it('should return jsx comments for jsx target files', function () {
        tags.end('jsx').should.equal('{/* endinject */}');
      });

      it('should return jade comments for jade target files', function () {
        tags.end('jade').should.equal('//- endinject');
      });

      it('should return slm comments for slm target files', function () {
        tags.end('slm').should.equal('/ endinject');
      });

      it('should return haml comments for haml target files', function () {
        tags.end('haml').should.equal('-# endinject');
      });

      it('should return haml comments for haml target files', function () {
        tags.end('less').should.equal('/* endinject */');
      });

      it('should return sass comments for sass target files', function () {
        tags.end('sass').should.equal('/* endinject */');
      });

      it('should return scss comments for scss target files', function () {
        tags.end('scss').should.equal('/* endinject */');
      });

      it('should return html comment tag for other target files', function () {
        tags.end('txt').should.equal('<!-- endinject -->');
      });
    });

    describe('given a string as default', function () {
      it('should return the string', function () {
        tags.end('json', 'css', '] // {{ext}}').should.equal('] // {{ext}}');
      });
    });

    describe('given a function as default', function () {
      it('should receive target file and source file extensions as parameters', function () {
        tags.end('html', 'css', function (targetExt, sourceExt) {
          targetExt.should.equal('html');
          sourceExt.should.equal('css');
        });
      });

      it('should return result of function untouched', function () {
        tags.end('json', 'css', function () {
          return '] // {{ext}}';
        }).should.equal('] // {{ext}}');
      });
    });
  });
});
