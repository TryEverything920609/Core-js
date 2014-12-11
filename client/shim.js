/**
 * Core.js 0.2.1
 * https://github.com/zloirock/core-js
 * License: http://rock.mit-license.org
 * © 2014 Denis Pushkarev
 */
!function(returnThis, framework, undefined){
'use strict';

/******************************************************************************
 * Module : common                                                            *
 ******************************************************************************/

var global          = returnThis()
  // Shortcuts for [[Class]] & property names
  , OBJECT          = 'Object'
  , FUNCTION        = 'Function'
  , ARRAY           = 'Array'
  , STRING          = 'String'
  , NUMBER          = 'Number'
  , REGEXP          = 'RegExp'
  , DATE            = 'Date'
  , MAP             = 'Map'
  , SET             = 'Set'
  , WEAKMAP         = 'WeakMap'
  , WEAKSET         = 'WeakSet'
  , SYMBOL          = 'Symbol'
  , PROMISE         = 'Promise'
  , MATH            = 'Math'
  , ARGUMENTS       = 'Arguments'
  , PROTOTYPE       = 'prototype'
  , CONSTRUCTOR     = 'constructor'
  , TO_STRING       = 'toString'
  , TO_LOCALE       = 'toLocaleString'
  , HAS_OWN         = 'hasOwnProperty'
  , FOR_EACH        = 'forEach'
  , PROCESS         = 'process'
  , CREATE_ELEMENT  = 'createElement'
  // Aliases global objects and prototypes
  , Function        = global[FUNCTION]
  , Object          = global[OBJECT]
  , Array           = global[ARRAY]
  , String          = global[STRING]
  , Number          = global[NUMBER]
  , RegExp          = global[REGEXP]
  , Date            = global[DATE]
  , Map             = global[MAP]
  , Set             = global[SET]
  , WeakMap         = global[WEAKMAP]
  , WeakSet         = global[WEAKSET]
  , Symbol          = global[SYMBOL]
  , Math            = global[MATH]
  , TypeError       = global.TypeError
  , RangeError      = global.RangeError
  , setTimeout      = global.setTimeout
  , clearTimeout    = global.clearTimeout
  , setImmediate    = global.setImmediate
  , clearImmediate  = global.clearImmediate
  , process         = global[PROCESS]
  , nextTick        = process && process.nextTick
  , document        = global.document
  , navigator       = global.navigator
  , define          = global.define
  , ArrayProto      = Array[PROTOTYPE]
  , ObjectProto     = Object[PROTOTYPE]
  , FunctionProto   = Function[PROTOTYPE]
  , Infinity        = 1 / 0
  , core            = {}
  , path            = framework ? global : core
  , DOT             = '.';

// http://jsperf.com/core-js-isobject
function isObject(it){
  return it != null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// Native function?
var isNative = ctx(/./.test, /\[native code\]\s*\}\s*$/, 1);

// Object internal [[Class]] or toStringTag
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
var toString = ObjectProto[TO_STRING];
var buildIn  = {
  Undefined: 1, Null: 1, Array: 1, String: 1, Arguments: 1,
  Function: 1, Error: 1, Boolean: 1, Number: 1, Date: 1, RegExp: 1
} , TO_STRING_TAG = TO_STRING + 'Tag';
function setToStringTag(it, tag, stat){
  if(it)has(it = stat ? it : it[PROTOTYPE], SYMBOL_TAG) || hidden(it, SYMBOL_TAG, tag);
}
function cof(it){
  return it == undefined ? it === undefined
    ? 'Undefined' : 'Null' : toString.call(it).slice(8, -1);
}
function classof(it){
  var klass = cof(it), tag;
  return klass == OBJECT && (tag = it[SYMBOL_TAG]) ? has(buildIn, tag) ? '~' + tag : tag : klass;
}

// Function
var apply = FunctionProto.apply
  , call  = FunctionProto.call
  , REFERENCE_GET;
// Placeholder
core._ = path._ = framework ? path._ || {} : {};
// Partial apply
function part(/* ...args */){
  var length = arguments.length
    , args   = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)holder = true;
  return partial(this, args, length, holder, _, false);
}
// Internal partial application & context binding
function partial(fn, argsPart, lengthPart, holder, _, bind, context){
  assertFunction(fn);
  return function(/* ...args */){
    var that   = bind ? context : this
      , length = arguments.length
      , i = 0, j = 0, args;
    if(!holder && !length)return invoke(fn, argsPart, that);
    args = argsPart.slice();
    if(holder)for(;lengthPart > i; i++)if(args[i] === _)args[i] = arguments[j++];
    while(length > j)args.push(arguments[j++]);
    return invoke(fn, args, that);
  }
}
// Optional / simple context binding
function ctx(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    }
    case 2: return function(a, b){
      return fn.call(that, a, b);
    }
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    }
  } return function(/* ...args */){
      return fn.apply(that, arguments);
  }
}
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
function invoke(fn, args, that){
  var un = that === undefined;
  switch(args.length | 0){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
}

// Object:
var create           = Object.create
  , getPrototypeOf   = Object.getPrototypeOf
  , defineProperty   = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnDescriptor = Object.getOwnPropertyDescriptor
  , getKeys          = Object.keys
  , getNames         = Object.getOwnPropertyNames
  , getSymbols       = Object.getOwnPropertySymbols
  , ownKeys          = function(it){
      return getSymbols ? getNames(it).concat(getSymbols(it)) : getNames(it);
    }
  , has              = ctx(call, ObjectProto[HAS_OWN], 2)
  // Dummy, fix for not array-like ES3 string in es5 module
  , ES5Object        = Object;
// 19.1.2.1 Object.assign(target, source, ...)
var assign = Object.assign || function(target, source){
  var T = Object(target)
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = ES5Object(arguments[i++])
      , keys   = getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
}
function createObjectToArray(isEntries){
  return function(object){
    var O      = ES5Object(object)
      , keys   = getKeys(object)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
    else while(length > i)result[i] = O[keys[i++]];
    return result;
  }
}
function keyOf(object, el){
  var O      = ES5Object(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
}

// Array
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push    = ArrayProto.push
  , unshift = ArrayProto.unshift
  , slice   = ArrayProto.slice
  , splice  = ArrayProto.splice
  , indexOf = ArrayProto.indexOf
  , forEach = ArrayProto[FOR_EACH];
/*
 * 0 -> forEach
 * 1 -> map
 * 2 -> filter
 * 3 -> some
 * 4 -> every
 * 5 -> find
 * 6 -> findIndex
 */
function createArrayMethod(type){
  var isMap       = type == 1
    , isFilter    = type == 2
    , isSome      = type == 3
    , isEvery     = type == 4
    , isFindIndex = type == 6
    , noholes     = type == 5 || isFindIndex;
  return function(callbackfn, that /* = undefined */){
    var f      = ctx(callbackfn, that, 3)
      , O      = Object(this)
      , self   = ES5Object(O)
      , length = toLength(self.length)
      , index  = 0
      , result = isMap ? Array(length) : isFilter ? [] : undefined
      , val, res;
    for(;length > index; index++)if(noholes || index in self){
      val = self[index];
      res = f(val, index, O);
      if(type){
        if(isMap)result[index] = res;             // map
        else if(res)switch(type){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(isEvery)return false;           // every
      }
    }
    return isFindIndex ? -1 : isSome || isEvery ? isEvery : result;
  }
}
function createArrayContains(isContains){
  return function(el, fromIndex /* = 0 */){
    var O      = ES5Object(this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length);
    if(isContains && el != el){
      for(;length > index; index++)if(sameNaN(O[index]))return isContains || index;
    } else for(;length > index; index++)if(isContains || index in O){
      if(O[index] === el)return isContains || index;
    } return !isContains && -1;
  }
}
// Simple reduce to object
function turn(mapfn, target /* = [] */){
  assertFunction(mapfn);
  var memo   = target == undefined ? [] : Object(target)
    , O      = ES5Object(this)
    , length = toLength(O.length)
    , index  = 0;
  for(;length > index; index++){
    if(mapfn(memo, O[index], index, this) === false)break;
  }
  return memo;
}
function generic(A, B){
  // strange IE quirks mode bug -> use typeof vs isFunction
  return typeof A == 'function' ? A : B;
}

// Math
var MAX_SAFE_INTEGER = 0x1fffffffffffff // pow(2, 53) - 1 == 9007199254740991
  , ceil   = Math.ceil
  , floor  = Math.floor
  , max    = Math.max
  , min    = Math.min
  , pow    = Math.pow
  , random = Math.random
  , trunc  = Math.trunc || function(it){
      return (it > 0 ? floor : ceil)(it);
    }
// 7.2.3 SameValue(x, y)
function same(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
}
// 20.1.2.4 Number.isNaN(number)
function sameNaN(number){
  return number != number;
}
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it) ? 0 : trunc(it);
}
// 7.1.15 ToLength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}
function toIndex(index, length){
  var index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
}

function createReplacer(regExp, replace, isStatic){
  var replacer = isObject(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  }
}
function createPointAt(toString){
  return function(pos){
    var s = String(this)
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return toString ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? toString ? s.charAt(i) : a
      : toString ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  }
}

// Assertion & errors
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
function assertFunction(it){
  assert(isFunction(it), it, ' is not a function!');
  return it;
}
function assertObject(it){
  assert(isObject(it), it, ' is not an object!');
  return it;
}
function assertInstance(it, Constructor, name){
  assert(it instanceof Constructor, name, ": use the 'new' operator!");
}

// Property descriptors & Symbol
function descriptor(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  }
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return defineProperty(object, key, descriptor(bitmap, value));
  } : simpleSet;
}
function uid(key){
  return SYMBOL + '(' + key + ')_' + (++sid + random())[TO_STRING](36);
}
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC   = !!function(){try{return defineProperty({}, 0, ObjectProto)}catch(e){}}()
  , sid    = 0
  , hidden = createDefiner(1)
  , symbol = Symbol || uid
  , set    = Symbol ? simpleSet : hidden;

