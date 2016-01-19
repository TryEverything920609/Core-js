var $         = require('./_')
  , gOPD      = require('./_object-gopd')
  , ownKeys   = require('./_own-keys')
  , toIObject = require('./_to-iobject');

module.exports = function define(target, mixin){
  var keys   = ownKeys(toIObject(mixin))
    , length = keys.length
    , i = 0, key;
  while(length > i)$.setDesc(target, key = keys[i++], gOPD.f(mixin, key));
  return target;
};