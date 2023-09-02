'use strict';

var gutil = require('gulp-util');

var PluginError = gutil.PluginError;

/**
 * Constants
 */
var PLUGIN_NAME = 'gulp-inject';

module.exports = exports = function attrString(attributes) {
  if (!attributes) {
    return '';
  }

  if (typeof attributes === 'string') {
    return ' ' + attributes;
  }

  if (typeof attributes !== 'object') {
    throw error('`' + (typeof attributes) + '` is not a valid type for attributes!');
  }

  var result = ' ';
  var first = true;
  if (Array.isArray(attributes)) {
    if (attributes.length === 0) {
      return '';
    }
    for (var i = 0; i < attributes.length; i++) {
      result = result + (first ? '' : ' ') + attrObjToString(attributes[i]);
      first = false;
    }
  } else {
    for (var key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        if (typeof attributes[key] !== 'string') {
          throw error('The type of the attribute `' + key + '` must be a string and not a ' + (typeof attributes[key]) + ' !');
        }
        result = result + (first ? '' : ' ') + key + '="' + attributes[key] + '"';
        first = false;
      }
    }
  }

  return result;
};

function attrObjToString(attribute) {
  if (typeof attribute === 'string') {
    return attribute;
  }
  if (typeof attribute === 'object') {
    if (Array.isArray(attribute)) {
      if (attribute.length === 2) {
        return attribute[0] + '="' + attribute[1] + '"';
      }
      if (attribute.length === 1) {
        return attribute[0];
      }
      throw error('If an attribute is an array, it must contain one or two elements ([name, value]) and not ' + attribute.length + ' !');
    } else {
      if (!attribute.hasOwnProperty('name')) {
        error('An attribute object must have an property named `name`!');
      }
      if (!attribute.hasOwnProperty('value')) {
        error('An attribute object must have an property named `value`!');
      }
      return attribute.name + '="' + attribute.value + '"';
    }
  }
  throw error('`' + (typeof attribute) + '` is not a valid type for an attribute!');
}

function error(message) {
  return new PluginError(PLUGIN_NAME, message);
}
