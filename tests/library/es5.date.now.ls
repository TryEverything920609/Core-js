{module, test} = QUnit
module \ES5

test 'Date.now' (assert)->
  {now} = core.Date
  assert.isFunction now
  assert.ok +new Date - now! < 10, 'Date.now() ~ +new Date'