'use strict';
var through2 = require('through2');
var fancyLog = require('fancy-log');
var PluginError = require('plugin-error');
var colors = require('ansi-colors');
var streamToArray = require('stream-to-array');
var escapeStringRegexp = require('escape-string-regexp');
var groupArray = require('group-array');
var extname = require('../extname');
var transform = require('../transform');
var tags = require('../tags');
var getFilepath = require('../path');

var magenta = colors.magenta;
var cyan = colors.cyan;
var noop = function noop() {};

/**
 * Constants
 */
var PLUGIN_NAME = 'gulp-inject';
var DEFAULT_NAME_FOR_TAGS = 'inject';

module.exports = exports = function (sources, opt) {
  if (!sources) {
    throw error('Missing sources stream!');
  }
  if (!opt) {
    opt = {};
  }

  if (opt.sort) {
    throw error('sort option is deprecated! Use `sort-stream` module instead!');
  }
  if (opt.templateString) {
    throw error('`templateString` option is deprecated! Create a virtual `vinyl` file instead!');
  }
  if (opt.transform && typeof opt.transform !== 'function') {
    throw error('transform option must be a function');
  }
  // Notify people of common mistakes...
  if (typeof opt.read !== 'undefined') {
    throw error('There is no `read` option. Did you mean to provide it for `gulp.src` perhaps?');
  }

  // Defaults:
  opt.quiet = bool(opt, 'quiet', false);
  opt.relative = bool(opt, 'relative', false);
  opt.addRootSlash = bool(opt, 'addRootSlash', !opt.relative);
  opt.transform = defaults(opt, 'transform', transform);
  opt.tags = tags();
  opt.name = defaults(opt, 'name', DEFAULT_NAME_FOR_TAGS);
  transform.selfClosingTag = bool(opt, 'selfClosingTag', false);

  // Is the first parameter a Vinyl File Stream:
  if (typeof sources.on === 'function' && typeof sources.pipe === 'function') {
    return handleVinylStream(sources, opt);
  }

  throw error('passing target file as a string is deprecated! Pass a vinyl file stream (i.e. use `gulp.src`)!');
};

function defaults(options, prop, defaultValue) {
  return options[prop] || defaultValue;
}

function bool(options, prop, defaultVal) {
  return typeof options[prop] === 'undefined' ? defaultVal : Boolean(options[prop]);
}

/**
 * Handle injection when files to
 * inject comes from a Vinyl File Stream
 *
 * @param {Stream} sources
 * @param {Object} opt
 * @returns {Stream}
 */
function handleVinylStream(sources, opt) {
  var collected = streamToArray(sources);

  return through2.obj(function (target, enc, cb) {
    if (target.isStream()) {
      return cb(error('Streams not supported for target templates!'));
    }
    collected.then(function (collection) { // eslint-disable-line promise/prefer-await-to-then
      target.contents = getNewContent(target, collection, opt);
      this.push(target);
      cb();
    }.bind(this))
      .catch(function (error_) {
        cb(error_);
      });
  });
}

/**
 * Get new content for template
 * with all injections made
 *
 * @param {Object} target
 * @param {Array} collection
 * @param {Object} opt
 * @returns {Buffer}
 */
function getNewContent(target, collection, opt) {
  var logger = opt.quiet ? noop : function (filesCount) {
    if (filesCount) {
      var pluralState = filesCount > 1 ? 's' : '';
      log(cyan(filesCount) + ' file' + pluralState + ' into ' + magenta(target.relative) + '.');
    } else {
      log('Nothing to inject into ' + magenta(target.relative) + '.');
    }
  };
  var content = String(target.contents);
  var targetExt = extname(target.path);
  var files = prepareFiles(collection, targetExt, opt, target);
  var filesPerTags = groupArray(files, 'tagKey');
  var startAndEndTags = Object.keys(filesPerTags);
  var matches = [];
  var injectedFilesCount = 0;

  startAndEndTags.forEach(function (tagKey) {
    var files = filesPerTags[tagKey];
    var startTag = files[0].startTag;
    var endTag = opt.singleTag ? null : files[0].endTag;
    var tagsToInject = getTagsToInject(files, target, opt);

    content = inject(content, {
      startTag: startTag,
      endTag: endTag,
      tagsToInject: tagsToInject,
      removeTags: opt.removeTags,
      empty: opt.empty,
      willInject: function (filesToInject) {
        injectedFilesCount += filesToInject.length;
      },
      onMatch: function (match) {
        matches.push(match[0]);
      }
    });
  });

  logger(injectedFilesCount);

  if (opt.empty) {
    var ext = '{{ANY}}';
    var startTag = getTagRegExp(opt.tags.start(targetExt, ext, opt.starttag), ext, opt);
    var endTag = opt.singleTag ? null : getTagRegExp(opt.tags.end(targetExt, ext, opt.endtag), ext, opt);

    content = inject(content, {
      startTag: startTag,
      endTag: endTag,
      tagsToInject: [],
      removeTags: opt.removeTags,
      empty: opt.empty,
      shouldAbort: function (match) {
        return matches.includes(match[0]);
      }
    });
  }

  return Buffer.from(content);
}

