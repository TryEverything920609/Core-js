'use strict';
var anObject = require('core-js-internals/an-object');
var aFunction = require('core-js-internals/a-function');
var iterate = require('../internals/iterate');

// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Map', proto: true, real: true, forced: require('../internals/is-pure') }, {
  merge: function merge(iterable) {
    var map = anObject(this);
    iterate(iterable, true, aFunction(map.set), map);
    return map;
  }
});
