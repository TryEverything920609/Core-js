var DESCRIPTORS = require('core-js-internals/descriptors');
var dP = require('./_object-dp');
var anObject = require('core-js-internals/an-object');
var getKeys = require('./_object-keys');

module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
