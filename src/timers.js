/**
 * ie9- setTimeout & setInterval additional parameters fix
 * http://www.w3.org/TR/html5/webappapis.html#timers
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#timers
 * Alternatives:
 * https://developer.mozilla.org/ru/docs/Web/API/Window.setTimeout#IE_Only_Fix
 */
!function(navigator){
  function wrap(set){
    return function(fn, time /*, ...args*/){
      return set(invoke(part, slice.call(arguments, 2), isFunction(fn) ? fn : Function(fn)), time || 1);
    }
  }
  // ie9- dirty check
  if(navigator && /MSIE .\./.test(navigator.userAgent)){
    setTimeout  = wrap(setTimeout);
    setInterval = wrap(setInterval);
  }
  $defineTimer(SET_TIMEOUT, setTimeout);
  $defineTimer(SET_INTERVAL, setInterval);
}(global.navigator);