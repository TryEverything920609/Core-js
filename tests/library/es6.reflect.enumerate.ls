{module, test} = QUnit
module \ES6

{defineProperty} = core.Object
{from} = core.Array
MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

test 'Reflect.enumerate' (assert)->
  {enumerate} = core.Reflect
  {iterator} = core.Symbol
  assert.ok typeof! enumerate is \Function, 'Reflect.enumerate is function'
  assert.strictEqual enumerate.length, 1, 'arity is 1'
  if \name of enumerate
    assert.strictEqual enumerate.name, \enumerate, 'name is "enumerate"'
  obj = {foo: 1, bar: 2}
  i = enumerate obj
  assert.ok iterator of i, 'returns iterator'
  assert.deepEqual from(i), <[foo bar]>, 'bisic'
  obj = {q: 1, w: 2, e: 3}
  i = enumerate obj
  delete obj.w
  assert.deepEqual from(i), <[q e]>, 'ignore holes'
  obj = {q: 1, w: 2, e: 3} with {a: 4, s: 5, d: 6}
  assert.deepEqual from(enumerate obj).sort!, <[a d e q s w]>, 'works with prototype'
  assert.throws (-> enumerate 42), TypeError, 'throws on primitive'