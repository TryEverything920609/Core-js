!function(_, toLocaleString){
  // Placeholder
  $.core._ = $.path._ = $.path._ || {};

  $def(PROTO + FORCED, 'Function', {
    part: partial,
    only: function(numberArguments, that /* = @ */){
      var fn     = assert.fn(this)
        , n      = $.toLength(numberArguments)
        , isThat = arguments.length > 1;
      return function(/* ...args */){
        var length = Math.min(n, arguments.length)
          , args   = Array(length)
          , i      = 0;
        while(length > i)args[i] = arguments[i++];
        return invoke(fn, args, isThat ? that : this);
      }
    }
  });
  
  function tie(key){
    var that  = this
      , bound = {};
    return $.hide(that, _, function(key){
      if(key === undefined || !(key in that))return toLocaleString.call(that);
      return $.has(bound, key) ? bound[key] : (bound[key] = $.ctx(that[key], that, -1));
    })[_](key);
  }
  
  $.hide($.path._, 'toString', function(){
    return _;
  });
  
  $.hide(Object.prototype, _, tie);
  $.DESC || $.hide(Array.prototype, _, tie);
  // IE8- dirty hack - redefined toLocaleString is not enumerable
}($.DESC ? uid('tie') : 'toLocaleString', {}.toLocaleString);