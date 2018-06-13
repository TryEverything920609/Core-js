'use strict';

var anObject = require('../internals/an-object');
var toLength = require('../internals/to-length');
var advanceStringIndex = require('../internals/advance-string-index');
var nativeExec = RegExp.prototype.exec;

// @@match logic
require('../internals/fix-regexp-well-known-symbol-logic')('match', 1, function (defined, MATCH, nativeMatch) {
  return [
    // `String.prototype.match` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = defined(this);
      var matcher = regexp == undefined ? undefined : regexp[MATCH];
      return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
    function Symbol$match(regexp) {
      if (regexp.exec === nativeExec) return nativeMatch.call(this, regexp);

      var rx = anObject(regexp);
      var S = String(this);

      if (!rx.global) return rx.exec(S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = rx.exec(S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});