// Iterators
var ITERATOR = 'iterator'
  , SYMBOL_ITERATOR = Symbol && ITERATOR in Symbol
      ? Symbol[ITERATOR] : uid(SYMBOL + DOT + ITERATOR)
  , SYMBOL_TAG = Symbol && TO_STRING_TAG in Symbol
      ? Symbol[TO_STRING_TAG] : uid(SYMBOL + DOT + TO_STRING_TAG)
  , FF_ITERATOR = '@@' + ITERATOR
  , SUPPORT_FF_ITER = FF_ITERATOR in ArrayProto
  , ITER  = symbol('iter')
  , SHIM  = symbol('shim')
  , KEY   = 1
  , VALUE = 2
  , Iterators = {}
  , IteratorPrototype = {}
  , COLLECTION_KEYS;
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, returnThis);
function setIterator(O, value){
  hidden(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  SUPPORT_FF_ITER && hidden(O, FF_ITERATOR, value);
}
function createIterator(Constructor, NAME, next, proto){
  Constructor[PROTOTYPE] = create(proto || IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
}
function defineIterator(Constructor, NAME, value){
  var proto       = Constructor[PROTOTYPE]
    , HAS_FF_ITER = has(proto, FF_ITERATOR);
  var iter = has(proto, SYMBOL_ITERATOR)
    ? proto[SYMBOL_ITERATOR]
    : HAS_FF_ITER
      ? proto[FF_ITERATOR]
      : value;
  if(framework){
    // Define iterator
    setIterator(proto, iter);
    if(iter !== value){
      var iterProto = getPrototypeOf(iter.call(new Constructor));
      // Set @@toStringTag to native iterators
      setToStringTag(iterProto, NAME + ' Iterator', true);
      // FF fix
      HAS_FF_ITER && setIterator(iterProto, returnThis);
    }
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = returnThis;
}
function iterResult(done, value){
  return {value: value, done: !!done};
}
function isIterable(it){
  var O = Object(it);
  return SYMBOL_ITERATOR in O || has(Iterators, classof(O));
}
function getIterator(it){
  return assertObject((it[SYMBOL_ITERATOR] || Iterators[classof(it)]).call(it));
}
function stepCall(fn, value, entries){
  return entries ? invoke(fn, value) : fn(value);
}
function forOf(iterable, entries, fn, that){
  var iterator = getIterator(iterable)
    , f        = ctx(fn, that, entries ? 2 : 1)
    , step;
  while(!(step = iterator.next()).done)if(stepCall(f, step.value, entries) === false)return;
}

// DOM
var html = document && document.documentElement;

// core
var NODE   = cof(process) == PROCESS
  , old    = global.core
  // type bitmap
  , FORCED = 1
  , GLOBAL = 2
  , STATIC = 4
  , PROTO  = 8
  , BIND   = 16
  , WRAP   = 32;
function $define(type, name, source){
  var key, own, out, exp
    , isGlobal = type & GLOBAL
    , target   = isGlobal ? global : (type & STATIC)
        ? global[name] : (global[name] || ObjectProto)[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // there is a similar native
    own = !(type & FORCED) && target && key in target
      && (!isFunction(target[key]) || isNative(target[key]));
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    if(type & BIND && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & WRAP && !framework && target[key] == out){
      exp = function(param){
        return this instanceof out ? new out(param) : out(param);
      }
      exp[PROTOTYPE] = out[PROTOTYPE];
    } else exp = type & PROTO && isFunction(out) ? ctx(call, out) : out;
    // export
    if(exports[key] != out)exports[key] = exp;
    // extend global
    framework && target && !own && (isGlobal || delete target[key]) && hidden(target, key, out);
  }
}
// CommonJS export
if(NODE)module.exports = core;
// RequireJS export
if(isFunction(define) && define.amd)define(function(){return core});
// Export to global object
if(!NODE || framework){
  core.noConflict = function(){
    global.core = old;
    return core;
  }
  global.core = core;
}

/******************************************************************************
 * Module : es5                                                               *
 ******************************************************************************/

// ECMAScript 5 shim
!function(IS_ENUMERABLE, Empty, _classof, $PROTO){  
  if(!DESC){
    getOwnDescriptor = function(O, P){
      if(has(O, P))return descriptor(!ObjectProto[IS_ENUMERABLE].call(O, P), O[P]);
    };
    defineProperty = function(O, P, Attributes){
      if('value' in Attributes)assertObject(O)[P] = Attributes.value;
      return O;
    };
    defineProperties = function(O, Properties){
      assertObject(O);
      var keys   = getKeys(Properties)
        , length = keys.length
        , i = 0
        , P, Attributes;
      while(length > i){
        P          = keys[i++];
        Attributes = Properties[P];
        if('value' in Attributes)O[P] = Attributes.value;
      }
      return O;
    };
  }
  $define(STATIC + FORCED * !DESC, OBJECT, {
    // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: getOwnDescriptor,
    // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
    defineProperty: defineProperty,
    // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties) 
    defineProperties: defineProperties
  });
  
    // IE 8- don't enum bug keys
  var keys1 = [CONSTRUCTOR, HAS_OWN, 'isPrototypeOf', IS_ENUMERABLE, TO_LOCALE, TO_STRING, 'valueOf']
    // Additional keys for getOwnPropertyNames
    , keys2 = keys1.concat('length', PROTOTYPE)
    , keysLen1 = keys1.length;
  
  // Create object with `null` prototype: use iframe Object with cleared prototype
  function createDict(){
    // Thrash, waste and sodomy: IE GC bug
    var iframe = document[CREATE_ELEMENT]('iframe')
      , i      = keysLen1
      , iframeDocument;
    iframe.style.display = 'none';
    html.appendChild(iframe);
    iframe.src = 'javascript:';
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write('<script>document.F=Object</script>');
    iframeDocument.close();
    createDict = iframeDocument.F;
    while(i--)delete createDict[PROTOTYPE][keys1[i]];
    return createDict();
  }
  function createGetKeys(names, length, isNames){
    return function(object){
      var O      = ES5Object(object)
        , i      = 0
        , result = []
        , key;
      for(key in O)if(key != $PROTO)has(O, key) && result.push(key);
      // Don't enum bug & hidden keys
      while(length > i)if(has(O, key = names[i++])){
        ~indexOf.call(result, key) || result.push(key);
      }
      return result;
    }
  }
  $define(STATIC, OBJECT, {
    // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
    getPrototypeOf: getPrototypeOf = getPrototypeOf || function(O){
      if(has(assertObject(O), $PROTO))return O[$PROTO];
      if(isFunction(O[CONSTRUCTOR]) && O instanceof O[CONSTRUCTOR]){
        return O[CONSTRUCTOR][PROTOTYPE];
      } return O instanceof Object ? ObjectProto : null;
    },
    // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: getNames = getNames || createGetKeys(keys2, keys2.length, true),
    // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
    create: create = create || function(O, /*?*/Properties){
      var result
      if(O !== null){
        Empty[PROTOTYPE] = assertObject(O);
        result = new Empty();
        Empty[PROTOTYPE] = null;
        // add "__proto__" for Object.getPrototypeOf shim
        result[CONSTRUCTOR][PROTOTYPE] === O || (result[$PROTO] = O);
      } else result = createDict();
      return Properties === undefined ? result : defineProperties(result, Properties);
    },
    // 19.1.2.14 / 15.2.3.14 Object.keys(O)
    keys: getKeys = getKeys || createGetKeys(keys1, keysLen1, false)
  });
  
  // 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
  $define(PROTO, FUNCTION, {
    bind: function(that /*, args... */){
      var fn       = assertFunction(this)
        , partArgs = slice.call(arguments, 1);
      function bound(/* args... */){
        var args = partArgs.concat(slice.call(arguments));
        if(this instanceof bound){
          var instance = create(fn[PROTOTYPE])
            , result   = invoke(fn, args, instance);
          return isObject(result) ? result : instance;
        } return invoke(fn, args, that);
      }
      return bound;
    }
  });
  
  // Fix for not array-like ES3 string
  function arrayMethodFix(fn){
    return function(){
      return fn.apply(ES5Object(this), arguments);
    }
  }
  if(!(0 in Object(DOT) && DOT[0] == DOT)){
    ES5Object = function(it){
      return cof(it) == STRING ? it.split('') : Object(it);
    }
    slice = arrayMethodFix(slice);
  }
  $define(PROTO + FORCED * (ES5Object != Object), ARRAY, {
    slice: slice,
    join: arrayMethodFix(ArrayProto.join)
  });
  
  // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
  $define(STATIC, ARRAY, {
    isArray: function(arg){
      return cof(arg) == ARRAY
    }
  });
  function createArrayReduce(isRight){
    return function(callbackfn, memo){
      assertFunction(callbackfn);
      var O      = ES5Object(this)
        , length = toLength(O.length)
        , index  = isRight ? length - 1 : 0
        , i      = isRight ? -1 : 1;
      if(2 > arguments.length)for(;;){
        if(index in O){
          memo = O[index];
          index += i;
          break;
        }
        index += i;
        assert(isRight ? index >= 0 : length > index, REDUCE_ERROR);
      }
      for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
        memo = callbackfn(memo, O[index], index, this);
      }
      return memo;
    }
  }
  $define(PROTO, ARRAY, {
    // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
    forEach: forEach = forEach || createArrayMethod(0),
    // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
    map: createArrayMethod(1),
    // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
    filter: createArrayMethod(2),
    // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
    some: createArrayMethod(3),
    // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
    every: createArrayMethod(4),
    // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
    reduce: createArrayReduce(false),
    // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
    reduceRight: createArrayReduce(true),
    // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
    indexOf: indexOf = indexOf || createArrayContains(false),
    // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
    lastIndexOf: function(el, fromIndex /* = @[*-1] */){
      var O      = ES5Object(this)
        , length = toLength(O.length)
        , index  = length - 1;
      if(arguments.length > 1)index = min(index, toInteger(fromIndex));
      if(index < 0)index = toLength(length + index);
      for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
      return -1;
    }
  });
  
  // 21.1.3.25 / 15.5.4.20 String.prototype.trim()
  $define(PROTO, STRING, {trim: createReplacer(/^\s*([\s\S]*\S)?\s*$/, '$1')});
  
  // 20.3.3.1 / 15.9.4.4 Date.now()
  $define(STATIC, DATE, {now: function(){
    return +new Date;
  }});
  
  if(_classof(function(){return arguments}()) == OBJECT)classof = function(it){
    var cof = _classof(it);
    return cof == OBJECT && isFunction(it.callee) ? ARGUMENTS : cof;
  }
}('propertyIsEnumerable', Function(), classof, symbol(PROTOTYPE));

/******************************************************************************
 * Module : global                                                            *
 ******************************************************************************/

$define(GLOBAL + FORCED, {global: global});

/******************************************************************************
 * Module : es6_symbol                                                        *
 ******************************************************************************/

// ECMAScript 6 symbols shim
!function(TAG, SymbolRegistry){
  // 19.4.1.1 Symbol([description])
  if(!isNative(Symbol)){
    Symbol = function(description){
      assert(!(this instanceof Symbol), SYMBOL + ' is not a ' + CONSTRUCTOR);
      var tag = uid(description);
      defineProperty(ObjectProto, tag, {
        configurable: true,
        set: function(value){
          hidden(this, tag, value);
        }
      });
      return set(create(Symbol[PROTOTYPE]), TAG, tag);
    }
    hidden(Symbol[PROTOTYPE], TO_STRING, function(){
      return this[TAG];
    });
  }
  $define(GLOBAL + WRAP, {Symbol: Symbol});
  $define(STATIC, SYMBOL, {
    // 19.4.2.2 Symbol.for(key)
    'for': function(key){
      return has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = Symbol(key);
    },
    // 19.4.2.6 Symbol.iterator
    iterator: SYMBOL_ITERATOR,
    // 19.4.2.7 Symbol.keyFor(sym)
    keyFor: part.call(keyOf, SymbolRegistry),
    // 19.4.2.10 Symbol.toStringTag
    toStringTag: SYMBOL_TAG = TO_STRING_TAG in Symbol
      ? Symbol[TO_STRING_TAG]
      : Symbol(SYMBOL + DOT + TO_STRING_TAG),
    pure: symbol,
    set: set
  });
  setToStringTag(Symbol, SYMBOL);
  // 26.1.11 Reflect.ownKeys (target)
  $define(GLOBAL, {Reflect: {ownKeys: ownKeys}});
}(symbol('tag'), {});

/******************************************************************************
 * Module : es6                                                               *
 ******************************************************************************/

// ECMAScript 6 shim
!function(isFinite, tmp){
  $define(STATIC, OBJECT, {
    // 19.1.3.1 Object.assign(target, source)
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: same
  });
  // 19.1.3.19 Object.setPrototypeOf(O, proto)
  // Works with __proto__ only. Old v8 can't works with null proto objects.
  '__proto__' in ObjectProto && function(buggy, set){
    try {
      set = ctx(call, getOwnDescriptor(ObjectProto, '__proto__').set, 2);
      set({}, ArrayProto);
    } catch(e){ buggy = true }
    $define(STATIC, OBJECT, {
      setPrototypeOf: function(O, proto){
        assertObject(O);
        assert(proto === null || isObject(proto), proto, ": can't set as prototype!");
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      }
    });
  }();
  
      // 20.1.2.3 Number.isInteger(number)
  var isInteger = Number.isInteger || function(it){
        return isFinite(it) && floor(it) === it;
      }
      // 20.2.2.28 Math.sign(x)
    , sign = Math.sign || function sign(it){
        return (it = +it) == 0 || it != it ? it : it < 0 ? -1 : 1;
      }
    , abs  = Math.abs
    , exp  = Math.exp
    , log  = Math.log
    , sqrt = Math.sqrt
    , fcc  = String.fromCharCode;
  // 20.2.2.5 Math.asinh(x)
  function asinh(x){
    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
  }
  $define(STATIC, NUMBER, {
    // 20.1.2.1 Number.EPSILON
    EPSILON: pow(2, -52),
    // 20.1.2.2 Number.isFinite(number)
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    // 20.1.2.3 Number.isInteger(number)
    isInteger: isInteger,
    // 20.1.2.4 Number.isNaN(number)
    isNaN: sameNaN,
    // 20.1.2.5 Number.isSafeInteger(number)
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    // 20.1.2.10 Number.MIN_SAFE_INTEGER
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    // 20.1.2.12 Number.parseFloat(string)
    parseFloat: parseFloat,
    // 20.1.2.13 Number.parseInt(string, radix)
    parseInt: parseInt
  });
  $define(STATIC, MATH, {
    // 20.2.2.3 Math.acosh(x)
    acosh: function(x){
      return log(x + sqrt(x * x - 1));
    },
    // 20.2.2.5 Math.asinh(x)
    asinh: asinh,
    // 20.2.2.7 Math.atanh(x)
    atanh: function(x){
      return x == 0 ? +x : log((1 + +x) / (1 - x)) / 2;
    },
    // 20.2.2.9 Math.cbrt(x)
    cbrt: function(x){
      return sign(x) * pow(abs(x), 1 / 3);
    },
    // 20.2.2.11 Math.clz32 (x)
    clz32: function(x){
      return (x >>>= 0) ? 32 - x[TO_STRING](2).length : 32;
    },
    // 20.2.2.12 Math.cosh(x)
    cosh: function(x){
      return (exp(x) + exp(-x)) / 2;
    },
    // 20.2.2.14 Math.expm1(x)
    expm1: function(x){
      return x == 0 ? +x : x > -1e-6 && x < 1e-6 ? +x + x * x / 2 : exp(x) - 1;
    },
    // 20.2.2.16 Math.fround(x)
    // TODO
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
    hypot: function(value1, value2){
      var sum    = 0
        , length = arguments.length
        , value;
      while(length--){
        value = +arguments[length];
        if(value == Infinity || value == -Infinity)return Infinity;
        sum += value * value;
      }
      return sqrt(sum);
    },
    // 20.2.2.18 Math.imul(x, y)
    imul: function(x, y){
      var UInt16 = 0xffff
        , xl = UInt16 & x
        , yl = UInt16 & y;
      return 0 | xl * yl + ((UInt16 & x >>> 16) * yl + xl * (UInt16 & y >>> 16) << 16 >>> 0);
    },
    // 20.2.2.20 Math.log1p(x)
    log1p: function(x){
      return x > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + +x);
    },
    // 20.2.2.21 Math.log10(x)
    log10: function(x){
      return log(x) / Math.LN10;
    },
    // 20.2.2.22 Math.log2(x)
    log2: function(x){
      return log(x) / Math.LN2;
    },
    // 20.2.2.28 Math.sign(x)
    sign: sign,
    // 20.2.2.30 Math.sinh(x)
    sinh: function(x){
      return x == 0 ? +x : (exp(x) - exp(-x)) / 2;
    },
    // 20.2.2.33 Math.tanh(x)
    tanh: function(x){
      return isFinite(x) ? x == 0 ? +x : (exp(x) - exp(-x)) / (exp(x) + exp(-x)) : sign(x);
    },
    // 20.2.2.34 Math.trunc(x)
    trunc: trunc
  });
  // 20.2.1.9 Math[@@toStringTag]
  setToStringTag(Math, MATH, true);
  
  $define(STATIC, STRING, {
    // 21.1.2.2 String.fromCodePoint(...codePoints)
    fromCodePoint: function(){
      for(var r = [], i = 0, l = arguments.length, c; i < l; i++){
        c = +arguments[i];
        if(toIndex(c, 0x10ffff) !== c)throw RangeError();
        r.push(c < 0x10000 ? fcc(c) : fcc(((c -= 0x10000) >> 10) + 0xd800) + fcc(c % 0x400 + 0xdc00));
      } return r.join('');
    }
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  // TODO
  });
  function includes(searchString, position /* = 0 */){
    return !!~String(this).indexOf(searchString, position);
  }
  $define(PROTO, STRING, {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    codePointAt: createPointAt(false),
    // String.prototype.includes(searchString, position = 0)
    includes: includes,
    // 21.1.3.7 String.prototype.endsWith(searchString [, endPosition])
    endsWith: function(searchString, endPosition /* = @length */){
      var length = this.length
        , end    = endPosition === undefined ? length : min(toLength(endPosition), length);
      searchString += '';
      return String(this).slice(end - searchString.length, end) === searchString;
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      var str    = String(this)
        , result = ''
        , n      = toInteger(count);
      if(0 > n)throw RangeError("Count can't be negative");
      for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)result += str;
      return result;
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString, position /* = 0 */){
      var index = toLength(min(position, this.length));
      searchString += '';
      return String(this).slice(index, index + searchString.length) === searchString;
    }
  });
  $define(STATIC, ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike, mapfn /* -> it */, that /* = undefind */){
      var O       = Object(arrayLike)
        , result  = new (generic(this, Array))
        , mapping = mapfn !== undefined
        , f       = mapping ? ctx(mapfn, that, 2) : undefined
        , index   = 0
        , length;
      if(isIterable(O))for(var iter = getIterator(O), step; !(step = iter.next()).done; index++){
        result[index] = mapping ? f(step.value, index) : step.value;
      } else for(length = toLength(O.length); length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
      result.length = index;
      return result;
    },
    // 22.1.2.3 Array.of( ...items)
    of: function(/* ...args */){
      var index  = 0
        , length = arguments.length
        , result = new (generic(this, Array))(length);
      while(length > index)result[index] = arguments[index++];
      result.length = length;
      return result;
    }
  });
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    copyWithin: function(target /* = 0 */, start /* = 0 */, end /* = @length */){
      var O     = Object(this)
        , len   = toLength(O.length)
        , to    = toIndex(target, len)
        , from  = toIndex(start, len)
        , fin   = end === undefined ? len : toIndex(end, len)
        , count = min(fin - from, len - to), inc = 1;
      if(from < to && to < from + count){
        inc  = -1;
        from = from + count - 1;
        to   = to + count - 1;
      }
      while(count-- > 0){
        if(from in O)O[to] = O[from];
        else delete O[to];
        to += inc;
        from += inc;
      } return O;
    },
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value, start /* = 0 */, end /* = @length */){
      var O      = Object(this)
        , length = toLength(O.length)
        , index  = toIndex(start, length)
        , endPos = end === undefined ? length : toIndex(end, length);
      while(endPos > index)O[index++] = value;
      return O;
    },
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
    find: createArrayMethod(5),
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: createArrayMethod(6)
  });
  // 24.3.3 JSON[@@toStringTag]
  setToStringTag(global.JSON, 'JSON', true);
  
  // 19.1.3.6 Object.prototype.toString()
  if(framework){
    tmp[SYMBOL_TAG] = 'x';
    if(cof(tmp) != 'x')hidden(ObjectProto, TO_STRING, function(){
      return '[object ' + classof(this) + ']';
    });
  }
}(isFinite, {});

