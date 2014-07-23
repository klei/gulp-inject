
/**
 * Constants
 */
var DEFAULT_NAME = 'inject';
var DEFAULT_TARGET = 'html';
var DEFAULTS = {
  STARTS: {
    'html': '<!-- {{name}}:{{ext}} -->',
    'jsx': '{/* {{name}}:{{ext}} */}',
    'jade': '//- {{name}}:{{ext}}'
  },
  ENDS: {
    'html': '<!-- endinject -->',
    'jsx': '{/* endinject */}',
    'jade': '//- endinject'
  }
};

exports.name = DEFAULT_NAME;
exports.start = getTag.bind(null, DEFAULTS.STARTS);
exports.end = getTag.bind(null, DEFAULTS.ENDS);

function getTag (defaults, targetExt, sourceExt, defaultValue) {
  var tag = defaultValue;
  if (!tag) {
    tag = defaults[targetExt] || defaults[DEFAULT_TARGET];
  } else if (typeof tag === 'function') {
    tag = tag(targetExt, sourceExt);
  }
  if (!tag) {
    return;
  }
  tag = tag.replace(new RegExp(escapeForRegExp('{{ext}}'), 'g'), sourceExt);
  return tag.replace(new RegExp(escapeForRegExp('{{name}}'), 'g'), exports.name);
}

function escapeForRegExp (str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
