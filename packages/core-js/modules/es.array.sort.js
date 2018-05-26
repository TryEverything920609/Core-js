'use strict';
var aFunction = require('core-js-internals/a-function');
var toObject = require('core-js-internals/to-object');
var fails = require('core-js-internals/fails');
var $sort = [].sort;
var test = [1, 2, 3];

require('./_export')({ target: 'Array', proto: true, forced: fails(function () {
  // IE8-
  test.sort(undefined);
}) || !fails(function () {
  // V8 bug
  test.sort(null);
  // Old WebKit
}) || !require('./_strict-method')($sort) }, {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? $sort.call(toObject(this))
      : $sort.call(toObject(this), aFunction(comparefn));
  }
});