/******************************************************************************
 * Module : immediate                                                         *
 ******************************************************************************/

// setImmediate shim
// Node.js 0.9+ & IE10+ has setImmediate, else:
isFunction(setImmediate) && isFunction(clearImmediate) || function(ONREADYSTATECHANGE){
  var postMessage      = global.postMessage
    , addEventListener = global.addEventListener
    , MessageChannel   = global.MessageChannel
    , counter          = 0
    , queue            = {}
    , defer, channel, port;
  setImmediate = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    }
    defer(counter);
    return counter;
  }
  clearImmediate = function(id){
    delete queue[id];
  }
  function run(id){
    if(has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event){
    run(event.data);
  }
  // Node.js 0.8-
  if(NODE){
    defer = function(id){
      nextTick(part.call(run, id));
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]('script')){
    defer = function(id){
      html.appendChild(document[CREATE_ELEMENT]('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run(id);
      }
    }
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(part.call(run, id), 0);
    }
  }
}('onreadystatechange');
$define(GLOBAL + BIND, {
  setImmediate:   setImmediate,
  clearImmediate: clearImmediate
});

/******************************************************************************
 * Module : es6_promise                                                       *
 ******************************************************************************/

// ES6 promises shim
// Based on https://github.com/getify/native-promise-only/
!function(Promise, test){
  isFunction(Promise) && isFunction(Promise.resolve)
  && Promise.resolve(test = new Promise(Function())) == test
  || function(asap, DEF){
    function isThenable(o){
      var then;
      if(isObject(o))then = o.then;
      return isFunction(then) ? then : false;
    }
    function notify(def){
      var chain = def.chain;
      chain.length && asap(function(){
        var msg = def.msg
          , ok  = def.state == 1
          , i   = 0;
        while(chain.length > i)!function(react){
          var cb = ok ? react.ok : react.fail
            , ret, then;
          try {
            if(cb){
              ret = cb === true ? msg : cb(msg);
              if(ret === react.P){
                react.rej(TypeError(PROMISE + '-chain cycle'));
              } else if(then = isThenable(ret)){
                then.call(ret, react.res, react.rej);
              } else react.res(ret);
            } else react.rej(msg);
          } catch(err){
            react.rej(err);
          }
        }(chain[i++]);
        chain.length = 0;
      });
    }
    function resolve(msg){
      var def = this
        , then, wrapper;
      if(def.done)return;
      def.done = true;
      def = def.def || def; // unwrap
      try {
        if(then = isThenable(msg)){
          wrapper = {def: def, done: false}; // wrap
          then.call(msg, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
        } else {
          def.msg = msg;
          def.state = 1;
          notify(def);
        }
      } catch(err){
        reject.call(wrapper || {def: def, done: false}, err); // wrap
      }
    }
    function reject(msg){
      var def = this;
      if(def.done)return;
      def.done = true;
      def = def.def || def; // unwrap
      def.msg = msg;
      def.state = 2;
      notify(def);
    }
    // 25.4.3.1 Promise(executor)
    Promise = function(executor){
      assertFunction(executor);
      assertInstance(this, Promise, PROMISE);
      var def = {chain: [], state: 0, done: false, msg: undefined};
      hidden(this, DEF, def);
      try {
        executor(ctx(resolve, def, 1), ctx(reject, def, 1));
      } catch(err){
        reject.call(def, err);
      }
    }
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    hidden(Promise[PROTOTYPE], 'then', function(onFulfilled, onRejected){
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      } , P = react.P = new this[CONSTRUCTOR](function(resolve, reject){
        react.res = assertFunction(resolve);
        react.rej = assertFunction(reject);
      }), def = this[DEF];
      def.chain.push(react);
      def.state && notify(def);
      return P;
    });
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    hidden(Promise[PROTOTYPE], 'catch', function(onRejected){
      return this.then(undefined, onRejected);
    });
    // 25.4.4.1 Promise.all(iterable)
    hidden(Promise, 'all', function(iterable){
      var Promise = this
        , values  = [];
      return new Promise(function(resolve, reject){
        forOf(iterable, false, push, values);
        var remaining = values.length
          , results   = Array(remaining);
        if(remaining)forEach.call(values, function(promise, index){
          Promise.resolve(promise).then(function(value){
            results[index] = value;
            --remaining || resolve(results);
          }, reject);
        });
        else resolve(results);
      });
    });
    // 25.4.4.4 Promise.race(iterable)
    hidden(Promise, 'race', function(iterable){
      var Promise = this;
      return new Promise(function(resolve, reject){
        forOf(iterable, false, function(promise){
          Promise.resolve(promise).then(resolve, reject);
        });
      });
    });
    // 25.4.4.5 Promise.reject(r)
    hidden(Promise, 'reject', function(r){
      return new this(function(resolve, reject){
        reject(r);
      });
    });
    // 25.4.4.6 Promise.resolve(x)
    hidden(Promise, 'resolve', function(x){
      return isObject(x) && getPrototypeOf(x) === this[PROTOTYPE]
        ? x : new this(function(resolve, reject){
          resolve(x);
        });
    });
  }(nextTick || setImmediate, symbol('def'));
  setToStringTag(Promise, PROMISE);
  $define(GLOBAL + FORCED * !isNative(Promise), {Promise: Promise});
}(global[PROMISE]);

