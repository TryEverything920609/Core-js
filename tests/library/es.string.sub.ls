{module, test} = QUnit
module \ES

test 'String#sub' (assert)!->
  {sub} = core.String
  assert.isFunction sub
  assert.same sub(\a), '<sub>a</sub>', 'lower case'