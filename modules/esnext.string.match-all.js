'use strict';
// https://tc39.github.io/proposal-string-matchall/
var defined = require('./_defined');
var toLength = require('./_to-length');
var isRegExp = require('./_is-regexp');
var getFlags = require('./_flags');
var hide = require('./_hide');
var speciesConstructor = require('./_species-constructor');
var at = require('./_string-at')(true);
var MATCH_ALL = require('./_wks')('matchAll');
var IS_PURE = require('./_is-pure');
var $ = require('./_state');
var $RegExp = RegExp;
var RegExpProto = $RegExp.prototype;
var regExpBuiltinExec = RegExpProto.exec;

var matchAllIterator = function (R, O) {
  var S = String(O);
  var C = speciesConstructor(R, $RegExp);
  var flags = 'flags' in RegExpProto ? String(R.flags) : getFlags.call(R);
  var matcher = new C(C === $RegExp ? R.source : R, flags);
  var global = !!matcher.global;
  var fullUnicode = !!matcher.unicode;
  matcher.lastIndex = toLength(R.lastIndex);
  return new $RegExpStringIterator(matcher, S, global, fullUnicode);
};

var advanceStringIndex = function (S, index, unicode) {
  if (!unicode) return index + 1;
  return index + at(S, index).length;
};

var $RegExpStringIterator = function (regexp, string, global, fullUnicode) {
  $(this, {
    regexp: regexp,
    string: string,
    global: global,
    unicode: fullUnicode,
    done: false
  });
};

var regExpExec = function (R, S) {
  var exec = R.exec;
  var result;
  if (typeof exec == 'function') {
    result = exec.call(R, S);
    if (typeof result != 'object') throw TypeError('Incorrect exec result!');
    return result;
  } return regExpBuiltinExec.call(R, S);
};

require('./_iter-create')($RegExpStringIterator, 'RegExp String', function next() {
  var state = $(this);
  if (state.done) return { value: null, done: true };
  var R = state.regexp;
  var S = state.string;
  var match = regExpExec(R, S);
  if (match === null) return { value: null, done: state.done = true };
  if (state.global) {
    if (String(match[0]) == '') R.lastIndex = advanceStringIndex(S, toLength(R.lastIndex), state.unicode);
    return { value: match, done: false };
  }
  state.done = true;
  return { value: match, done: false };
});

require('./_export')({ target: 'String', proto: true }, {
  matchAll: function matchAll(regexp) {
    var O = defined(this);
    var R = isRegExp(regexp) ? regexp : new $RegExp(regexp, 'g');
    var matcher = R[MATCH_ALL];
    return matcher === undefined ? matchAllIterator(R, O) : matcher.call(R, O);
  }
});

IS_PURE || MATCH_ALL in RegExpProto || hide(RegExpProto, MATCH_ALL, function (string) {
  return matchAllIterator(this, string);
});
