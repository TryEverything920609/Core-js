var $export = require('./_export');
var requireObjectCoercible = require('core-js-internals/require-object-coercible');
var fails = require('./_fails');
var spaces = require('core-js-internals/whitespaces');
var space = '[' + spaces + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function (KEY, exec, ALIAS) {
  var exported = {};
  var FORCED = fails(function () {
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exported[KEY] = FORCED ? exec(trim) : spaces[KEY];
  if (ALIAS) exported[ALIAS] = fn;
  $export({ target: 'String', proto: true, forced: FORCED }, exported);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function (string, TYPE) {
  string = String(requireObjectCoercible(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;
