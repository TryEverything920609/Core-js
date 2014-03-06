var prototype      = 'prototype'
  // Aliases global objects and prototypes
  , Function       = global.Function
  , Object         = global.Object
  , Array          = global.Array
  , String         = global.String
  , Number         = global.Number
  , RegExp         = global.RegExp
  , Math           = global.Math
  , TypeError      = global.TypeError
  , setTimeout     = global.setTimeout
  , clearTimeout   = global.clearTimeout
  , setInterval    = global.setInterval
  , setImmediate   = global.setImmediate
  , clearImmediate = global.clearImmediate
  , document       = global.document
  , Infinity       = 1 / 0
  , $Array         = Array[prototype]
  , $Object        = Object[prototype]
  , $Function      = Function[prototype]
  , console        = global.console || {log: $Function};
  
// http://es5.github.io/#x9.12
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.is
var same = Object.is || function(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !==y;
}
// http://jsperf.com/core-js-isobject
function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// native function?
var nativeRegExp = /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/;
function isNative(it){
  return nativeRegExp.test(it);
}
// object internal [[Class]]
// http://jsperf.com/core-js-classof
var toString = $Object.toString;
function classof(it){
  return it == undefined ? it === undefined ? 'Undefined' : 'Null' : toString.call(it).slice(8, -1);
}

// Function:
var apply = $Function.apply
  , call  = $Function.call
  , undescore = global._
  , _ = {
    noConflict: function(){
      global._ = undescore;
      return _;
    }
  };
// partial apply
function part(/*args...*/){
  var length = arguments.length
    , args   = Array(length)
    , i      = 0
    , placeholder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)placeholder = true;
  return createPartialApplication(this, args, length, placeholder, false);
}
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  }
}
function createPartialApplication(fn, argsPart, lengthPart, placeholder, bind, context){
  assertFunction(fn);
  return function(/*args...*/){
    var that   = bind ? context : this
      , length = arguments.length
      , i = 0, j = 0, args;
    if(!placeholder && length == 0)return fn.apply(that, argsPart);
    args = argsPart.slice();
    if(placeholder)for(;lengthPart > i; i++)if(args[i] === _)args[i] = arguments[j++]
    while(length > j)args.push(arguments[j++]);
    return fn.apply(that, args);
  }
}
// unbind method from context
// foo.fn(arg1, arg2, ...) => fn(foo, arg1, arg2, ...)
function unbind(that){
  return function(){
    return call.apply(that, arguments);
  }
}
// add `this` as first argument
// fn(foo, arg1, arg2, ...) => foo.fn(arg1, arg2, ...)
function methodize(){
  var fn = this;
  return function(/*args...*/){
    var length = arguments.length
      , args   = Array(length + 1)
      , i      = 0;
    args[0] = this;
    while(length > i)args[i + 1] = arguments[i++];
    return apply.call(fn, undefined, args);
  }
}

// Object:
var _hasOwn = $Object.hasOwnProperty;
function has(object, key){
  return _hasOwn.call(object, key);
}
var isEnumerable   = $Object.propertyIsEnumerable
  , defineProperty = Object.defineProperty
  , __PROTO__      = '__proto__' in $Object
  , DESCRIPTORS    = 1;
// http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
function getOwnPropertyDescriptors(object){
  var result = {}
    , names  = getOwnPropertyNames(object)
    , length = names.length
    , i      = 0
    , key;
  while(length > i)result[key = names[i++]] = getOwnPropertyDescriptor(object, key);
  return result;
}
// http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
function getPropertyDescriptor(object, key){
  if(key in object)do {
    if(has(object, key))return getOwnPropertyDescriptor(object, key);
  } while(object = getPrototypeOf(object));
}
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign
var assign = Object.assign || function(target, source){
  target = Object(target);
  source = ES5Object(source);
  var props  = keys(source)
    , length = props.length
    , i      = 0
    , key;
  while(length > i)target[key = props[i++]] = source[key];
  return target;
}
function invert(object){
  object = ES5Object(object);
  var result = {}
    , names  = keys(object)
    , length = names.length
    , i      = 0
    , key;
  while(length > i)result[object[key = names[i++]]] = key;
  return result;
}

// Array:
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push   = $Array.push
  , slice  = $Array.slice
  , $slice = Array.slice || function(arrayLike, from){
      return slice.call(arrayLike, from);
    }
  , ArrayIterator;
// Dummy, fix for not array-like ES3 string in es5.js
var ES5Object = Object;
// simple reduce to object
function reduceTo(target, callbackfn){
  if(arguments.length < 2){
    callbackfn = target;
    target = {};
  } else target = Object(target);
  assertFunction(callbackfn);
  var self   = ES5Object(this)
    , length = toLength(self.length)
    , i      = 0;
  for(;length > i; i++)i in self && callbackfn(target, self[i], i, this);
  return target;
}

// Math:
var ceil   = Math.ceil
  , floor  = Math.floor
  , max    = Math.max
  , min    = Math.min
  , pow    = Math.pow
  , random = Math.random
  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
var toInteger = Number.toInteger || function(it){
  return (it = +it) != it ? 0 : it != 0 && it != Infinity && it != -Infinity ? (it > 0 ? floor : ceil)(it) : it;
}
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}

// Assertion & errors:
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition){
  if(!condition)throw TypeError($slice(arguments, 1).join(' '));
}
function assertFunction(it){
  assert(isFunction(it), it, 'is not a function!');
}
function assertObject(it){
  assert(isObject(it), it, 'is not an object!');
}
function assertInstance(it, constructor, name){
  assert(it instanceof constructor, name, ": please use the 'new' operator!");
}

var ITERATOR = global.Symbol && Symbol.iterator || '@@iterator';
function symbol(key){
  return '@@' + key + '_' + random().toString(36).slice(2);
}
function descriptor(bitmap, value){
  return {
    enumerable  : !!(bitmap & 1),
    configurable: !!(bitmap & 2),
    writable    : !!(bitmap & 4),
    value       : value
  }
}
function hidden(object, key, value){
  return defineProperty(object, key, descriptor(6, value));
}

var GLOBAL = 0
  , STATIC = 1
  , PROTO  = 2
  , $exports = typeof exports != 'undefined' ? (module.exports = _) : (global._ = _);

var KEY       = 1
  , VALUE     = 2;
function createIterResultObject(value, done){
  return {value: value, done: !!done};
}
function createIteratorFactory(constructor, kind){
  return function(){
    return new constructor(this, kind);
  }
}