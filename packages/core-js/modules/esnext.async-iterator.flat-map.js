'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var isObject = require('../internals/is-object');
var createAsyncIteratorProxy = require('../internals/create-async-iterator-proxy');
var getBuiltIn = require('../internals/get-built-in');
var getIteratorMethod = require('../internals/get-iterator-method');
var wellKnownSymbol = require('../internals/well-known-symbol');

var Promise = getBuiltIn('Promise');
var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');

var AsyncIteratorProxy = createAsyncIteratorProxy(function (arg) {
  var state = this;
  var mapper = state.mapper;
  var innerIterator, iteratorMethod;

  return new Promise(function (resolve, reject) {
    var outerLoop = function () {
      try {
        Promise.resolve(anObject(state.next.call(state.iterator, arg))).then(function (step) {
          try {
            if (anObject(step).done) {
              state.done = true;
              resolve({ done: true, value: undefined });
            } else {
              Promise.resolve(mapper(step.value)).then(function (mapped) {
                try {
                  if (isObject(mapped)) {
                    iteratorMethod = mapped[ASYNC_ITERATOR];
                    if (iteratorMethod === undefined) iteratorMethod = getIteratorMethod(mapped);
                    if (iteratorMethod !== undefined) {
                      state.innerIterator = innerIterator = iteratorMethod.call(mapped);
                      state.innerNext = aFunction(innerIterator.next);
                      return innerLoop();
                    }
                  }

                  resolve({ done: false, value: mapped });
                } catch (error2) { reject(error2); }
              }, reject);
            }
          } catch (error1) { reject(error1); }
        }, reject);
      } catch (error) { reject(error); }
    };

    var innerLoop = function () {
      if (innerIterator = state.innerIterator) {
        try {
          Promise.resolve(anObject(state.innerNext.call(innerIterator))).then(function (result) {
            try {
              if (anObject(result).done) {
                state.innerIterator = state.innerNext = null;
                outerLoop();
              } else resolve({ done: false, value: result.value });
            } catch (error1) { reject(error1); }
          }, reject);
        } catch (error) { reject(error); }
      } else outerLoop();
    };

    innerLoop();
  });
});

$({ target: 'AsyncIterator', proto: true, real: true }, {
  flatMap: function flatMap(mapper) {
    return new AsyncIteratorProxy({
      iterator: anObject(this),
      mapper: aFunction(mapper),
      innerIterator: null,
      innerNext: null
    });
  }
});
