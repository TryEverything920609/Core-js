{module, test} = QUnit
module \ES
# Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
# The result is computed in a way that is accurate even when the value of x is close to zero.
test 'Math.log1p' (assert)!->
  {log1p} = core.Math
  assert.isFunction log1p
  assert.same log1p(''), log1p 0
  assert.same log1p(NaN), NaN
  assert.same log1p(-2), NaN
  assert.same log1p(-1), -Infinity
  assert.same log1p(0), 0
  assert.same log1p(-0), -0
  assert.same log1p(Infinity), Infinity
  assert.epsilon log1p(5), 1.791759469228055
  assert.epsilon log1p(50), 3.9318256327243257