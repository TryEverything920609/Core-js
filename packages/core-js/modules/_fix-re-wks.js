'use strict';
var hide = require('./_hide');
var redefine = require('./_redefine');
var fails = require('core-js-internals/fails');
var requireObjectCoercible = require('core-js-internals/require-object-coercible');
var wellKnownSymbol = require('core-js-internals/well-known-symbol');

module.exports = function (KEY, length, exec) {
  var SYMBOL = wellKnownSymbol(KEY);
  var fns = exec(requireObjectCoercible, SYMBOL, ''[KEY]);
  var strfn = fns[0];
  var rxfn = fns[1];
  if (fails(function () {
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  })) {
    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};
