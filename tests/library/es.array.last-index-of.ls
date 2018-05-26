{module, test} = QUnit
module \ES

test 'Array#lastIndexOf' (assert)!->
  {lastIndexOf} = core.Array
  assert.isFunction lastIndexOf
  assert.same 2,  lastIndexOf [1 1 1], 1
  assert.same -1, lastIndexOf [1 2 3], 3 1
  assert.same 1,  lastIndexOf [1 2 3], 2 1
  assert.same -1, lastIndexOf [1 2 3], 2 -3
  assert.same -1, lastIndexOf [1 2 3], 1, -4
  assert.same 1,  lastIndexOf [1 2 3], 2 -2
  assert.same -1, lastIndexOf [NaN], NaN
  assert.same 1,  lastIndexOf [1 2 3]concat(Array 2), 2
  assert.same 0,  lastIndexOf([1], 1, -0), "shouldn't return negative zero"
  if STRICT
    assert.throws (!-> lastIndexOf null, 0), TypeError
    assert.throws (!-> lastIndexOf void, 0), TypeError