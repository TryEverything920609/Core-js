# core-js

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/zloirock/core-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![version](https://img.shields.io/npm/v/core-js.svg)](https://www.npmjs.com/package/core-js) [![npm downloads](https://img.shields.io/npm/dm/core-js.svg)](http://npm-stat.com/charts.html?package=core-js&author=&from=2014-11-18) [![Build Status](https://travis-ci.org/zloirock/core-js.svg)](https://travis-ci.org/zloirock/core-js) [![devDependency status](https://david-dm.org/zloirock/core-js/dev-status.svg)](https://david-dm.org/zloirock/core-js?type=dev)
#### As advertising: the author is looking for a good job :)

Modular standard library for JavaScript. Includes polyfills for [ECMAScript 5, 2015, 2016, 2017](#ecmascript): [promises](#ecmascript-promise), [symbols](#ecmascript-symbol), [collections](#ecmascript-collections), iterators, [typed arrays](#ecmascript-typed-arrays), many other features, [ECMAScript proposals](#ecmascript-proposals), [setImmediate](#setimmediate), etc. You can require only needed features or use it without global namespace pollution.

[*Example*](http://goo.gl/a2xexl):
```js
Array.from(new Set([1, 2, 3, 2, 1]));          // => [1, 2, 3]
'*'.repeat(10);                                // => '**********'
Promise.resolve(32).then(x => console.log(x)); // => 32
setImmediate(x => console.log(x), 42);         // => 42
```

[*Without global namespace pollution*](http://goo.gl/paOHb0):
```js
var core = require('core-js/library'); // With a modular system, otherwise use global `core`
core.Array.from(new core.Set([1, 2, 3, 2, 1]));     // => [1, 2, 3]
core.String.repeat('*', 10);                        // => '**********'
core.Promise.resolve(32).then(x => console.log(x)); // => 32
core.setImmediate(x => console.log(x), 42);         // => 42
```

### Index
- [Usage](#usage)
  - [Basic](#basic)
  - [CommonJS](#commonjs)
  - [Custom build](#custom-build-from-the-command-line)
- [Supported engines](#supported-engines)
- [Features](#features)
  - [ECMAScript](#ecmascript)
    - [ECMAScript: Object](#ecmascript-object)
    - [ECMAScript: Function](#ecmascript-function)
    - [ECMAScript: Array](#ecmascript-array)
    - [ECMAScript: String](#ecmascript-string)
    - [ECMAScript: RegExp](#ecmascript-regexp)
    - [ECMAScript: Number](#ecmascript-number)
    - [ECMAScript: Math](#ecmascript-math)
    - [ECMAScript: Date](#ecmascript-date)
    - [ECMAScript: Promise](#ecmascript-promise)
    - [ECMAScript: Symbol](#ecmascript-symbol)
    - [ECMAScript: Collections](#ecmascript-collections)
    - [ECMAScript: Typed Arrays](#ecmascript-typed-arrays)
    - [ECMAScript: Reflect](#ecmascript-reflect)
  - [ECMAScript proposals](#ecmascript-proposals)
    - [stage 4 proposals](#stage-4-proposals)
    - [stage 3 proposals](#stage-3-proposals)
    - [stage 2 proposals](#stage-2-proposals)
    - [stage 1 proposals](#stage-1-proposals)
    - [stage 0 proposals](#stage-0-proposals)
    - [pre-stage 0 proposals](#pre-stage-0-proposals)
  - [Web standards](#web-standards)
    - [setTimeout / setInterval](#settimeout--setinterval)
    - [setImmediate](#setimmediate)
    - [iterable DOM collections](#iterable-dom-collections)
  - [Iteration helpers](#iteration-helpers)
- [Missing polyfills](#missing-polyfills)
- [Changelog](./CHANGELOG.md)

## Usage
### Basic
```
npm i core-js
bower install core.js
```

```js
// Default
require('core-js');
// Without global namespace pollution
var core = require('core-js/library');
// Shim only
require('core-js/shim');
```
If you need complete build for browser, use builds from `core-js/client` path:  

* [default](https://raw.githack.com/zloirock/core-js/v3/client/core.min.js): Includes all features, standard and non-standard.
* [as a library](https://raw.githack.com/zloirock/core-js/v3/client/library.min.js): Like "default", but does not pollute the global namespace (see [2nd example at the top](#core-js)).
* [shim only](https://raw.githack.com/zloirock/core-js/v3/client/shim.min.js): Only includes the standard methods.

Warning: if you use `core-js` with the extension of native objects, require all needed `core-js` modules at the beginning of entry point of your application, otherwise, conflicts may occur.

### CommonJS
You can require only needed modules.

```js
require('core-js/fn/set');
require('core-js/fn/array/from');
require('core-js/fn/array/find-index');
Array.from(new Set([1, 2, 3, 2, 1])); // => [1, 2, 3]
[1, 2, NaN, 3, 4].findIndex(isNaN);   // => 2

// or, w/o global namespace pollution:

var Set       = require('core-js/library/fn/set');
var from      = require('core-js/library/fn/array/from');
var findIndex = require('core-js/library/fn/array/find-index');
from(new Set([1, 2, 3, 2, 1]));      // => [1, 2, 3]
findIndex([1, 2, NaN, 3, 4], isNaN); // => 2
```
Available entry points for methods / constructors, as above examples, and namespaces: for example, `core-js/es/array` (`core-js/library/es/array`) contains all [ES `Array` features](#ecmascript-array), `core-js/es` (`core-js/library/es`) contains all ES features.

##### Caveats when using CommonJS API:

* `modules` path is internal API, does not inject all required dependencies and can be changed in minor or patch releases. Use it only for a custom build and / or if you know what are you doing.
* `core-js` is extremely modular and uses a lot of very tiny modules, because of that for usage in browsers bundle up `core-js` instead of usage loader for each file, otherwise, you will have hundreds of requests.

#### CommonJS and prototype methods without global namespace pollution
In the `library` version, we can't pollute prototypes of native constructors. Because of that, prototype methods transformed to static methods like in examples above. `babel` `runtime` transformer also can't transform them. But with transpilers we can use one more trick - [bind operator and virtual methods](https://github.com/zenparsing/es-function-bind). Special for that, available `/virtual/` entry points. Example:
```js
import fill from 'core-js/library/fn/array/virtual/fill';
import findIndex from 'core-js/library/fn/array/virtual/find-index';

Array(10)::fill(0).map((a, b) => b * b)::findIndex(it => it && !(it % 8)); // => 4

// or

import {fill, findIndex} from 'core-js/library/fn/array/virtual';

Array(10)::fill(0).map((a, b) => b * b)::findIndex(it => it && !(it % 8)); // => 4

```

### Custom build (from the command-line)
```
npm i core-js && cd node_modules/core-js && npm i
npm run grunt build:core.dict,es -- --blacklist=es.promise,es.math --library=on --path=custom uglify
```
Where `core.dict` and `es` are modules (namespaces) names, which will be added to the build, `es.promise` and `es.math` are modules (namespaces) names, which will be excluded from the build, `--library=on` is flag for build without global namespace pollution and `custom` is target file name.

Available namespaces: for example, `es.array` contains [ES `Array` features](#ecmascript-array), `es` contains all modules whose names start with `es`.

### Custom build (from external scripts)

[`core-js-builder`](https://www.npmjs.com/package/core-js-builder) package exports a function that takes the same parameters as the `build` target from the previous section. This will conditionally include or exclude certain parts of `core-js`:

```js
require('core-js-builder')({
  modules: ['es', 'core.dict'], // modules / namespaces
  blacklist: ['es.reflect'],    // blacklist of modules / namespaces, by default - empty list
  library: false,                // flag for build without global namespace pollution, by default - false
  umd: true                      // use UMD wrapper for export `core` object, by default - true
}).then(code => {
  // ...
}).catch(error => {
  // ...
});
```
## Supported engines
**Tested in:**
- Chrome 26+
- Firefox 4+
- Safari 5+
- Opera 12+
- Internet Explorer 6+ (sure, IE8- with ES3 limitations)
- Edge
- Android Browser 2.3+
- iOS Safari 5.1+
- PhantomJS 1.9 / 2.1
- NodeJS 0.8+

...and it doesn't mean `core-js` will not work in other engines, they just have not been tested.

## Features:
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)       <- all features
core-js(/library)/shim  <- only polyfills
```

### ECMAScript
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es
```
#### ECMAScript: Object
Modules [`es.object.assign`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.assign.js), [`es.object.is`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.is.js), [`es.object.set-prototype-of`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.set-prototype-of.js), [`es.object.to-string`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.to-string.js), [`es.object.freeze`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.freeze.js), [`es.object.seal`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.seal.js), [`es.object.prevent-extensions`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.prevent-extensions.js), [`es.object.is-frozen`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.is-frozen.js), [`es.object.is-sealed`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.is-sealed.js), [`es.object.is-extensible`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.is-extensible.js), [`es.object.get-own-property-descriptor`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.get-own-property-descriptor.js), [`esnext.object.get-own-property-descriptors`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.object.get-own-property-descriptors.js), [`es.object.get-prototype-of`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.get-prototype-of.js), [`es.object.keys`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.keys.js), [`esnext.object.values`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.object.values.js), [`esnext.object.entries`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.object.entries.js) and [`es.object.get-own-property-names`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.get-own-property-names.js).

Just ES5 features: [`es.object.create`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.create.js), [`es.object.define-property`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.define-property.js) and [`es.object.define-properties`](https://github.com/zloirock/core-js/blob/v3/modules/es.object.es.object.define-properties.js).

[ES2017 Annex B](https://tc39.github.io/ecma262/#sec-object.prototype.__defineGetter__) - modules [`esnext.object.define-setter`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.object.define-setter.js), [`esnext.object.define-getter`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.object.define-getter.js), [`esnext.object.lookup-setter`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.object.lookup-setter.js) and [`esnext.object.lookup-getter`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.object.lookup-getter.js)
```js
Object
  .assign(target, ...src)                -> target
  .is(a, b)                              -> bool
  .setPrototypeOf(target, proto | null)  -> target (required __proto__ - IE11+)
  .create(object | null, descriptors?)   -> object
  .getPrototypeOf(var)                   -> object | null
  .defineProperty(object, key, desc)     -> target
  .defineProperties(object, descriptors) -> target
  .getOwnPropertyDescriptor(var, key)    -> desc | undefined
  .getOwnPropertyDescriptors(object)     -> object
  .keys(var)                             -> array
  .values(var)                           -> array
  .entries(var)                          -> array
  .getOwnPropertyNames(var)              -> array
  .freeze(var)                           -> var
  .seal(var)                             -> var
  .preventExtensions(var)                -> var
  .isFrozen(var)                         -> bool
  .isSealed(var)                         -> bool
  .isExtensible(var)                     -> bool
  #toString()                            -> string, ES2015 fix: @@toStringTag support
  #__defineSetter__(key, fn)             -> void
  #__defineGetter__(key, fn)             -> void
  #__lookupSetter__(key)                 -> fn | void
  #__lookupGetter__(key)                 -> fn | void
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/object
core-js(/library)/fn/object/assign
core-js(/library)/fn/object/is
core-js(/library)/fn/object/set-prototype-of
core-js(/library)/fn/object/get-prototype-of
core-js(/library)/fn/object/create
core-js(/library)/fn/object/define-property
core-js(/library)/fn/object/define-properties
core-js(/library)/fn/object/get-own-property-descriptor
core-js(/library)/fn/object/get-own-property-descriptors
core-js(/library)/fn/object/keys
core-js(/library)/fn/object/values
core-js(/library)/fn/object/entries
core-js(/library)/fn/object/get-own-property-names
core-js(/library)/fn/object/freeze
core-js(/library)/fn/object/seal
core-js(/library)/fn/object/prevent-extensions
core-js(/library)/fn/object/is-frozen
core-js(/library)/fn/object/is-sealed
core-js(/library)/fn/object/is-extensible
core-js/fn/object/to-string
core-js(/library)/fn/object/define-getter
core-js(/library)/fn/object/define-setter
core-js(/library)/fn/object/lookup-getter
core-js(/library)/fn/object/lookup-setter
```
[*Examples*](https://goo.gl/sqY5mD):
```js
var foo = {q: 1, w: 2}
  , bar = {e: 3, r: 4}
  , baz = {t: 5, y: 6};
Object.assign(foo, bar, baz); // => foo = {q: 1, w: 2, e: 3, r: 4, t: 5, y: 6}

Object.is(NaN, NaN); // => true
Object.is(0, -0);    // => false
Object.is(42, 42);   // => true
Object.is(42, '42'); // => false

function Parent(){}
function Child(){}
Object.setPrototypeOf(Child.prototype, Parent.prototype);
new Child instanceof Child;  // => true
new Child instanceof Parent; // => true

var O = {};
O[Symbol.toStringTag] = 'Foo';
'' + O; // => '[object Foo]'

Object.keys('qwe'); // => ['0', '1', '2']
Object.getPrototypeOf('qwe') === String.prototype; // => true

Object.values({a: 1, b: 2, c: 3});  // => [1, 2, 3]
Object.entries({a: 1, b: 2, c: 3}); // => [['a', 1], ['b', 2], ['c', 3]]

for(let [key, value] of Object.entries({a: 1, b: 2, c: 3})){
  console.log(key);   // => 'a', 'b', 'c'
  console.log(value); // => 1, 2, 3
}

// Shallow object cloning with prototype and descriptors:
var copy = Object.create(Object.getPrototypeOf(O), Object.getOwnPropertyDescriptors(O));
// Mixin:
Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
```
#### ECMAScript: Function
Modules [`es.function.name`](https://github.com/zloirock/core-js/blob/v3/modules/es.function.name.js), [`es.function.has-instance`](https://github.com/zloirock/core-js/blob/v3/modules/es.function.has-instance.js). Just ES5: [`es.function.bind`](https://github.com/zloirock/core-js/blob/v3/modules/es.function.bind.js).
```js
Function
  #bind(object, ...args) -> boundFn(...args)
  #name                  -> string (IE9+)
  #@@hasInstance(var)    -> bool
```
[*CommonJS entry points:*](#commonjs)
```
core-js/es/function
core-js/fn/function/name
core-js/fn/function/has-instance
core-js/fn/function/bind
core-js/fn/function/virtual/bind
```
[*Example*](http://goo.gl/zqu3Wp):
```js
(function foo(){}).name // => 'foo'

console.log.bind(console, 42)(43); // => 42 43
```
#### ECMAScript: Array
Modules [`es.array.from`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.from.js), [`es.array.is-array`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.is-array.js), [`es.array.of`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.of.js), [`es.array.copy-within`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.copy-within.js), [`es.array.fill`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.fill.js), [`es.array.find`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.find.js), [`es.array.find-index`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.find-index.js), [`es.array.iterator`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.iterator.js), [`es.array.includes`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.includes.js), [`es.array.slice`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.slice.js), [`es.array.join`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.join.js), [`es.array.index-of`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.index-of.js), [`es.array.last-index-of`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.last-index-of.js), [`es.array.every`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.every.js), [`es.array.some`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.some.js), [`es.array.for-each`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.for-each.js), [`es.array.map`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.map.js), [`es.array.filter`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.filter.js), [`es.array.reduce`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.reduce.js), [`es.array.reduce-right`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.reduce-right.js), [`es.array.sort`](https://github.com/zloirock/core-js/blob/v3/modules/es.array.sort.js)
```js
Array
  .from(iterable | array-like, mapFn(val, index)?, that) -> array
  .isArray(var)                                          -> bool
  .of(...args)                                           -> array
  #copyWithin(target = 0, start = 0, end = @length)      -> @
  #entries()                                             -> iterator
  #every(fn(val, index, @), that)                        -> bool
  #fill(val, start = 0, end = @length)                   -> @
  #filter(fn(val, index, @), that)                       -> array
  #find(fn(val, index, @), that)                         -> val
  #forEach(fn(val, index, @), that)                      -> void
  #findIndex(fn(val, index, @), that)                    -> index | -1
  #includes(var, from?)                                  -> bool
  #indexOf(var, from?)                                   -> index | -1
  #join(string = ',')                                    -> string, fix for ie7-
  #keys()                                                -> iterator
  #lastIndexOf(var, from?)                               -> index | -1
  #map(fn(val, index, @), that)                          -> array
  #reduce(fn(memo, val, index, @), memo?)                -> var
  #reduceRight(fn(memo, val, index, @), memo?)           -> var
  #slice(start?, end?)                                   -> array, fix for ie7-
  #some(fn(val, index, @), that)                         -> bool
  #sort(fn?)                                             -> @, invalid arguments fix
  #values()                                              -> iterator
  #@@iterator()                                          -> iterator (values)
  #@@unscopables                                         -> object (cap)
Arguments
  #@@iterator() -> iterator (values, available only in core-js methods)
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/array
core-js(/library)/fn/array/from
core-js(/library)/fn/array/of
core-js(/library)/fn/array/is-array
core-js(/library)/fn/array/includes
core-js(/library)/fn/array/iterator
core-js(/library)/fn/array/copy-within
core-js(/library)/fn/array/fill
core-js(/library)/fn/array/find
core-js(/library)/fn/array/find-index
core-js(/library)/fn/array/includes
core-js(/library)/fn/array/values
core-js(/library)/fn/array/keys
core-js(/library)/fn/array/entries
core-js(/library)/fn/array/slice
core-js(/library)/fn/array/join
core-js(/library)/fn/array/index-of
core-js(/library)/fn/array/last-index-of
core-js(/library)/fn/array/every
core-js(/library)/fn/array/some
core-js(/library)/fn/array/for-each
core-js(/library)/fn/array/map
core-js(/library)/fn/array/filter
core-js(/library)/fn/array/reduce
core-js(/library)/fn/array/reduce-right
core-js(/library)/fn/array/sort
core-js(/library)/fn/array/virtual/iterator
core-js(/library)/fn/array/virtual/copy-within
core-js(/library)/fn/array/virtual/fill
core-js(/library)/fn/array/virtual/find
core-js(/library)/fn/array/virtual/find-index
core-js(/library)/fn/array/virtual/includes
core-js(/library)/fn/array/virtual/values
core-js(/library)/fn/array/virtual/keys
core-js(/library)/fn/array/virtual/entries
core-js(/library)/fn/array/virtual/slice
core-js(/library)/fn/array/virtual/join
core-js(/library)/fn/array/virtual/index-of
core-js(/library)/fn/array/virtual/last-index-of
core-js(/library)/fn/array/virtual/every
core-js(/library)/fn/array/virtual/some
core-js(/library)/fn/array/virtual/for-each
core-js(/library)/fn/array/virtual/map
core-js(/library)/fn/array/virtual/filter
core-js(/library)/fn/array/virtual/reduce
core-js(/library)/fn/array/virtual/reduce-right
core-js(/library)/fn/array/virtual/sort
```
[*Examples*](https://goo.gl/Tegvq4):
```js
Array.from(new Set([1, 2, 3, 2, 1]));      // => [1, 2, 3]
Array.from({0: 1, 1: 2, 2: 3, length: 3}); // => [1, 2, 3]
Array.from('123', Number);                 // => [1, 2, 3]
Array.from('123', function(it){
  return it * it;
});                                        // => [1, 4, 9]

Array.of(1);       // => [1]
Array.of(1, 2, 3); // => [1, 2, 3]

var array = ['a', 'b', 'c'];

for(var val of array)console.log(val);          // => 'a', 'b', 'c'
for(var val of array.values())console.log(val); // => 'a', 'b', 'c'
for(var key of array.keys())console.log(key);   // => 0, 1, 2
for(var [key, val] of array.entries()){
  console.log(key);                             // => 0, 1, 2
  console.log(val);                             // => 'a', 'b', 'c'
}

function isOdd(val){
  return val % 2;
}
[4, 8, 15, 16, 23, 42].find(isOdd);      // => 15
[4, 8, 15, 16, 23, 42].findIndex(isOdd); // => 2
[4, 8, 15, 16, 23, 42].find(isNaN);      // => undefined
[4, 8, 15, 16, 23, 42].findIndex(isNaN); // => -1

Array(5).fill(42); // => [42, 42, 42, 42, 42]

[1, 2, 3, 4, 5].copyWithin(0, 3); // => [4, 5, 3, 4, 5]


[1, 2, 3].includes(2);        // => true
[1, 2, 3].includes(4);        // => false
[1, 2, 3].includes(2, 2);     // => false

[NaN].indexOf(NaN);           // => -1
[NaN].includes(NaN);          // => true
Array(1).indexOf(undefined);  // => -1
Array(1).includes(undefined); // => true
```
#### ECMAScript: String
Modules [`es.string.from-code-point`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.from-code-point.js), [`es.string.raw`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.raw.js), [`es.string.iterator`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.iterator.js), [`es.string.split`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.split.js), [`es.string.code-point-at`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.code-point-at.js), [`es.string.ends-with`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.ends-with.js), [`es.string.includes`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.includes.js), [`es.string.repeat`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.repeat.js), [`es.string.starts-with`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.starts-with.js) and [`es.string.trim`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.trim.js).

Annex B HTML methods. Ugly, but it's also the part of the spec. Modules [`es.string.anchor`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.anchor.js), [`es.string.big`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.big.js), [`es.string.blink`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.blink.js), [`es.string.bold`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.bold.js), [`es.string.fixed`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.fixed.js), [`es.string.fontcolor`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.fontcolor.js), [`es.string.fontsize`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.fontsize.js), [`es.string.italics`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.italics.js), [`es.string.link`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.link.js), [`es.string.small`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.small.js), [`es.string.strike`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.strike.js), [`es.string.sub`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.sub.js) and [`es.string.sup`](https://github.com/zloirock/core-js/blob/v3/modules/es.string.sup.js).
```js
String
  .fromCodePoint(...codePoints) -> str
  .raw({raw}, ...substitutions) -> str
  #split(separator, limit)      -> array
  #includes(str, from?)         -> bool
  #startsWith(str, from?)       -> bool
  #endsWith(str, from?)         -> bool
  #repeat(num)                  -> str
  #codePointAt(pos)             -> uint
  #trim()                       -> str
  #anchor(name)                 -> str
  #big()                        -> str
  #blink()                      -> str
  #bold()                       -> str
  #fixed()                      -> str
  #fontcolor(color)             -> str
  #fontsize(size)               -> str
  #italics()                    -> str
  #link(url)                    -> str
  #small()                      -> str
  #strike()                     -> str
  #sub()                        -> str
  #sup()                        -> str
  #@@iterator()                 -> iterator (code points)
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/string
core-js(/library)/fn/string/from-code-point
core-js(/library)/fn/string/raw
core-js(/library)/fn/string/includes
core-js(/library)/fn/string/starts-with
core-js(/library)/fn/string/ends-with
core-js(/library)/fn/string/repeat
core-js(/library)/fn/string/code-point-at
core-js(/library)/fn/string/trim
core-js(/library)/fn/string/anchor
core-js(/library)/fn/string/big
core-js(/library)/fn/string/blink
core-js(/library)/fn/string/bold
core-js(/library)/fn/string/fixed
core-js(/library)/fn/string/fontcolor
core-js(/library)/fn/string/fontsize
core-js(/library)/fn/string/italics
core-js(/library)/fn/string/link
core-js(/library)/fn/string/small
core-js(/library)/fn/string/strike
core-js(/library)/fn/string/sub
core-js(/library)/fn/string/sup
core-js(/library)/fn/string/iterator
core-js(/library)/fn/string/virtual/includes
core-js(/library)/fn/string/virtual/starts-with
core-js(/library)/fn/string/virtual/ends-with
core-js(/library)/fn/string/virtual/repeat
core-js(/library)/fn/string/virtual/code-point-at
core-js(/library)/fn/string/virtual/trim
core-js(/library)/fn/string/virtual/anchor
core-js(/library)/fn/string/virtual/big
core-js(/library)/fn/string/virtual/blink
core-js(/library)/fn/string/virtual/bold
core-js(/library)/fn/string/virtual/fixed
core-js(/library)/fn/string/virtual/fontcolor
core-js(/library)/fn/string/virtual/fontsize
core-js(/library)/fn/string/virtual/italics
core-js(/library)/fn/string/virtual/link
core-js(/library)/fn/string/virtual/small
core-js(/library)/fn/string/virtual/strike
core-js(/library)/fn/string/virtual/sub
core-js(/library)/fn/string/virtual/sup
core-js(/library)/fn/string/virtual/iterator
```
[*Examples*](http://goo.gl/3UaQ93):
```js
for(var val of 'a𠮷b'){
  console.log(val); // => 'a', '𠮷', 'b'
}

'foobarbaz'.includes('bar');      // => true
'foobarbaz'.includes('bar', 4);   // => false
'foobarbaz'.startsWith('foo');    // => true
'foobarbaz'.startsWith('bar', 3); // => true
'foobarbaz'.endsWith('baz');      // => true
'foobarbaz'.endsWith('bar', 6);   // => true

'string'.repeat(3); // => 'stringstringstring'

'𠮷'.codePointAt(0); // => 134071
String.fromCodePoint(97, 134071, 98); // => 'a𠮷b'

var name = 'Bob';
String.raw`Hi\n${name}!`;           // => 'Hi\\nBob!' (ES2015 template string syntax)
String.raw({raw: 'test'}, 0, 1, 2); // => 't0e1s2t'

'foo'.bold();                     // => '<b>foo</b>'
'bar'.anchor('a"b');              // => '<a name="a&quot;b">bar</a>'
'baz'.link('http://example.com'); // => '<a href="http://example.com">baz</a>'
```
#### ECMAScript: RegExp
Modules [`es.regexp.constructor`](https://github.com/zloirock/core-js/blob/v3/modules/es.regexp.constructor.js) and [`es.regexp.flags`](https://github.com/zloirock/core-js/blob/v3/modules/es.regexp.flags.js).

Support well-known [symbols](#ecmascript-symbol) `@@match`, `@@replace`, `@@search` and `@@split`, modules [`es.regexp.match`](https://github.com/zloirock/core-js/blob/v3/modules/es.regexp.match.js), [`es.regexp.replace`](https://github.com/zloirock/core-js/blob/v3/modules/es.regexp.replace.js), [`es.regexp.search`](https://github.com/zloirock/core-js/blob/v3/modules/es.regexp.search.js) and [`es.regexp.split`](https://github.com/zloirock/core-js/blob/v3/modules/es.regexp.split.js).
```
[new] RegExp(pattern, flags?) -> regexp, ES2015 fix: can alter flags (IE9+)
  #flags -> str (IE9+)
  #toString() -             > str, ES2015 fixes
  #@@match(str)             -> array | null
  #@@replace(str, replacer) -> string
  #@@search(str)            -> index
  #@@split(str, limit)      -> array
String
  #match(tpl)             -> var, ES2015 fix for support @@match
  #replace(tpl, replacer) -> var, ES2015 fix for support @@replace
  #search(tpl)            -> var, ES2015 fix for support @@search
  #split(tpl, limit)      -> var, ES2015 fix for support @@split, some fixes for old engines
```
[*CommonJS entry points:*](#commonjs)
```
core-js/es/regexp
core-js/fn/regexp/constructor
core-js(/library)/fn/regexp/flags
core-js/fn/regexp/to-string
core-js/fn/regexp/match
core-js/fn/regexp/replace
core-js/fn/regexp/search
core-js/fn/regexp/split
```
[*Examples*](http://goo.gl/PiJxBD):
```js
RegExp(/./g, 'm'); // => /./m

/foo/.flags;    // => ''
/foo/gim.flags; // => 'gim'

'foo'.match({[Symbol.match]: _ => 1});     // => 1
'foo'.replace({[Symbol.replace]: _ => 2}); // => 2
'foo'.search({[Symbol.search]: _ => 3});   // => 3
'foo'.split({[Symbol.split]: _ => 4});     // => 4

RegExp.prototype.toString.call({source: 'foo', flags: 'bar'}); // => '/foo/bar'
```
#### ECMAScript: Number
Module [`es.number.constructor`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.constructor.js). `Number` constructor support binary and octal literals, [*example*](http://goo.gl/jRd6b3):
```js
Number('0b1010101'); // => 85
Number('0o7654321'); // => 2054353
```
Modules [`es.number.epsilon`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.epsilon.js), [`es.number.is-finite`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.is-finite.js), [`es.number.is-integer`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.is-integer.js), [`es.number.is-nan`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.is-nan.js), [`es.number.is-safe-integer`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.is-safe-integer.js), [`es.number.max-safe-integer`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.max-safe-integer.js), [`es.number.min-safe-integer`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.min-safe-integer.js), [`es.number.parse-float`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.parse-float.js), [`es.number.parse-int`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.parse-int.js), [`es.number.to-fixed`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.to-fixed.js), [`es.number.to-precision`](https://github.com/zloirock/core-js/blob/v3/modules/es.number.to-precision.js), [`es.parse-int`](https://github.com/zloirock/core-js/blob/v3/modules/es.parse-int.js), [`es.parse-float`](https://github.com/zloirock/core-js/blob/v3/modules/es.parse-float.js).
```js
[new] Number(var)         -> number | number object
  .isFinite(num)          -> bool
  .isNaN(num)             -> bool
  .isInteger(num)         -> bool
  .isSafeInteger(num)     -> bool
  .parseFloat(str)        -> num
  .parseInt(str)          -> int
  .EPSILON                -> num
  .MAX_SAFE_INTEGER       -> int
  .MIN_SAFE_INTEGER       -> int
  #toFixed(digits)        -> string, fixes
  #toPrecision(precision) -> string, fixes
parseFloat(str)           -> num, fixes
parseInt(str)             -> int, fixes
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/number
core-js/es/number/constructor
core-js(/library)/fn/number/is-finite
core-js(/library)/fn/number/is-nan
core-js(/library)/fn/number/is-integer
core-js(/library)/fn/number/is-safe-integer
core-js(/library)/fn/number/parse-float
core-js(/library)/fn/number/parse-int
core-js(/library)/fn/number/epsilon
core-js(/library)/fn/number/max-safe-integer
core-js(/library)/fn/number/min-safe-integer
core-js(/library)/fn/number/to-fixed
core-js(/library)/fn/number/to-precision
core-js(/library)/fn/parse-float
core-js(/library)/fn/parse-int
```
#### ECMAScript: Math
Modules [`es.math.acosh`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.acosh.js), [`es.math.asinh`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.asinh.js), [`es.math.atanh`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.atanh.js), [`es.math.cbrt`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.cbrt.js), [`es.math.clz32`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.clz32.js), [`es.math.cosh`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.cosh.js), [`es.math.expm1`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.expm1.js), [`es.math.fround`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.fround.js), [`es.math.hypot`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.hypot.js), [`es.math.imul`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.imul.js), [`es.math.log10`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.log10.js), [`es.math.log1p`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.log1p.js), [`es.math.log2`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.log2.js), [`es.math.sign`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.sign.js), [`es.math.sinh`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.sinh.js), [`es.math.tanh`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.tanh.js), [`es.math.trunc`](https://github.com/zloirock/core-js/blob/v3/modules/es.math.trunc.js).
```js
Math
  .acosh(num)     -> num
  .asinh(num)     -> num
  .atanh(num)     -> num
  .cbrt(num)      -> num
  .clz32(num)     -> uint
  .cosh(num)      -> num
  .expm1(num)     -> num
  .fround(num)    -> num
  .hypot(...args) -> num
  .imul(num, num) -> int
  .log1p(num)     -> num
  .log10(num)     -> num
  .log2(num)      -> num
  .sign(num)      -> 1 | -1 | 0 | -0 | NaN
  .sinh(num)      -> num
  .tanh(num)      -> num
  .trunc(num)     -> num
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/math
core-js(/library)/fn/math/acosh
core-js(/library)/fn/math/asinh
core-js(/library)/fn/math/atanh
core-js(/library)/fn/math/cbrt
core-js(/library)/fn/math/clz32
core-js(/library)/fn/math/cosh
core-js(/library)/fn/math/expm1
core-js(/library)/fn/math/fround
core-js(/library)/fn/math/hypot
core-js(/library)/fn/math/imul
core-js(/library)/fn/math/log1p
core-js(/library)/fn/math/log10
core-js(/library)/fn/math/log2
core-js(/library)/fn/math/sign
core-js(/library)/fn/math/sinh
core-js(/library)/fn/math/tanh
core-js(/library)/fn/math/trunc
```
#### ECMAScript: Date
Modules [`es.date.to-string`](https://github.com/zloirock/core-js/blob/v3/modules/es.date.to-string.js), ES5 features with fixes: [`es.date.now`](https://github.com/zloirock/core-js/blob/v3/modules/es.date.now.js), [`es.date.to-iso-string`](https://github.com/zloirock/core-js/blob/v3/modules/es.date.to-iso-string.js), [`es.date.to-json`](https://github.com/zloirock/core-js/blob/v3/modules/es.date.to-json.js) and [`es.date.to-primitive`](https://github.com/zloirock/core-js/blob/v3/modules/es.date.to-primitive.js).
```js
Date
  .now()               -> int
  #toISOString()       -> string
  #toJSON()            -> string
  #toString()          -> string
  #@@toPrimitive(hint) -> primitive
```
[*CommonJS entry points:*](#commonjs)
```
core-js/es/date
core-js/fn/date/to-string
core-js(/library)/fn/date/now
core-js(/library)/fn/date/to-iso-string
core-js(/library)/fn/date/to-json
core-js(/library)/fn/date/to-primitive
```
[*Example*](http://goo.gl/haeHLR):
```js
new Date(NaN).toString(); // => 'Invalid Date'
```

#### ECMAScript: Promise
Module [`es.promise`](https://github.com/zloirock/core-js/blob/v3/modules/es.promise.js).
```js
new Promise(executor(resolve(var), reject(var))) -> promise
  #then(resolved(var), rejected(var))            -> promise
  #catch(rejected(var))                          -> promise
  .resolve(promise | var)                        -> promise
  .reject(var)                                   -> promise
  .all(iterable)                                 -> promise
  .race(iterable)                                -> promise
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/promise
core-js(/library)/fn/promise
```
Basic [*example*](http://goo.gl/vGrtUC):
```js
function sleepRandom(time){
  return new Promise(function(resolve, reject){
    setTimeout(resolve, time * 1e3, 0 | Math.random() * 1e3);
  });
}

console.log('Run');                    // => Run
sleepRandom(5).then(function(result){
  console.log(result);                 // => 869, after 5 sec.
  return sleepRandom(10);
}).then(function(result){
  console.log(result);                 // => 202, after 10 sec.
}).then(function(){
  console.log('immediately after');    // => immediately after
  throw Error('Irror!');
}).then(function(){
  console.log('will not be displayed');
}).catch(x => console.log(x));         // => => Error: Irror!
```
`Promise.resolve` and `Promise.reject` [*example*](http://goo.gl/vr8TN3):
```js
Promise.resolve(42).then(x => console.log(x)); // => 42
Promise.reject(42).catch(x => console.log(x)); // => 42

Promise.resolve($.getJSON('/data.json')); // => ES promise
```
`Promise.all` [*example*](http://goo.gl/RdoDBZ):
```js
Promise.all([
  'foo',
  sleepRandom(5),
  sleepRandom(15),
  sleepRandom(10)             // after 15 sec:
]).then(x => console.log(x)); // => ['foo', 956, 85, 382]
```
`Promise.race` [*example*](http://goo.gl/L8ovkJ):
```js
function timeLimit(promise, time){
  return Promise.race([promise, new Promise(function(resolve, reject){
    setTimeout(reject, time * 1e3, Error('Await > ' + time + ' sec'));
  })]);
}

timeLimit(sleepRandom(5), 10).then(x => console.log(x));   // => 853, after 5 sec.
timeLimit(sleepRandom(15), 10).catch(x => console.log(x)); // Error: Await > 10 sec
```
ECMAScript 7 [async functions](https://tc39.github.io/ecmascript-asyncawait) [example](http://goo.gl/wnQS4j):
```js
var delay = time => new Promise(resolve => setTimeout(resolve, time))

async function sleepRandom(time){
  await delay(time * 1e3);
  return 0 | Math.random() * 1e3;
};
async function sleepError(time, msg){
  await delay(time * 1e3);
  throw Error(msg);
};

(async () => {
  try {
    console.log('Run');                // => Run
    console.log(await sleepRandom(5)); // => 936, after 5 sec.
    var [a, b, c] = await Promise.all([
      sleepRandom(5),
      sleepRandom(15),
      sleepRandom(10)
    ]);
    console.log(a, b, c);              // => 210 445 71, after 15 sec.
    await sleepError(5, 'Irror!');
    console.log('Will not be displayed');
  } catch(e){
    console.log(e);                    // => Error: 'Irror!', after 5 sec.
  }
})();
```

##### Unhandled rejection tracking

In Node.js, like in native implementation, available events [`unhandledRejection`](https://nodejs.org/api/process.html#process_event_unhandledrejection) and [`rejectionHandled`](https://nodejs.org/api/process.html#process_event_rejectionhandled):
```js
process.on('unhandledRejection', (reason, promise) => console.log('unhandled', reason, promise));
process.on('rejectionHandled', (promise) => console.log('handled', promise));

var p = Promise.reject(42);
// unhandled 42 [object Promise]

setTimeout(() => p.catch(_ => _), 1e3);
// handled [object Promise]
```
In a browser on rejection, by default, you will see notify in the console, or you can add a custom handler and a handler on handling unhandled, [*example*](http://goo.gl/Wozskl):
```js
window.onunhandledrejection = e => console.log('unhandled', e.reason, e.promise);
window.onrejectionhandled = e => console.log('handled', e.reason, e.promise);

var p = Promise.reject(42);
// unhandled 42 [object Promise]

setTimeout(() => p.catch(_ => _), 1e3);
// handled 42 [object Promise]
```

#### ECMAScript: Symbol
Module [`es.symbol`](https://github.com/zloirock/core-js/blob/v3/modules/es.symbol.js).
```js
Symbol(description?)  -> symbol
  .hasInstance        -> @@hasInstance
  .isConcatSpreadable -> @@isConcatSpreadable
  .iterator           -> @@iterator
  .match              -> @@match
  .replace            -> @@replace
  .search             -> @@search
  .species            -> @@species
  .split              -> @@split
  .toPrimitive        -> @@toPrimitive
  .toStringTag        -> @@toStringTag
  .unscopables        -> @@unscopables
  .for(key)           -> symbol
  .keyFor(symbol)     -> key
  .useSimple()        -> void
  .useSetter()        -> void
Object
  .getOwnPropertySymbols(object) -> array
```
Also wrapped some methods for correct work with `Symbol` polyfill.
```js
Object
  .create(proto | null, descriptors?)    -> object
  .defineProperty(target, key, desc)     -> target
  .defineProperties(target, descriptors) -> target
  .getOwnPropertyDescriptor(var, key)    -> desc | undefined
  .getOwnPropertyNames(var)              -> array
  #propertyIsEnumerable(key)             -> bool
JSON
  .stringify(target, replacer?, space?) -> string | undefined
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/symbol
core-js(/library)/fn/symbol
core-js(/library)/fn/symbol/has-instance
core-js(/library)/fn/symbol/is-concat-spreadable
core-js(/library)/fn/symbol/iterator
core-js(/library)/fn/symbol/match
core-js(/library)/fn/symbol/replace
core-js(/library)/fn/symbol/search
core-js(/library)/fn/symbol/species
core-js(/library)/fn/symbol/split
core-js(/library)/fn/symbol/to-primitive
core-js(/library)/fn/symbol/to-string-tag
core-js(/library)/fn/symbol/unscopables
core-js(/library)/fn/symbol/for
core-js(/library)/fn/symbol/key-for
```
[*Basic example*](http://goo.gl/BbvWFc):
```js
var Person = (function(){
  var NAME = Symbol('name');
  function Person(name){
    this[NAME] = name;
  }
  Person.prototype.getName = function(){
    return this[NAME];
  };
  return Person;
})();

var person = new Person('Vasya');
console.log(person.getName());          // => 'Vasya'
console.log(person['name']);            // => undefined
console.log(person[Symbol('name')]);    // => undefined, symbols are uniq
for(var key in person)console.log(key); // => only 'getName', symbols are not enumerable
```
`Symbol.for` & `Symbol.keyFor` [*example*](http://goo.gl/0pdJjX):
```js
var symbol = Symbol.for('key');
symbol === Symbol.for('key'); // true
Symbol.keyFor(symbol);        // 'key'
```
[*Example*](http://goo.gl/mKVOQJ) with methods for getting own object keys:
```js
var O = {a: 1};
Object.defineProperty(O, 'b', {value: 2});
O[Symbol('c')] = 3;
Object.keys(O);                  // => ['a']
Object.getOwnPropertyNames(O);   // => ['a', 'b']
Object.getOwnPropertySymbols(O); // => [Symbol(c)]
Reflect.ownKeys(O);              // => ['a', 'b', Symbol(c)]
```
##### Caveats when using `Symbol` polyfill:

* We can't add new primitive type, `Symbol` returns object.
* `Symbol.for` and `Symbol.keyFor` can't be shimmed cross-realm.
* By default, to hide the keys, `Symbol` polyfill defines setter in `Object.prototype`. For this reason, uncontrolled creation of symbols can cause memory leak and the `in` operator is not working correctly with `Symbol` polyfill: `Symbol() in {} // => true`.

You can disable defining setters in `Object.prototype`. [Example](http://goo.gl/N5UD7J):
```js
Symbol.useSimple();
var s1 = Symbol('s1')
  , o1 = {};
o1[s1] = true;
for(var key in o1)console.log(key); // => 'Symbol(s1)_t.qamkg9f3q', w/o native Symbol

Symbol.useSetter();
var s2 = Symbol('s2')
  , o2 = {};
o2[s2] = true;
for(var key in o2)console.log(key); // nothing
```
* Currently, `core-js` not adds setters to `Object.prototype` for well-known symbols for correct work something like `Symbol.iterator in foo`. It can cause problems with their enumerability.
* Some problems possible with environment exotic objects (for example, IE `localStorage`).

#### ECMAScript: Collections
`core-js` uses native collections in most case, just fixes methods / constructor, if it's required, and in old environment uses fast polyfill (O(1) lookup).
#### Map
Module [`es.map`](https://github.com/zloirock/core-js/blob/v3/modules/es.map.js).
```js
new Map(iterable (entries) ?)     -> map
  #clear()                        -> void
  #delete(key)                    -> bool
  #forEach(fn(val, key, @), that) -> void
  #get(key)                       -> val
  #has(key)                       -> bool
  #set(key, val)                  -> @
  #size                           -> uint
  #values()                       -> iterator
  #keys()                         -> iterator
  #entries()                      -> iterator
  #@@iterator()                   -> iterator (entries)
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/map
core-js(/library)/fn/map
```
[*Examples*](http://goo.gl/GWR7NI):
```js
var a = [1];

var map = new Map([['a', 1], [42, 2]]);
map.set(a, 3).set(true, 4);

console.log(map.size);        // => 4
console.log(map.has(a));      // => true
console.log(map.has([1]));    // => false
console.log(map.get(a));      // => 3
map.forEach(function(val, key){
  console.log(val);           // => 1, 2, 3, 4
  console.log(key);           // => 'a', 42, [1], true
});
map.delete(a);
console.log(map.size);        // => 3
console.log(map.get(a));      // => undefined
console.log(Array.from(map)); // => [['a', 1], [42, 2], [true, 4]]

var map = new Map([['a', 1], ['b', 2], ['c', 3]]);

for(var [key, val] of map){
  console.log(key);                           // => 'a', 'b', 'c'
  console.log(val);                           // => 1, 2, 3
}
for(var val of map.values())console.log(val); // => 1, 2, 3
for(var key of map.keys())console.log(key);   // => 'a', 'b', 'c'
for(var [key, val] of map.entries()){
  console.log(key);                           // => 'a', 'b', 'c'
  console.log(val);                           // => 1, 2, 3
}
```
#### Set
Module [`es.set`](https://github.com/zloirock/core-js/blob/v3/modules/es.set.js).
```js
new Set(iterable?)              -> set
  #add(key)                     -> @
  #clear()                      -> void
  #delete(key)                  -> bool
  #forEach(fn(el, el, @), that) -> void
  #has(key)                     -> bool
  #size                         -> uint
  #values()                     -> iterator
  #keys()                       -> iterator
  #entries()                    -> iterator
  #@@iterator()                 -> iterator (values)
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/set
core-js(/library)/fn/set
```
[*Examples*](http://goo.gl/bmhLwg):
```js
var set = new Set(['a', 'b', 'a', 'c']);
set.add('d').add('b').add('e');
console.log(set.size);        // => 5
console.log(set.has('b'));    // => true
set.forEach(function(it){
  console.log(it);            // => 'a', 'b', 'c', 'd', 'e'
});
set.delete('b');
console.log(set.size);        // => 4
console.log(set.has('b'));    // => false
console.log(Array.from(set)); // => ['a', 'c', 'd', 'e']

var set = new Set([1, 2, 3, 2, 1]);

for(var val of set)console.log(val);          // => 1, 2, 3
for(var val of set.values())console.log(val); // => 1, 2, 3
for(var key of set.keys())console.log(key);   // => 1, 2, 3
for(var [key, val] of set.entries()){
  console.log(key);                           // => 1, 2, 3
  console.log(val);                           // => 1, 2, 3
}
```
#### WeakMap
Module [`es.weak-map`](https://github.com/zloirock/core-js/blob/v3/modules/es.weak-map.js).
```js
new WeakMap(iterable (entries) ?) -> weakmap
  #delete(key)                    -> bool
  #get(key)                       -> val
  #has(key)                       -> bool
  #set(key, val)                  -> @
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/weak-map
core-js(/library)/fn/weak-map
```
[*Examples*](http://goo.gl/SILXyw):
```js
var a = [1]
  , b = [2]
  , c = [3];

var wmap = new WeakMap([[a, 1], [b, 2]]);
wmap.set(c, 3).set(b, 4);
console.log(wmap.has(a));   // => true
console.log(wmap.has([1])); // => false
console.log(wmap.get(a));   // => 1
wmap.delete(a);
console.log(wmap.get(a));   // => undefined

// Private properties store:
var Person = (function(){
  var names = new WeakMap;
  function Person(name){
    names.set(this, name);
  }
  Person.prototype.getName = function(){
    return names.get(this);
  };
  return Person;
})();

var person = new Person('Vasya');
console.log(person.getName());          // => 'Vasya'
for(var key in person)console.log(key); // => only 'getName'
```
#### WeakSet
Module [`es.weak-set`](https://github.com/zloirock/core-js/blob/v3/modules/es.weak-set.js).
```js
new WeakSet(iterable?) -> weakset
  #add(key)            -> @
  #delete(key)         -> bool
  #has(key)            -> bool
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/weak-set
core-js(/library)/fn/weak-set
```
[*Examples*](http://goo.gl/TdFbEx):
```js
var a = [1]
  , b = [2]
  , c = [3];

var wset = new WeakSet([a, b, a]);
wset.add(c).add(b).add(c);
console.log(wset.has(b));   // => true
console.log(wset.has([2])); // => false
wset.delete(b);
console.log(wset.has(b));   // => false
```
##### Caveats when using collections polyfill:

* Weak-collections polyfill stores values as hidden properties of keys. It works correct and not leak in most cases. However, it is desirable to store a collection longer than its keys.

#### ECMAScript: Typed Arrays
Implementations and fixes `ArrayBuffer`, `DataView`, typed arrays constructors, static and prototype methods. Typed Arrays work only in environments with support descriptors (IE9+), `ArrayBuffer` and `DataView` should work anywhere.

Modules [`es.typed.array-buffer`](https://github.com/zloirock/core-js/blob/v3/modules/es.typed.array-buffer.js), [`es.typed.data-view`](https://github.com/zloirock/core-js/blob/v3/modules/es.typed.data-view.js), [`es.typed.int8-array`](https://github.com/zloirock/core-js/blob/v3/modules/es.typed.int8-array.js), [`es.typed.uint8-array`](https://github.com/zloirock/core-js/blob/v3/modules/es.typed.uint8-array.js), [`es.typed.uint8-clamped-array`](https://github.com/zloirock/core-js/blob/v3/modules/es.typed.uint8-clamped-array.js), [`es.typed.int16-array`](https://github.com/zloirock/core-js/blob/v3/modules/es.typed.int16-array.js), [`es.typed.uint16-array`](https://github.com/zloirock/core-js/blob/v3/modules/es.typed.uint16-array.js), [`es.typed.int32-array`](https://github.com/zloirock/core-js/blob/v3/modules/es.typed.int32-array.js), [`es.typed.uint32-array`](https://github.com/zloirock/core-js/blob/v3/modules/es.typed.uint32-array.js), [`es.typed.float32-array`](https://github.com/zloirock/core-js/blob/v3/modules/es.typed.float32-array.js) and [`es.typed.float64-array`](https://github.com/zloirock/core-js/blob/v3/modules/es.typed.float64-array.js).
```js
new ArrayBuffer(length) -> buffer
  .isView(var) -> bool
  #slice(start = 0, end = @length) -> buffer
  #byteLength -> uint

new DataView(buffer, byteOffset = 0, byteLength = buffer.byteLength - byteOffset) -> view
  #getInt8(offset)                          -> int8
  #getUint8(offset)                         -> uint8
  #getInt16(offset, littleEndian = false)   -> int16
  #getUint16(offset, littleEndian = false)  -> uint16
  #getInt32(offset, littleEndian = false)   -> int32
  #getUint32(offset, littleEndian = false)  -> uint32
  #getFloat32(offset, littleEndian = false) -> float32
  #getFloat64(offset, littleEndian = false) -> float64
  #setInt8(offset, value)                          -> void
  #setUint8(offset, value)                         -> void
  #setInt16(offset, value, littleEndian = false)   -> void
  #setUint16(offset, value, littleEndian = false)  -> void
  #setInt32(offset, value, littleEndian = false)   -> void
  #setUint32(offset, value, littleEndian = false)  -> void
  #setFloat32(offset, value, littleEndian = false) -> void
  #setFloat64(offset, value, littleEndian = false) -> void
  #buffer     -> buffer
  #byteLength -> uint
  #byteOffset -> uint

{
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array
}
  new %TypedArray%(length)    -> typed
  new %TypedArray%(typed)     -> typed
  new %TypedArray%(arrayLike) -> typed
  new %TypedArray%(iterable)  -> typed
  new %TypedArray%(buffer, byteOffset = 0, length = (buffer.byteLength - byteOffset) / @BYTES_PER_ELEMENT) -> typed
  .BYTES_PER_ELEMENT -> uint
  .from(arrayLike | iterable, mapFn(val, index)?, that) -> typed
  .of(...args) -> typed
  #BYTES_PER_ELEMENT -> uint
  #copyWithin(target = 0, start = 0, end = @length) -> @
  #every(fn(val, index, @), that) -> bool
  #fill(val, start = 0, end = @length) -> @
  #filter(fn(val, index, @), that) -> typed
  #find(fn(val, index, @), that) -> val
  #findIndex(fn(val, index, @), that) -> index
  #forEach(fn(val, index, @), that) -> void
  #includes(var, from?) -> bool
  #indexOf(var, from?) -> int
  #join(string = ',') -> string
  #lastIndexOf(var, from?) -> int
  #map(fn(val, index, @), that) -> typed
  #reduce(fn(memo, val, index, @), memo?) -> var
  #reduceRight(fn(memo, val, index, @), memo?) -> var
  #reverse() -> @
  #set(arrayLike, offset = 0) -> void
  #slice(start = 0, end = @length) -> typed
  #some(fn(val, index, @), that) -> bool
  #sort(fn(a, b)?) -> @
  #subarray(start = 0, end = @length) -> typed
  #toString() -> string
  #toLocaleString() -> string
  #values()     -> iterator
  #keys()       -> iterator
  #entries()    -> iterator
  #@@iterator() -> iterator (values)
  #buffer     -> buffer
  #byteLength -> uint
  #byteOffset -> uint
  #length     -> uint
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/typed
core-js(/library)/fn/typed
core-js(/library)/fn/typed/array-buffer
core-js(/library)/fn/typed/data-view
core-js(/library)/fn/typed/int8-array
core-js(/library)/fn/typed/uint8-array
core-js(/library)/fn/typed/uint8-clamped-array
core-js(/library)/fn/typed/int16-array
core-js(/library)/fn/typed/uint16-array
core-js(/library)/fn/typed/int32-array
core-js(/library)/fn/typed/uint32-array
core-js(/library)/fn/typed/float32-array
core-js(/library)/fn/typed/float64-array
```
[*Examples*](http://goo.gl/yla75z):
```js
new Int32Array(4);                          // => [0, 0, 0, 0]
new Uint8ClampedArray([1, 2, 3, 666]);      // => [1, 2, 3, 255]
new Float32Array(new Set([1, 2, 3, 2, 1])); // => [1, 2, 3]

var buffer = new ArrayBuffer(8);
var view   = new DataView(buffer);
view.setFloat64(0, 123.456, true);
new Uint8Array(buffer.slice(4)); // => [47, 221, 94, 64]

Int8Array.of(1, 1.5, 5.7, 745);      // => [1, 1, 5, -23]
Uint8Array.from([1, 1.5, 5.7, 745]); // => [1, 1, 5, 233]

var typed = new Uint8Array([1, 2, 3]);

var a = typed.slice(1);    // => [2, 3]
typed.buffer === a.buffer; // => false
var b = typed.subarray(1); // => [2, 3]
typed.buffer === b.buffer; // => true

typed.filter(it => it % 2); // => [1, 3]
typed.map(it => it * 1.5);  // => [1, 3, 4]

for(var val of typed)console.log(val);          // => 1, 2, 3
for(var val of typed.values())console.log(val); // => 1, 2, 3
for(var key of typed.keys())console.log(key);   // => 0, 1, 2
for(var [key, val] of typed.entries()){
  console.log(key);                             // => 0, 1, 2
  console.log(val);                             // => 1, 2, 3
}
```
##### Caveats when using typed arrays:

* Typed Arrays polyfills works completely how should work by the spec, but because of internal use getter / setters on each instance, is slow and consumes significant memory. However, typed arrays polyfills required mainly for IE9 (and for `Uint8ClampedArray` in IE10 and early IE11), all modern engines have native typed arrays and requires only constructors fixes and methods.
* The current version hasn't special entry points for methods, they can be added only with constructors. It can be added in the future.
* In the `library` version we can't pollute native prototypes, so prototype methods available as constructors static.

#### ECMAScript: Reflect
Modules [`es.reflect.apply`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.apply.js), [`es.reflect.construct`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.construct.js), [`es.reflect.define-property`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.define-property.js), [`es.reflect.delete-property`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.delete-property.js), [`es.reflect.get`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.get.js), [`es.reflect.get-own-property-descriptor`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.get-own-property-descriptor.js), [`es.reflect.get-prototype-of`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.get-prototype-of.js), [`es.reflect.has`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.has.js), [`es.reflect.is-extensible`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.is-extensible.js), [`es.reflect.own-keys`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.own-keys.js), [`es.reflect.prevent-extensions`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.prevent-extensions.js), [`es.reflect.set`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.set.js), [`es.reflect.set-prototype-of`](https://github.com/zloirock/core-js/blob/v3/modules/es.reflect.set-prototype-of.js).
```js
Reflect
  .apply(target, thisArgument, argumentsList) -> var
  .construct(target, argumentsList, newTarget?) -> object
  .defineProperty(target, propertyKey, attributes) -> bool
  .deleteProperty(target, propertyKey) -> bool
  .get(target, propertyKey, receiver?) -> var
  .getOwnPropertyDescriptor(target, propertyKey) -> desc
  .getPrototypeOf(target) -> object | null
  .has(target, propertyKey) -> bool
  .isExtensible(target) -> bool
  .ownKeys(target) -> array
  .preventExtensions(target) -> bool
  .set(target, propertyKey, V, receiver?) -> bool
  .setPrototypeOf(target, proto) -> bool (required __proto__ - IE11+)
```
[*CommonJS entry points:*](#commonjs)
```
core-js(/library)/es/reflect
core-js(/library)/fn/reflect
core-js(/library)/fn/reflect/apply
core-js(/library)/fn/reflect/construct
core-js(/library)/fn/reflect/define-property
core-js(/library)/fn/reflect/delete-property
core-js(/library)/fn/reflect/get
core-js(/library)/fn/reflect/get-own-property-descriptor
core-js(/library)/fn/reflect/get-prototype-of
core-js(/library)/fn/reflect/has
core-js(/library)/fn/reflect/is-extensible
core-js(/library)/fn/reflect/own-keys
core-js(/library)/fn/reflect/prevent-extensions
core-js(/library)/fn/reflect/set
core-js(/library)/fn/reflect/set-prototype-of
```
[*Examples*](http://goo.gl/gVT0cH):
```js
var O = {a: 1};
Object.defineProperty(O, 'b', {value: 2});
O[Symbol('c')] = 3;
Reflect.ownKeys(O); // => ['a', 'b', Symbol(c)]

function C(a, b){
  this.c = a + b;
}

var instance = Reflect.construct(C, [20, 22]);
instance.c; // => 42
```

### ECMAScript proposals
[The TC39 process.](https://tc39.github.io/process-document/)
`core-js/stage/4` entry point contains only stage 4 proposals, `core-js/stage/3` - stage 3 and stage 4, etc.
#### Stage 4 proposals

[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/stage/4
```
* `String#padStart`, `String#padEnd` [proposal](https://github.com/tc39/proposal-string-pad-start-end) - modules [`esnext.string.pad-start`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.string.pad-start.js), [`esnext.string.pad-end`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.string.pad-end.js)
```js
String
  #padStart(length, fillStr = ' ') -> string
  #padEnd(length, fillStr = ' ') -> string
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/string/pad-start
core-js(/library)/fn/string/pad-end
core-js(/library)/fn/string/virtual/pad-start
core-js(/library)/fn/string/virtual/pad-end
```
[*Examples*](http://goo.gl/hK5ccv):
```js
'hello'.padStart(10);         // => '     hello'
'hello'.padStart(10, '1234'); // => '12341hello'
'hello'.padEnd(10);           // => 'hello     '
'hello'.padEnd(10, '1234');   // => 'hello12341'
```

#### Stage 3 proposals
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/stage/3
```
* `global` [proposal](https://github.com/tc39/proposal-global) - modules [`esnext.global`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.global.js)
```js
global -> object
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/global
```
[*Examples*](http://goo.gl/gEqMl7):
```js
global.Array === Array; // => true
```
* `Promise#finally` [proposal](https://github.com/tc39/proposal-promise-finally) - module [`esnext.promise.finally`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.promise.finally.js)
```js
Promise
  #finally(onFinally()) -> promise
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/promise/finally
```
[*Examples*](https://goo.gl/AhyBbJ):
```js
Promise.resolve(42).finally(() => console.log('You will see it anyway'));

Promise.reject(42).finally(() => console.log('You will see it anyway'));
```
* `Symbol.asyncIterator` for [async iteration proposal](https://github.com/tc39/proposal-async-iteration) - module [`esnext.symbol.async-iterator`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.symbol.async-iterator.js)
```js
Symbol
  .asyncIterator -> @@asyncIterator
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/symbol/async-iterator
```

#### Stage 2 proposals
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/stage/2
```
* `String#trimLeft`, `String#trimRight` / `String#trimStart`, `String#trimEnd` [proposal](https://github.com/sebmarkbage/ecmascript-string-left-right-trim) - modules [`esnext.string.trim-left`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.string.trim-right.js), [`esnext.string.trim-right`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.string.trim-right.js)
```js
String
  #trimLeft()  -> string
  #trimRight() -> string
  #trimStart() -> string
  #trimEnd()   -> string
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/string/trim-start
core-js(/library)/fn/string/trim-end
core-js(/library)/fn/string/trim-left
core-js(/library)/fn/string/trim-right
core-js(/library)/fn/string/virtual/trim-start
core-js(/library)/fn/string/virtual/trim-end
core-js(/library)/fn/string/virtual/trim-left
core-js(/library)/fn/string/virtual/trim-right
```
[*Examples*](http://goo.gl/Er5lMJ):
```js
'   hello   '.trimLeft();  // => 'hello   '
'   hello   '.trimRight(); // => '   hello'
```

#### Stage 1 proposals
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/stage/1
```
* `Promise.try` [proposal](https://github.com/tc39/proposal-promise-try) - module [`esnext.promise.try`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.promise.try.js)
```js
Promise
  .try(function()) -> promise
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/promise/try
```
[*Examples*](https://goo.gl/k5GGRo):
```js
Promise.try(() => 42).then(it => console.log(`Promise, resolved as ${it}`));

Promise.try(() => { throw 42; }).catch(it => console.log(`Promise, rejected as ${it}`));
```
* `Array#flatten` and `Array#flatMap` [proposal](https://tc39.github.io/proposal-flatMap) - modules [`esnext.array.flatten`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.array.flatten.js) and [`esnext.array.flat-map`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.array.flat-map.js)
```js
Array
  #flatten(depthArg = 1) -> array
  #flatMap(fn(val, key, @), that) -> array
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/array/flatten
core-js(/library)/fn/array/flat-map
core-js(/library)/fn/array/virtual/flatten
core-js(/library)/fn/array/virtual/flat-map
```
[*Examples*](https://goo.gl/jTXsZi):
```js
[1, [2, 3], [4, 5]].flatten();    // => [1, 2, 3, 4, 5]
[1, [2, [3, [4]]], 5].flatten();  // => [1, 2, [3, [4]], 5]
[1, [2, [3, [4]]], 5].flatten(3); // => [1, 2, 3, 4, 5]

[{a: 1, b: 2}, {a: 3, b: 4}, {a: 5, b: 6}].flatMap(it => [it.a, it.b]); // => [1, 2, 3, 4, 5, 6]
```
* `.of` and `.from` methods on collection constructors [proposal](https://github.com/tc39/proposal-setmap-offrom) - modules [`esnext.set.of`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.set.of.js), [`esnext.set.from`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.set.from.js), [`esnext.map.of`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.map.of.js), [`esnext.map.from`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.map.from.js), [`esnext.weak-set.of`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.weak-set.of.js), [`esnext.weak-set.from`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.weak-set.from.js), [`esnext.weak-map.of`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.weak-map.of.js), [`esnext.weak-map.from`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.weak-map.from.js)
```js
Set
  .of(...args) -> set
  .from(iterable, mapFn(val, index)?, that?) -> set
Map
  .of(...args) -> map
  .from(iterable, mapFn(val, index)?, that?) -> map
WeakSet
  .of(...args) -> weakset
  .from(iterable, mapFn(val, index)?, that?) -> weakset
WeakMap
  .of(...args) -> weakmap
  .from(iterable, mapFn(val, index)?, that?) -> weakmap
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/set/of
core-js(/library)/fn/set/from
core-js(/library)/fn/map/of
core-js(/library)/fn/map/from
core-js(/library)/fn/weak-set/of
core-js(/library)/fn/weak-set/from
core-js(/library)/fn/weak-map/of
core-js(/library)/fn/weak-map/from
```
[*Examples*](https://goo.gl/mSC7eU):
```js
Set.of(1, 2, 3, 2, 1); // => Set {1, 2, 3}

Map.from([[1, 2], [3, 4]], ([key, val]) => [key ** 2, val ** 2]); // => Map {1: 4, 9: 16}
```
* `String#matchAll` [proposal](https://github.com/tc39/String.prototype.matchAll) - module [`esnext.string.match-all`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.string.match-all.js)
```js
String
  #matchAll(regexp) -> iterator
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/string/match-all
core-js(/library)/fn/string/virtual/match-all
```
[*Examples*](http://goo.gl/6kp9EB):
```js
for(let [_, d, D] of '1111a2b3cccc'.matchAll(/(\d)(\D)/)){
  console.log(d, D); // => 1 a, 2 b, 3 c
}
```
* `Observable` [proposal](https://github.com/zenparsing/es-observable) - modules [`esnext.observable`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.observable.js) and [`esnext.symbol.observable`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.symbol.observable.js)
```js
new Observable(fn)             -> observable
  #subscribe(observer)         -> subscription
  #forEach(fn)                 -> promise
  #@@observable()              -> @
  .of(...items)                -> observable
  .from(observable | iterable) -> observable
  .@@species                   -> @
Symbol
  .observable                  -> @@observable
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/observable
core-js(/library)/fn/symbol/observable
```
[*Examples*](http://goo.gl/1LDywi):
```js
new Observable(observer => {
  observer.next('hello');
  observer.next('world');
  observer.complete();
}).forEach(it => console.log(it))
  .then(_ => console.log('!'));
```
* `Math.{clamp, DEG_PER_RAD, degrees, fscale, rad-per-deg, radians, scale}` 
  [proposal](https://github.com/rwaldron/proposal-math-extensions) - modules 
  [`esnext.math.clamp`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.clamp.js), 
  [`esnext.math.DEG_PER_RAD`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.DEG_PER_RAD.js), 
  [`esnext.math.degrees`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.degrees.js),
  [`esnext.math.fscale`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.fscale.js), 
  [`esnext.math.RAD_PER_DEG`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.RAD_PER_DEG.js), 
  [`esnext.math.radians`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.radians.js) and
  [`esnext.math.scale`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.scale.js)
```js
Math
  .DEG_PER_RAD -> number
  .RAD_PER_DEG -> number
  .clamp(x, lower, upper) -> number
  .degrees(radians) -> number
  .fscale(x, inLow, inHigh, outLow, outHigh) -> number
  .radians(degrees) -> number
  .scale(x, inLow, inHigh, outLow, outHigh) -> number
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/math/clamp
core-js(/library)/fn/math/deg-per-rad
core-js(/library)/fn/math/degrees
core-js(/library)/fn/math/fscale
core-js(/library)/fn/math/rad-per-deg
core-js(/library)/fn/math/radians
core-js(/library)/fn/math/scale
```
* `Math.signbit` [proposal](http://jfbastien.github.io/papers/Math.signbit.html) - module [`esnext.math.signbit`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.signbit.js)
```js
Math
  .signbit(x) -> bool
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/math/signbit
```
[*Examples*](http://es.zloirock.ru/):
```js
Math.signbit(NaN); // => NaN
Math.signbit(1);   // => true
Math.signbit(-1);  // => false
Math.signbit(0);   // => true
Math.signbit(-0);  // => false
```

#### Stage 0 proposals
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/stage/0
```
* `String#at` [proposal](https://github.com/mathiasbynens/String.prototype.at) - module [`esnext.string.at`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.string.at.js)
```js
String
  #at(index) -> string
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/string/at
core-js(/library)/fn/string/virtual/at
```
[*Examples*](http://goo.gl/XluXI8):
```js
'a𠮷b'.at(1);        // => '𠮷'
'a𠮷b'.at(1).length; // => 2
```
* `Math.{iaddh, isubh, imulh, umulh}` [proposal](https://gist.github.com/BrendanEich/4294d5c212a6d2254703) - modules [`esnext.math.iaddh`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.iaddh.js), [`esnext.math.isubh`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.isubh.js), [`esnext.math.imulh`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.imulh.js) and [`esnext.math.umulh`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.math.umulh.js)
```js
Math
  .iaddh(lo0, hi0, lo1, hi1) -> int32
  .isubh(lo0, hi0, lo1, hi1) -> int32
  .imulh(a, b) -> int32
  .umulh(a, b) -> uint32
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/math/iaddh
core-js(/library)/fn/math/isubh
core-js(/library)/fn/math/imulh
core-js(/library)/fn/math/umulh
```
* `global.asap`, [TC39 discussion](https://github.com/rwaldron/tc39-notes/blob/master/es/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask), module [`esnext.asap`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.asap.js)
```js
asap(fn) -> void
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/asap
```
[*Examples*](http://goo.gl/tx3SRK):
```js
asap(() => console.log('called as microtask'));
```

#### Pre-stage 0 proposals
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/stage/pre
```
* `Reflect` metadata [proposal](https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md) - modules [`esnext.reflect.define-metadata`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.reflect.define-metadata.js), [`esnext.reflect.delete-metadata`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.reflect.delete-metadata.js), [`esnext.reflect.get-metadata`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.reflect.get-metadata.js), [`esnext.reflect.get-metadata-keys`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.reflect.get-metadata-keys.js), [`esnext.reflect.get-own-metadata`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.reflect.get-own-metadata.js), [`esnext.reflect.get-own-metadata-keys`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.reflect.get-own-metadata-keys.js), [`esnext.reflect.has-metadata`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.reflect.has-metadata.js), [`esnext.reflect.has-own-metadata`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.reflect.has-own-metadata.js) and [`esnext.reflect.metadata`](https://github.com/zloirock/core-js/blob/v3/modules/esnext.reflect.metadata.js).
```js
Reflect
  .defineMetadata(metadataKey, metadataValue, target, propertyKey?) -> void
  .getMetadata(metadataKey, target, propertyKey?) -> var
  .getOwnMetadata(metadataKey, target, propertyKey?) -> var
  .hasMetadata(metadataKey, target, propertyKey?) -> bool
  .hasOwnMetadata(metadataKey, target, propertyKey?) -> bool
  .deleteMetadata(metadataKey, target, propertyKey?) -> bool
  .getMetadataKeys(target, propertyKey?) -> array
  .getOwnMetadataKeys(target, propertyKey?) -> array
  .metadata(metadataKey, metadataValue) -> decorator(target, targetKey?) -> void
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/reflect/define-metadata
core-js(/library)/fn/reflect/delete-metadata
core-js(/library)/fn/reflect/get-metadata
core-js(/library)/fn/reflect/get-metadata-keys
core-js(/library)/fn/reflect/get-own-metadata
core-js(/library)/fn/reflect/get-own-metadata-keys
core-js(/library)/fn/reflect/has-metadata
core-js(/library)/fn/reflect/has-own-metadata
core-js(/library)/fn/reflect/metadata
```
[*Examples*](http://goo.gl/KCo3PS):
```js
var O = {};
Reflect.defineMetadata('foo', 'bar', O);
Reflect.ownKeys(O);               // => []
Reflect.getOwnMetadataKeys(O);    // => ['foo']
Reflect.getOwnMetadata('foo', O); // => 'bar'
```

### Web standards
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/web
```
#### setTimeout / setInterval
Module [`web.timers`](https://github.com/zloirock/core-js/blob/v3/modules/web.timers.js). Additional arguments fix for IE9-.
```js
setTimeout(fn(...args), time, ...args) -> id
setInterval(fn(...args), time, ...args) -> id
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/web/timers
core-js(/library)/fn/set-timeout
core-js(/library)/fn/set-interval
```
```js
// Before:
setTimeout(log.bind(null, 42), 1000);
// After:
setTimeout(log, 1000, 42);
```
#### setImmediate
Module [`web.immediate`](https://github.com/zloirock/core-js/blob/v3/modules/web.immediate.js). [`setImmediate` proposal](https://developer.mozilla.org/en-US/docs/Web/API/Window.setImmediate) polyfill.
```js
setImmediate(fn(...args), ...args) -> id
clearImmediate(id) -> void
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/web/immediate
core-js(/library)/fn/set-immediate
core-js(/library)/fn/clear-immediate
```
[*Examples*](http://goo.gl/6nXGrx):
```js
setImmediate(function(arg1, arg2){
  console.log(arg1, arg2); // => Message will be displayed with minimum delay
}, 'Message will be displayed', 'with minimum delay');

clearImmediate(setImmediate(function(){
  console.log('Message will not be displayed');
}));
```
#### Iterable DOM collections
Some DOM collections should have [iterable interface](https://heycam.github.io/webidl/#idl-iterable) or should be [inherited from `Array`](https://heycam.github.io/webidl/#LegacyArrayClass). That mean they should have `keys`, `values`, `entries` and `@@iterator` methods for iteration. So add them. Module [`web.dom.iterable`](https://github.com/zloirock/core-js/blob/v3/modules/web.dom.iterable.js):
```js
{
  CSSRuleList,
  CSSStyleDeclaration,
  CSSValueList,
  ClientRectList,
  DOMRectList,
  DOMStringList,
  DOMTokenList,
  DataTransferItemList,
  FileList,
  HTMLAllCollection,
  HTMLCollection,
  HTMLFormElement,
  HTMLSelectElement,
  MediaList,
  MimeTypeArray,
  NamedNodeMap,
  NodeList,
  PaintRequestList,
  Plugin,
  PluginArray,
  SVGLengthList,
  SVGNumberList,
  SVGPathSegList,
  SVGPointList,
  SVGStringList,
  SVGTransformList,
  SourceBufferList,
  StyleSheetList,
  TextTrackCueList,
  TextTrackList,
  TouchList
}
  #@@iterator() -> iterator (values)

{
  DOMTokenList,
  NodeList
}
  #values()  -> iterator
  #keys()    -> iterator
  #entries() -> iterator
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/web/dom-collections
core-js(/library)/fn/dom-collections/iterator
```
[*Examples*](http://goo.gl/lfXVFl):
```js
for(var {id} of document.querySelectorAll('*')){
  if(id)console.log(id);
}

for(var [index, {id}] of document.querySelectorAll('*').entries()){
  if(id)console.log(index, id);
}
```
### Iteration helpers
Modules [`core.is-iterable`](https://github.com/zloirock/core-js/blob/v3/modules/core.is-iterable.js), [`core.get-iterator`](https://github.com/zloirock/core-js/blob/v3/modules/core.get-iterator.js), [`core.get-iterator-method`](https://github.com/zloirock/core-js/blob/v3/modules/core.get-iterator-method.js) - helpers for check iterability / get iterator in the `library` version or, for example, for `arguments` object:
```js
core
  .isIterable(var) -> bool
  .getIterator(iterable) -> iterator
  .getIteratorMethod(var) -> function | undefined
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(/library)/fn/is-iterable
core-js(/library)/fn/get-iterator
core-js(/library)/fn/get-iterator-method
```
[*Examples*](http://goo.gl/SXsM6D):
```js
var list = (function(){
  return arguments;
})(1, 2, 3);

console.log(core.isIterable(list)); // true;

var iter = core.getIterator(list);
console.log(iter.next().value); // 1
console.log(iter.next().value); // 2
console.log(iter.next().value); // 3
console.log(iter.next().value); // undefined

core.getIterator({});   // TypeError: [object Object] is not iterable!

var iterFn = core.getIteratorMethod(list);
console.log(typeof iterFn);     // 'function'
var iter = iterFn.call(list);
console.log(iter.next().value); // 1
console.log(iter.next().value); // 2
console.log(iter.next().value); // 3
console.log(iter.next().value); // undefined

console.log(core.getIteratorMethod({})); // undefined
```

## Missing polyfills
- ES `JSON` is missing now only in IE7- and never will it be added to `core-js`, if you need it in these old browsers, many implementations are available, for example, [json3](https://github.com/bestiejs/json3).
- ES `String#normalize` is not a very useful feature, but this polyfill will be very large. If you need it, you can use [unorm](https://github.com/walling/unorm/).
- ES `Proxy` can't be polyfilled, but for Node.js / Chromium with additional flags you can try [harmony-reflect](https://github.com/tvcutsem/harmony-reflect) for adapt old style `Proxy` API to final ES2015 version.
- ES logic for `@@isConcatSpreadable` and `@@species` (in most places) can be polyfilled without problems, but it will cause a serious slowdown in popular cases in some engines. It will be polyfilled when it will be implemented in modern engines.
- ES `SIMD` proposal. `core-js` doesn't add polyfill of this feature because of large size and some other reasons. You can use [this polyfill](https://github.com/tc39/ecmascript_simd/blob/master/src/ecmascript_simd.js).
- `window.fetch` is not a cross-platform feature, in some environments it makes no sense. For this reason, I don't think it should be in `core-js`. Looking at a large number of requests it *may be*  added in the future. Now you can use, for example, [this polyfill](https://github.com/github/fetch).
- ECMA-402 `Intl` is missed because of size. You can use [this polyfill](https://github.com/andyearnshaw/Intl.js/).
