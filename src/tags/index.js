
/**
 * Constants
 */
var DEFAULT_TARGET = 'html';
var DEFAULTS = {
  STARTS: {
    'html': '<!-- inject:{{ext}} -->',
    'jsx': '{/* inject:{{ext}} */}',
    'jade': '//- inject:{{ext}}'
  },
  ENDS: {
    'html': '<!-- endinject -->',
    'jsx': '{/* endinject */}',
    'jade': '//- endinject'
  }
};

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
  return tag.replace(new RegExp(escapeForRegExp('{{ext}}'), 'g'), sourceExt);
}

function escapeForRegExp (str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
