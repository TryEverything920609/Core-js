'use strict';
var $                 = require('./$')
  , ctx               = require('./$.ctx')
  , cof               = require('./$.cof')
  , $def              = require('./$.def')
  , invoke            = require('./$.invoke')
  , assertObject      = require('./$.assert').obj
// Safari has byggy iterators w/o `next`
  , BUGGY             = 'keys' in [] && !('next' in [].keys())
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = {}
  , IteratorPrototype = {};
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}
function createIterator(Constructor, NAME, next, proto){
  Constructor.prototype = $.create(proto || $iter.prototype, {next: $.desc(1, next)});
  cof.set(Constructor, NAME + ' Iterator');
}
function defineIterator(Constructor, NAME, value, DEFAULT){
  var proto = Constructor.prototype
    , iter  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || (DEFAULT && proto[DEFAULT]) || value;
  if($.FW){
    // Define iterator
    setIterator(proto, iter);
    if(iter !== value){
      var iterProto = $.getProto(iter.call(new Constructor));
      // Set @@toStringTag to native iterators
      cof.set(iterProto, NAME + ' Iterator', true);
      // FF fix
      $.has(proto, FF_ITERATOR) && setIterator(iterProto, $.that);
    }
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = $.that;
  return iter;
}
function getIterator(it){
  var Symbol  = $.g.Symbol
    , ext     = it[Symbol && Symbol.iterator || FF_ITERATOR]
    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
  return assertObject(getIter.call(it));
}
function stepCall(fn, value, entries){
  return entries ? invoke(fn, value) : fn(value);
}
function closeIterator(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)ret.call(iterator);
}
function safeIterExec(exec, iterator){
  try {
    return exec(iterator);
  } catch(e){
    closeIterator(iterator);
    throw e;
  }
}
var DANGER_CLOSING = true;
try {
  var iter = [1].keys();
  iter['return'] = function(){ DANGER_CLOSING = false };
  Array.from(iter, function(){ throw 2 });
} catch(e){}
var $iter = module.exports = {
  BUGGY: BUGGY,
  DANGER_CLOSING: DANGER_CLOSING,
  Iterators: Iterators,
  prototype: IteratorPrototype,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  stepCall: stepCall,
  close: closeIterator,
  exec: safeIterExec,
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol
      , SYM    = Symbol && Symbol.iterator || FF_ITERATOR;
    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
  },
  get: getIterator,
  set: setIterator,
  create: createIterator,
  define: defineIterator,
  std: function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
    function createIter(kind){
      return function(){
        return new Constructor(this, kind);
      }
    }
    createIterator(Constructor, NAME, next);
    var entries = createIter('key+value')
      , values  = createIter('value')
      , proto   = Base.prototype
      , methods, key;
    if(DEFAULT == 'value')values = defineIterator(Base, NAME, values, 'values');
    else entries = defineIterator(Base, NAME, entries, 'entries');
    if(DEFAULT){
      methods = {
        entries: entries,
        keys: IS_SET ? values : createIter('key'),
        values: values
      }
      $def($def.P + $def.F * BUGGY, NAME, methods);
      if(FORCE)for(key in methods){
        if(!(key in proto))$.hide(proto, key, methods[key]);
      }
    }
  },
  forOf: function(iterable, entries, fn, that){
    safeIterExec(function(iterator){
      var f = ctx(fn, that, entries ? 2 : 1)
        , step;
      while(!(step = iterator.next()).done)if(stepCall(f, step.value, entries) === false){
        return closeIterator(iterator);
      }
    }, getIterator(iterable));
  }
};