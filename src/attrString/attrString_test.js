/* eslint-env mocha */
/* eslint max-nested-callbacks:[1, 5] */
'use strict';
var should = require('should');

describe('attrString', function () {
  var attrStringModule;

  it('should not crash when required', function () {
    should(function () {
      attrStringModule = require('./');
    }).not.throw();
  });

  it('should be a function', function () {
    attrStringModule.should.be.type('function');
  });

  describe('with parameter', function () {
    it('string', function () {
      attrStringModule('test').should.equal(' test');
    });

    it('number', function () {
      should(function () {
        attrStringModule(12);
      }).throw();
    });

    it('function', function () {
      should(function () {
        attrStringModule(function () {});
      }).throw();
    });

    it('undefined', function () {
      attrStringModule().should.equal('');
    });

    it('valid object', function () {
      attrStringModule({a: 'A', b: 'B'}).should.equal(' a="A" b="B"');
    });

    it('invalid object', function () {
      should(function () {
        attrStringModule({a: {}});
      }).throw();
    });

    describe('array', function () {
      it('empty', function () {
        attrStringModule([]).should.equal('');
      });

      it('strings', function () {
        attrStringModule(['a', 'b']).should.equal(' a b');
      });

      it('number', function () {
        should(function () {
          attrStringModule([12]).should.trow();
        }).throw();
      });

      it('function', function () {
        should(function () {
          attrStringModule([function () {}]);
        }).throw();
      });

      it('objects', function () {
        attrStringModule([{name: 'a', value: 'A'}, {name: 'b', value: 'B'}]).should.equal(' a="A" b="B"');
      });

      it('arrays', function () {
        attrStringModule([['a', 'A'], ['b', 'B']]).should.equal(' a="A" b="B"');
      });
    });
  });
});

