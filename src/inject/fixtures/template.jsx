/* eslint import/no-unresolved:0 */
var React = require('react');

var App = React.createClass({

  render: function () {
    return (
      <html>
        <head>
          <title>gulp-inject</title>
          {/* inject:html */}
          {/* endinject */}
          {/* inject:css */}
          {/* endinject */}
        </head>
        <body>
          {/* inject:js */}
          {/* endinject */}
        </body>
      </html>
    );
  }

});

module.exports = App;