/**
 * Inject tags into content for given
 * start and end tags
 *
 * @param {String} content
 * @param {Object} opt
 * @returns {String}
 */
function inject(content, opt) {
  var startTag = opt.startTag;
  var endTag = opt.endTag;
  var startMatch;
  var endMatch;

  /**
   * The content consists of:
   *
   * <everything before startMatch>
   * <startMatch>
   * <previousInnerContent>
   * <endMatch>
   * <everything after endMatch>
   */

  while ((startMatch = startTag.exec(content)) !== null) {
    if (typeof opt.onMatch === 'function') {
      opt.onMatch(startMatch);
    }
    if (typeof opt.shouldAbort === 'function' && opt.shouldAbort(startMatch)) {
      continue;
    }
    if (endTag) {
      // Take care of content length change:
      endTag.lastIndex = startTag.lastIndex;
      endMatch = endTag.exec(content);
      if (!endMatch) {
        throw error('Missing end tag for start tag: ' + startMatch[0]);
      }
    }
    var toInject = opt.tagsToInject.slice();

    if (typeof opt.willInject === 'function') {
      opt.willInject(toInject);
    }

    // <everything before startMatch>:
    var newContents = content.slice(0, startMatch.index);

    if (opt.removeTags) {
      if (opt.empty) {
        // Account for the tag no longer being included in the content
        startTag.lastIndex -= startMatch[0].length;
      }
    } else {
      // Prepend start tag
      toInject.unshift(startMatch[0]);

      if (endTag && endMatch) {
        // Append end tag
        toInject.push(endMatch[0]);
      }
    }

    if (endTag) {
      const previousInnerContent = content.slice(startTag.lastIndex, endMatch.index);
      // Capture the leading whitespace from the first line of the inner content
      const indent = previousInnerContent.match(/^\s*/)[0];
      // Paste in <new inner content>:
      newContents += toInject.join(indent);
      // Paste in <everything after endMatch>:
      newContents += content.slice(endTag.lastIndex);
    } else {
      // Capture the leading whitespace before the start tag
      const indentMatch = content.slice(0, startMatch.index).match(/\n(\s*)$/);
      // Indent each injected piece the same as the start tag
      const indent = indentMatch ? '\n' + indentMatch[1] : '';
      // Paste in new content
      newContents += toInject.join(indent) + content.slice(startTag.lastIndex);
    }

    // Replace old content with new:
    content = newContents;
  }

  return content;
}

function prepareFiles(files, targetExt, opt, target) {
  return files.map(function (file) {
    var ext = extname(file.path);
    var filePath = getFilepath(file, target, opt);
    var startTag = getTagRegExp(opt.tags.start(targetExt, ext, opt.starttag), ext, opt, filePath);
    var endTag = getTagRegExp(opt.tags.end(targetExt, ext, opt.endtag), ext, opt, filePath);
    var tagKey = String(startTag) + String(endTag);
    return {
      file: file,
      ext: ext,
      startTag: startTag,
      endTag: endTag,
      tagKey: tagKey
    };
  });
}

function getTagRegExp(tag, sourceExt, opt, sourcePath) {
  tag = makeWhiteSpaceOptional(escapeStringRegexp(tag));
  tag = replaceVariables(tag, {
    name: opt.name,
    path: sourcePath,
    ext: sourceExt === '{{ANY}}' ? '.+' : sourceExt
  });
  return new RegExp(tag, 'ig');
}

function replaceVariables(str, variables) {
  return Object.keys(variables).reduce(function (str, variable) {
    return str.replace(new RegExp(escapeStringRegexp(escapeStringRegexp('{{' + variable + '}}')), 'ig'), variables[variable] + '\\b');
  }, str);
}

function makeWhiteSpaceOptional(str) {
  return str.replace(/\s+/g, '\\s*');
}

function getTagsToInject(files, target, opt) {
  return files.reduce(function transformFile(lines, file, i, files) {
    var filepath = getFilepath(file.file, target, opt);
    var transformedContents = opt.transform(filepath, file.file, i, files.length, target);
    if (typeof transformedContents !== 'string') {
      return lines;
    }
    return lines.concat(transformedContents);
  }, []);
}

function log(message) {
  fancyLog.info(magenta(PLUGIN_NAME), message);
}

function error(message) {
  return new PluginError(PLUGIN_NAME, message);
}
