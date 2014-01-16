'use strict';

var through = require('through'),
    fs = require('fs'),
    path = require('path'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    File = gutil.File;

module.exports = function(fileName, opt){
  if (!fileName) {
    throw new PluginError('gulp-inject',  'Missing fileName option for gulp-inject');
  }
  if (!opt) {
    opt = {};
  }

  if (opt.transform && typeof opt.transform !== 'function') {
    throw new PluginError('gulp-inject', 'transform option must be a function');
  }
  if (opt.sort && typeof opt.sort !== 'function') {
    throw new PluginError('gulp-inject', 'sort option must be a function');
  }

  // Defaults:
  opt.starttag = opt.starttag || '<!-- inject:{{ext}} -->';
  opt.endtag = opt.endtag || '<!-- endinject -->';
  opt.ignorePath = toArray(opt.ignorePath);
  opt.addRootSlash = typeof opt.addRootSlash !== 'undefined' ? !!opt.addRootSlash : true;
  opt.transform = opt.transform || function (filepath) {
    switch(extname(filepath)) {
      case 'css':
        return '<link rel="stylesheet" href="' + filepath + '">';
      case 'js':
        return '<script src="' + filepath + '"></script>';
      case 'html':
        return '<link rel="import" href="' + filepath + '">';
    }
  };

  var collection = {};
  var firstFile = null;

  function collectFiles(file){
    if (!file.path) {
      return;
    }

    if (!firstFile) {
      firstFile = file;
    }

    var ext = extname(file.path),
        tag = getTag(opt.starttag, ext);

    if (!collection[tag]) {
      collection[tag] = {ext: ext, starttag: tag, endtag: getTag(opt.endtag, ext), files: []};
    }

    var filepath = removeBasePath([unixify(file.cwd)].concat(opt.ignorePath), unixify(file.path));

    if (opt.addRootSlash) {
        filepath = addRootSlash(filepath);
    }

    collection[tag].files.push({file: file, filepath: filepath});
  }

  function endStream(){
    /* jshint validthis:true */
    if (Object.keys(collection).length === 0) {
      return this.emit('end');
    }

    var templatePath = path.resolve(firstFile.cwd, fileName);
    var template = opt.templateString || fs.readFileSync(templatePath, 'utf8');


    template = Object.keys(collection).reduce(function eachInCollection (contents, key) {
      var tagInfo = collection[key];
      if (opt.sort) {
        tagInfo.files.sort(opt.sort);
      }
      return contents.replace(getInjectorTagsRegExp(tagInfo.starttag, tagInfo.endtag), function injector (match, starttag, indent, content, endtag) {
        return [starttag]
          .concat(tagInfo.files.map(function transformFile (file, i, files) {
            return opt.transform(file.filepath, file.file, i, files.length);
          }))
          .concat([endtag])
          .join(indent);
      });
    }, template);

    var templateFile = new File({
      cwd: firstFile.cwd,
      base: path.dirname(templatePath),
      path: templatePath,
      contents: new Buffer(template)
    });

    this.emit('data', templateFile);
    this.emit('end');
  }

  return through(collectFiles, endStream);
};

function getTag (tag, ext) {
  return tag.replace('{{ext}}', ext);
}

function extname (file) {
  return path.extname(file).slice(1);
}

function getInjectorTagsRegExp (starttag, endtag) {
  return new RegExp('(' + escapeForRegExp(starttag) + ')(\\s*)(\\n|\\r|.)*?(' + escapeForRegExp(endtag) + ')', 'gi');
}

function escapeForRegExp (str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function unixify (filepath) {
  return filepath.replace(/\\/g, '/');
}
function addRootSlash (filepath) {
  return filepath.replace(/^\/*([^\/])/, '/$1');
}

function removeBasePath (basedir, filepath) {
  return toArray(basedir).reduce(function (path, remove) {
    if (remove && path.indexOf(remove) === 0) {
      return path.slice(remove.length);
    }
    return path;
  }, filepath);
}

function toArray (arr) {
  if (!Array.isArray(arr)) {
    return arr ? [arr] : [];
  }
  return arr;
}
