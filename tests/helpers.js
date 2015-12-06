// Generated by LiveScript 1.3.1
(function(){
  QUnit.assert.arity = function(fn, length, message){
    this.push(fn.length === length, fn.length, length, message || "arity is " + length);
  };
}).call(this);

// Generated by LiveScript 1.3.1
(function(){
  var same, slice$ = [].slice;
  same = function(a, b){
    if (a === b) {
      return a !== 0 || 1 / a === 1 / b;
    } else {
      return a != a && b != b;
    }
  };
  QUnit.assert.arrayEqual = function(a, b, message){
    var result, i$, to$, i;
    result = true;
    if (a.length !== b.length) {
      result = false;
    } else {
      for (i$ = 0, to$ = a.length; i$ < to$; ++i$) {
        i = i$;
        if (!same(a[i], b[i])) {
          result = false;
          break;
        }
      }
    }
    this.push(result, slice$.call(a), slice$.call(b), message);
  };
}).call(this);

// Generated by LiveScript 1.3.1
(function(){
  Function('return this')().createIterable = function(elements, methods){
    var index, iterator, iterable, ref$, ref1$;
    methods == null && (methods = {});
    index = 0;
    iterator = import$({
      next: function(){
        iterable.called = true;
        return {
          value: elements[index++],
          done: index > elements.length
        };
      }
    }, methods);
    return iterable = (ref$ = {
      called: false,
      received: false
    }, ref$[(typeof Symbol != 'undefined' && Symbol !== null ? Symbol.iterator : void 8) || (typeof core != 'undefined' && core !== null ? (ref1$ = core.Symbol) != null ? ref1$.iterator : void 8 : void 8)] = function(){
      this.received = true;
      return iterator;
    }, ref$);
  };
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

// Generated by LiveScript 1.3.1
(function(){
  QUnit.assert.epsilon = function(a, b, E, message){
    this.push(Math.abs(a - b) <= (E != null ? E : 1e-11), a, b, message);
  };
}).call(this);

// Generated by LiveScript 1.3.1
(function(){
  'use strict';
  var global;
  global = Function('return this')();
  import$(global, {
    global: global,
    DESCRIPTORS: function(){
      try {
        return 7 === Object.defineProperty({}, 'a', {
          get: function(){
            return 7;
          }
        }).a;
      } catch (e$) {}
    }(),
    STRICT: !function(){
      return this;
    }(),
    PROTO: Object.setPrototypeOf != null || '__proto__' in Object.prototype,
    NATIVE: void 8
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

// Generated by LiveScript 1.3.1
(function(){
  var toString$ = {}.toString;
  QUnit.assert.isFunction = function(fn, message){
    this.push(typeof fn === 'function' || toString$.call(fn).slice(8, -1) === 'Function', false, true, message || 'is function');
  };
}).call(this);

// Generated by LiveScript 1.3.1
(function(){
  QUnit.assert.isIterable = function(it, message){
    this.push(core.isIterable(it), false, true, message || 'is iterable');
  };
}).call(this);

// Generated by LiveScript 1.3.1
(function(){
  QUnit.assert.isIterator = function(it, message){
    this.push(typeof it === 'object' && typeof it.next === 'function', false, true, message || 'is iterator');
  };
}).call(this);

// Generated by LiveScript 1.3.1
(function(){
  QUnit.assert.looksNative = function(fn, message){
    this.push(/native code/.test(Function.prototype.toString.call(fn)), false, true, message || 'looks native');
  };
}).call(this);

// Generated by LiveScript 1.3.1
(function(){
  QUnit.assert.name = function(fn, name, message){
    this.push(fn.name === name, fn.name, name, message || "name is '" + name + "'");
  };
}).call(this);

// Generated by LiveScript 1.3.1
(function(){
  QUnit.assert.same = function(a, b, message){
    this.push(a === b
      ? a !== 0 || 1 / a === 1 / b
      : a != a && b != b, a, b, message);
  };
}).call(this);
