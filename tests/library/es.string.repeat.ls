{module, test} = QUnit
module \ES

test 'String#repeat' (assert)!->
  {repeat} = core.String
  assert.isFunction repeat
  assert.strictEqual repeat('qwe' 3), \qweqweqwe
  assert.strictEqual repeat('qwe' 2.5), \qweqwe
  assert.throws (!-> repeat 'qwe' -1), RangeError
  assert.throws (!-> repeat 'qwe' Infinity), RangeError
  if STRICT
    assert.throws (!-> repeat null, 1), TypeError
    assert.throws (!-> repeat void, 1), TypeError