/******************************************************************************
 * Module : es6_collections                                                   *
 ******************************************************************************/

// ECMAScript 6 collections shim
!function(){
  var KEYS     = COLLECTION_KEYS = symbol('keys')
    , VALUES   = symbol('values')
    , STOREID  = symbol('storeId')
    , WEAKDATA = symbol('weakData')
    , WEAKID   = symbol('weakId')
    , SIZE     = DESC ? symbol('size') : 'size'
    , uid      = 0
    , wid      = 0;
  
  function getCollection(C, NAME, methods, commonMethods, isMap, isWeak){
    var ADDER_KEY = isMap ? 'set' : 'add'
      , init      = commonMethods.clear
      , O         = {};
    function initFromIterable(that, iterable){
      if(iterable != undefined)forOf(iterable, isMap, that[ADDER_KEY], that);
      return that;
    }
    if(!(isNative(C) && (isWeak || has(C[PROTOTYPE], FOR_EACH)))){
      // create collection constructor
      C = function(iterable){
        assertInstance(this, C, NAME);
        isWeak ? hidden(this, WEAKID, wid++) : init.call(this);
        initFromIterable(this, iterable);
      }
      set(C, SHIM, true);
      assign(C[PROTOTYPE], methods, commonMethods);
      isWeak || defineProperty(C[PROTOTYPE], 'size', {get: function(){
        return this[SIZE];
      }});
    } else {
      var Native     = C
        , collection = new C
        , adder      = collection[ADDER_KEY]
        , buggyChaining, buggyZero;
      // wrap to init collections from iterable
      if(!(SYMBOL_ITERATOR in ArrayProto && C.length)){
        C = function(iterable){
          assertInstance(this, C, NAME);
          return initFromIterable(new Native, iterable);
        }
        C[PROTOTYPE] = Native[PROTOTYPE];
      }
      buggyChaining = collection[ADDER_KEY](isWeak ? {} : -0, 1) !== collection;
      isWeak || collection.forEach(function(val, key){
        if(same(key, -0))buggyZero = true;
      });
      // fix .add & .set for chaining & converting -0 key to +0
      if(framework && (buggyChaining || buggyZero)){
        hidden(C[PROTOTYPE], ADDER_KEY, function(a, b){
          adder.call(this, same(a, -0) ? 0 : a, b);
          return this;
        });
      }
    }
    setToStringTag(C, NAME);
    O[NAME] = C;
    $define(GLOBAL + WRAP + FORCED * !isNative(C), O);
    return C;
  }
  
  function fastKey(it, create){
    // return it with 'S' prefix if it's string or with 'P' prefix for over primitives
    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
    // if it hasn't object id - add next
    if(!has(it, STOREID)){
      if(create)hidden(it, STOREID, ++uid);
      else return '';
    }
    // return object id with 'O' prefix
    return 'O' + it[STOREID];
  }

  function collectionMethods($VALUES){
    return {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function(){
        hidden(this, SIZE, 0);
        hidden(this, KEYS, create(null));
        if($VALUES == VALUES)hidden(this, VALUES, create(null));
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var index    = fastKey(key)
          , keys     = this[KEYS]
          , contains = index in keys;
        if(contains){
          delete keys[index];
          if($VALUES == VALUES)delete this[VALUES][index];
          this[SIZE]--;
        }
        return contains;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function(callbackfn, that /* = undefined */){
        var f      = ctx(callbackfn, that, 3)
          , values = this[$VALUES]
          , keys   = this[KEYS]
          , done   = {}
          , k, index;
        do {
          for(index in keys){
            if(index in done)continue;
            done[index] = true;
            f(values[index], keys[index], this);
          }
        } while(index != undefined && index != (k = getKeys(keys))[k.length - 1]);
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function(key){
        return fastKey(key) in this[KEYS];
      }
    }
  }
  
  // 23.1 Map Objects
  Map = getCollection(Map, MAP, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function(key){
      return this[VALUES][fastKey(key)];
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function(key, value){
      var index  = fastKey(key, true)
        , values = this[VALUES];
      if(!(index in values)){
        this[KEYS][index] = same(key, -0) ? 0 : key;
        this[SIZE]++;
      }
      values[index] = value;
      return this;
    }
  }, collectionMethods(VALUES), true);
  
  // 23.2 Set Objects
  Set = getCollection(Set, SET, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function(value){
      var index  = fastKey(value, true)
        , values = this[KEYS];
      if(!(index in values)){
        values[index] = same(value, -0) ? 0 : value;
        this[SIZE]++;
      }
      return this;
    }
  }, collectionMethods(KEYS));
  
  function getWeakData(it){
    has(it, WEAKDATA) || hidden(it, WEAKDATA, {});
    return it[WEAKDATA];
  }
  function weakCollectionHas(key){
    return isObject(key) && has(key, WEAKDATA) && has(key[WEAKDATA], this[WEAKID]);
  }
  var weakCollectionMethods = {
    // 23.3.3.3 WeakMap.prototype.delete(key)
    // 23.4.3.4 WeakSet.prototype.delete(value)
    'delete': function(key){
      return weakCollectionHas.call(this, key) && delete key[WEAKDATA][this[WEAKID]];
    },
    // 23.3.3.5 WeakMap.prototype.has(key)
    // 23.4.3.5 WeakSet.prototype.has(value)
    has: weakCollectionHas
  };
  
  // 23.3 WeakMap Objects
  WeakMap = getCollection(WeakMap, WEAKMAP, {
    // 23.3.3.4 WeakMap.prototype.get(key)
    get: function(key){
      if(isObject(key) && has(key, WEAKDATA))return key[WEAKDATA][this[WEAKID]];
    },
    // 23.3.3.6 WeakMap.prototype.set(key, value)
    set: function(key, value){
      getWeakData(assertObject(key))[this[WEAKID]] = value;
      return this;
    }
  }, weakCollectionMethods, true, true);
  
  // 23.4 WeakSet Objects
  WeakSet = getCollection(WeakSet, WEAKSET, {
    // 23.4.3.1 WeakSet.prototype.add(value)
    add: function(value){
      getWeakData(assertObject(value))[this[WEAKID]] = true;
      return this;
    }
  }, weakCollectionMethods, false, true);
}();

/******************************************************************************
 * Module : es7                                                               *
 ******************************************************************************/

!function(){
  $define(PROTO, ARRAY, {
    // https://github.com/domenic/Array.prototype.includes
    includes: createArrayContains(true)
  });
  $define(PROTO, STRING, {
    // https://github.com/mathiasbynens/String.prototype.at
    at: createPointAt(true)
  });
  $define(STATIC, OBJECT, {
    // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues
    values: createObjectToArray(false),
    entries: createObjectToArray(true)
  });
  $define(STATIC, REGEXP, {
    // https://gist.github.com/kangax/9698100
    escape: createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
  });
}();

/******************************************************************************
 * Module : es7_refs                                                          *
 ******************************************************************************/

// https://github.com/zenparsing/es-abstract-refs
!function(REFERENCE){
  REFERENCE_GET = Symbol(SYMBOL+DOT+REFERENCE+'Get');
  var REFERENCE_SET = Symbol(SYMBOL+DOT+REFERENCE+SET)
    , REFERENCE_DELETE = Symbol(SYMBOL+DOT+REFERENCE+'Delete');
  
  $define(STATIC, SYMBOL, {
    referenceGet: REFERENCE_GET,
    referenceSet: REFERENCE_SET,
    referenceDelete: REFERENCE_DELETE
  });
  
  hidden(FunctionProto, REFERENCE_GET, returnThis);
  
  function setMapMethods(Constructor){
    if(Constructor){
      var MapProto = Constructor[PROTOTYPE];
      hidden(MapProto, REFERENCE_GET, MapProto.get);
      hidden(MapProto, REFERENCE_SET, MapProto.set);
      hidden(MapProto, REFERENCE_DELETE, MapProto['delete']);
    }
  }
  setMapMethods(Map);
  setMapMethods(WeakMap);
}('reference');

/******************************************************************************
 * Module : es6_iterators                                                     *
 ******************************************************************************/

// ECMAScript 6 iterators shim
!function(){
  var getValues = createObjectToArray(false)
    // Safari define byggy iterators w/o `next`
    , buggy = 'keys' in ArrayProto && !('next' in [].keys())
    , at = createPointAt(true);
  
  function defineStdIterators(Base, NAME, Constructor, next, DEFAULT){
    function createIter(kind){
      return function(){
        return new Constructor(this, kind);
      }
    }
    // 21.1.5.2.2 %StringIteratorPrototype%[@@toStringTag]
    // 22.1.5.2.3 %ArrayIteratorPrototype%[@@toStringTag]
    // 23.1.5.2.3 %MapIteratorPrototype%[@@toStringTag]
    // 23.2.5.2.3 %SetIteratorPrototype%[@@toStringTag]
    createIterator(Constructor, NAME, next);
    DEFAULT && $define(PROTO + FORCED * buggy, NAME, {
      // 22.1.3.4 Array.prototype.entries()
      // 23.1.3.4 Map.prototype.entries()
      // 23.2.3.5 Set.prototype.entries()
      entries: createIter(KEY+VALUE),
      // 22.1.3.13 Array.prototype.keys()
      // 23.1.3.8 Map.prototype.keys()
      // 23.2.3.8 Set.prototype.keys()
      keys:    createIter(KEY),
      // 22.1.3.29 Array.prototype.values()
      // 23.1.3.11 Map.prototype.values()
      // 23.2.3.10 Set.prototype.values()
      values:  createIter(VALUE)
    });
    // 21.1.3.27 String.prototype[@@iterator]()
    // 22.1.3.30 Array.prototype[@@iterator]()
    // 23.1.3.12 Map.prototype[@@iterator]()
    // 23.2.3.11 Set.prototype[@@iterator]()
    Base && defineIterator(Base, NAME, createIter(DEFAULT));
  }
  
  // 21.1.5.1 CreateStringIterator Abstract Operation
  defineStdIterators(String, STRING, function(iterated){
    set(this, ITER, {o: String(iterated), i: 0});
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function(){
    var iter     = this[ITER]
      , iterated = iter.o
      , index    = iter.i
      , point;
    if(index >= iterated.length)return iterResult(1);
    point = at.call(iterated, index);
    iter.i += point.length;
    return iterResult(0, point);
  });
  
  // 22.1.5.1 CreateArrayIterator Abstract Operation
  defineStdIterators(Array, ARRAY, function(iterated, kind){
    set(this, ITER, {o: ES5Object(iterated), i: 0, k: kind});
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function(){
    var iter     = this[ITER]
      , iterated = iter.o
      , index    = iter.i++
      , kind     = iter.k
      , value;
    if(index >= iterated.length)return iterResult(1);
    if(kind == KEY)       value = index;
    else if(kind == VALUE)value = iterated[index];
    else                  value = [index, iterated[index]];
    return iterResult(0, value);
  }, VALUE);
  
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
    
  // 23.1.5.1 CreateMapIterator Abstract Operation
  defineStdIterators(Map, MAP, function(iterated, kind){
    var keys;
    if(Map[SHIM])keys = getValues(iterated[COLLECTION_KEYS]);
    else Map[PROTOTYPE][FOR_EACH].call(iterated, function(val, key){
      this.push(key);
    }, keys = []);
    set(this, ITER, {o: iterated, k: kind, a: keys, i: 0});
  // 23.1.5.2.1 %MapIteratorPrototype%.next()
  }, function(){
    var iter     = this[ITER]
      , iterated = iter.o
      , keys     = iter.a
      , index    = iter.i++
      , kind     = iter.k
      , key, value;
    if(index >= keys.length)return iterResult(1);
    key = keys[index];
    if(kind == KEY)       value = key;
    else if(kind == VALUE)value = iterated.get(key);
    else                  value = [key, iterated.get(key)];
    return iterResult(0, value);
  }, KEY+VALUE);
  
  // 23.2.5.1 CreateSetIterator Abstract Operation
  defineStdIterators(Set, SET, function(iterated, kind){
    var keys;
    if(Set[SHIM])keys = getValues(iterated[COLLECTION_KEYS]);
    else Set[PROTOTYPE][FOR_EACH].call(iterated, function(val){
      this.push(val);
    }, keys = []);
    set(this, ITER, {k: kind, a: keys.reverse(), l: keys.length});
  // 23.2.5.2.1 %SetIteratorPrototype%.next()
  }, function(){
    var iter = this[ITER]
      , keys = iter.a
      , key;
    if(!keys.length)return iterResult(1);
    key = keys.pop();
    return iterResult(0, iter.k == KEY+VALUE ? [key, key] : key);
  }, VALUE);
}();

/******************************************************************************
 * Module : timers                                                            *
 ******************************************************************************/

// ie9- setTimeout & setInterval additional parameters fix
!function(MSIE){
  function wrap(set){
    return MSIE ? function(fn, time /*, ...args */){
      return set(invoke(part, slice.call(arguments, 2), isFunction(fn) ? fn : Function(fn)), time);
    } : set;
  }
  $define(GLOBAL + BIND + FORCED * MSIE, {
    setTimeout: setTimeout = wrap(setTimeout),
    setInterval: wrap(setInterval)
  });
  // ie9- dirty check
}(!!navigator && /MSIE .\./.test(navigator.userAgent));

/******************************************************************************
 * Module : array_statics                                                     *
 ******************************************************************************/

// JavaScript 1.6 / Strawman array statics shim
!function(){
  function setArrayStatics(keys, length){
    $define(STATIC, ARRAY, turn.call(
      array(keys),
      function(memo, key){
        if(key in ArrayProto)memo[key] = ctx(call, ArrayProto[key], length);
      }, {}
    ));
  }
  setArrayStatics('pop,reverse,shift,keys,values,entries', 1);
  setArrayStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
  setArrayStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
                  'reduce,reduceRight,copyWithin,fill,turn');
}();

/******************************************************************************
 * Module : console                                                           *
 ******************************************************************************/

!function(console){
  var $console = turn.call(
    /**
     * Methods from:
     * https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
     * https://developer.mozilla.org/en-US/docs/Web/API/console
     */
    array('assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,' +
      'groupEnd,info,isIndependentlyComposed,log,markTimeline,profile,profileEnd,' +
      'table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn'),
    function(memo, key){
      var fn = console[key];
      memo[key] = function(){
        if(enabled && fn)return apply.call(fn, console, arguments);
      };
    },
    {
      enable: function(){
        enabled = true;
      },
      disable: function(){
        enabled = false;
      }
    }
  ), enabled = true;
  try {
    framework && delete global.console;
  } catch(e){}
  $define(GLOBAL + FORCED, {console: assign($console.log, $console)});
}(global.console || {});
}(Function('return this'), true);