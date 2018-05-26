// https://github.com/tc39/proposal-promise-finally
'use strict';
var path = require('./_path');
var global = require('./_global');
var speciesConstructor = require('./_species-constructor');
var promiseResolve = require('./_promise-resolve');

require('./_export')({ target: 'Promise', proto: true, real: true }, { 'finally': function (onFinally) {
  var C = speciesConstructor(this, typeof path.Promise == 'function' ? path.Promise : global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });
