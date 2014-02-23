{isFunction, isNative} = Function
test 'Symbol' !->
  ok isFunction(global.Symbol), 'Is function'
  s1 = Symbol 'foo'
  s2 = Symbol 'foo'
  ok s1 isnt s2, 'Symbol("foo") !== Symbol("foo")'
  o = {}
  o[s1] = 42
  ok o[s1] is 42, 'Symbol() work as key'
  ok o[s2] isnt 42, 'Various symbols from one description are various keys'
  if isNative Object.defineProperty
    count = 0
    for i of o => count++
    ok count is 0, 'object[Symbol()] is not enumerable'