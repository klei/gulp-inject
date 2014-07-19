'use strict';

var should = require('should');

describe('transform function', function () {
  var transform;

  it('should not crash when required', function () {
    should(function () {
      transform = require('../transform');
    }).not.throw();
  });

  it('should be a function', function () {
    transform.should.be.type('function');
  });

  describe('targets', function () {
    it('should have a transform function for html target files', function () {
      transform.html.should.be.type('function');
    });

    it('should have a transform function for react javascript (jsx) target files', function () {
      transform.jsx.should.be.type('function');
    });

    it('should have a transform function for jade target files', function () {
      transform.jade.should.be.type('function');
    });
  });

  describe('sources', function () {
    describe('html as target', function () {
      it('should transform css to a link tag', function () {
        transform.html.css.should.be.type('function');
        transform.html.css('test-file.css').should.equal('<link rel="stylesheet" href="test-file.css">');
      });

      it('should transform html to a link tag', function () {
        transform.html.html.should.be.type('function');
        transform.html.html('test-file.html').should.equal('<link rel="import" href="test-file.html">');
      });

      it('should transform javascript to a script tag', function () {
        transform.html.js.should.be.type('function');
        transform.html.js('test-file.js').should.equal('<script src="test-file.js"></script>');
      });

      it('should transform coffeescript to a script tag', function () {
        transform.html.coffee.should.be.type('function');
        transform.html.coffee('test-file.coffee').should.equal('<script type="text/coffeescript" src="test-file.coffee"></script>');
      });

      it('should transform an image to an img tag', function () {
        transform.html.image.should.be.type('function');
        transform.html.image('test-file.png').should.equal('<img src="test-file.png">');
      });

      describe('selfClosingTag option is true', function () {
        before(function () {
          transform.selfClosingTag = true;
        });
        after(function () {
          transform.selfClosingTag = false;
        });

        it('should make link tags self closing', function () {
          transform.html.css('test-file.css').should.equal('<link rel="stylesheet" href="test-file.css" />');
          transform.html.html('test-file.html').should.equal('<link rel="import" href="test-file.html" />');
        });

        it('should make img tags self closing', function () {
          transform.html.image('test-file.png').should.equal('<img src="test-file.png" />');
        });
      });

      it('should use the css transformer for css files automatically', function () {
        transform.html('test-file.css').should.equal(transform.html.css('test-file.css'));
      });

      it('should use the html transformer for html files automatically', function () {
        transform.html('test-file.html').should.equal(transform.html.html('test-file.html'));
      });

      it('should use the js transformer for js files automatically', function () {
        transform.html('test-file.js').should.equal(transform.html.js('test-file.js'));
      });

      it('should use the coffee transformer for coffee files automatically', function () {
        transform.html('test-file.coffee').should.equal(transform.html.coffee('test-file.coffee'));
      });

      it('should use the image transformer for png, gif, jpg and jpeg files automatically', function () {
        transform.html('test-file.png').should.equal(transform.html.image('test-file.png'));
        transform.html('test-file.gif').should.equal(transform.html.image('test-file.gif'));
        transform.html('test-file.jpg').should.equal(transform.html.image('test-file.jpg'));
        transform.html('test-file.jpeg').should.equal(transform.html.image('test-file.jpeg'));
      });

    });

    describe('jsx as target', function () {
      it('should transform css to a self closing link tag', function () {
        transform.jsx.css.should.be.type('function');
        transform.jsx.css('test-file.css').should.equal('<link rel="stylesheet" href="test-file.css" />');
      });

      it('should transform html to a self closing link tag', function () {
        transform.jsx.html.should.be.type('function');
        transform.jsx.html('test-file.html').should.equal('<link rel="import" href="test-file.html" />');
      });

      it('should transform javascript to a script tag', function () {
        transform.jsx.js.should.be.type('function');
        transform.jsx.js('test-file.js').should.equal('<script src="test-file.js"></script>');
      });

      it('should transform coffeescript to a script tag', function () {
        transform.jsx.coffee.should.be.type('function');
        transform.jsx.coffee('test-file.coffee').should.equal('<script type="text/coffeescript" src="test-file.coffee"></script>');
      });

      it('should transform an image to a self closing img tag', function () {
        transform.jsx.image.should.be.type('function');
        transform.jsx.image('test-file.png').should.equal('<img src="test-file.png" />');
      });
    });

    describe('jade as target', function () {
      it('should transform css to a jade link tag', function () {
        transform.jade.css.should.be.type('function');
        transform.jade.css('test-file.css').should.equal('link(rel="stylesheet", href="test-file.css")');
      });

      it('should transform html to a self closing link tag', function () {
        transform.jade.html.should.be.type('function');
        transform.jade.html('test-file.html').should.equal('link(rel="import", href="test-file.html")');
      });

      it('should transform javascript to a script tag', function () {
        transform.jade.js.should.be.type('function');
        transform.jade.js('test-file.js').should.equal('script(src="test-file.js")');
      });

      it('should transform coffeescript to a script tag', function () {
        transform.jade.coffee.should.be.type('function');
        transform.jade.coffee('test-file.coffee').should.equal('script(type="text/coffeescript", src="test-file.coffee")');
      });

      it('should transform an image to a self closing img tag', function () {
        transform.jade.image.should.be.type('function');
        transform.jade.image('test-file.png').should.equal('img(src="test-file.png")');
      });
    });
  });

});
