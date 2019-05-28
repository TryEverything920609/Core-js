var global = require('../internals/global');
var trim = require('../internals/string-trim').trim;
var whitespaces = require('../internals/whitespaces');

var nativeParseFloat = global.parseFloat;
var FORCED = 1 / nativeParseFloat(whitespaces + '-0') !== -Infinity;

module.exports = FORCED ? function parseFloat(str) {
  var string = trim(String(str));
  var result = nativeParseFloat(string);
  return result === 0 && string.charAt(0) == '-' ? -0 : result;
} : nativeParseFloat;
