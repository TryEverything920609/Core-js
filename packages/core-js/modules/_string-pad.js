// https://github.com/tc39/proposal-string-pad-start-end
var toLength = require('core-js-internals/to-length');
var repeat = require('core-js-internals/string-repeat');
var requireObjectCoercible = require('core-js-internals/require-object-coercible');

module.exports = function (that, maxLength, fillString, left) {
  var S = String(requireObjectCoercible(that));
  var stringLength = S.length;
  var fillStr = fillString === undefined ? ' ' : String(fillString);
  var intMaxLength = toLength(maxLength);
  if (intMaxLength <= stringLength || fillStr == '') return S;
  var fillLen = intMaxLength - stringLength;
  var stringFiller = repeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
  if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
  return left ? stringFiller + S : S + stringFiller;
};
