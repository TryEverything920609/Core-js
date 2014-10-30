QUnit.module \Immediate
isFunction = -> typeof! it  is \Function
that = global? && global || window
asyncTest 'setImmediate / clearImmediate' 6 !->
  ok isFunction(that.setImmediate), 'setImmediate is function'
  ok isFunction(that.clearImmediate), 'clearImmediate is function'
  var tmp1
  id = setImmediate !-> tmp1 := 42
  ok tmp1 is void, 'setImmediate is async'
  var tmp2
  setImmediate !->
    tmp2 := on
  var tmp3
  setImmediate _, \b \c <| (b, c)!->
    tmp3 := b + c
  var tmp4
  clearImmediate setImmediate !-> tmp4 := 42
  setTimeout _, 70 <| !->
    ok tmp2, 'setImmediate works'
  setTimeout _, 80 <| !->
    ok tmp3 is \bc, 'setImmediate works with additional params'
  setTimeout _, 90 <| !->
    ok tmp4 is void, 'clearImmediate works'
  setTimeout start, 100

req = ->
  setTimeout _, 5e3 <| ->
    x = 0
    now = Date.now!
    do inc = -> setImmediate ->
      x := x + 1
      if Date.now! - now < 1000 => inc!
      else console "setImmediate: #x per second"
if window? => window.onload = req else req!