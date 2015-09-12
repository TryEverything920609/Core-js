{module, test} = QUnit
module \ES6

isFunction = -> typeof! it is \Function
{iterator} = Symbol

test 'Promise' (assert)->
  assert.ok isFunction((global? && global || window)Promise), 'Is function'
  assert.ok /native code/.test(Promise), 'looks like native'

test 'Promise#then' (assert)->
  assert.ok isFunction(Promise::then), 'Is function'
  assert.ok /native code/.test(Promise::then), 'looks like native'

test 'Promise#catch' (assert)->
  assert.ok isFunction(Promise::catch), 'Is function'

test 'Promise#@@toStringTag' (assert)->
  assert.ok Promise::[Symbol.toStringTag] is \Promise, 'Promise::@@toStringTag is `Promise`'

test 'Promise.all' (assert)->
  assert.ok isFunction(Promise.all), 'Is function'
  assert.ok /native code/.test(Promise.all), 'looks like native'
  # works with iterables
  passed = no
  iter = [1 2 3].values!
  next = iter~next
  iter.next = ->
    passed := on
    next!
  Promise.all iter .catch ->
  assert.ok passed, 'works with iterables'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[iterator] = ->
    done := on
    [][iterator]call @
  Promise.all a
  assert.ok done

test 'Promise.race' (assert)->
  assert.ok isFunction(Promise.race), 'Is function'
  assert.ok /native code/.test(Promise.race), 'looks like native'
  # works with iterables
  passed = no
  iter = [1 2 3].values!
  next = iter~next
  iter.next = ->
    passed := on
    next!
  Promise.race iter .catch ->
  assert.ok passed, 'works with iterables'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[iterator] = ->
    done := on
    [][iterator]call @
  Promise.race a
  assert.ok done

test 'Promise.resolve' (assert)->
  assert.ok isFunction(Promise.resolve), 'Is function'
  assert.ok /native code/.test(Promise.resolve), 'looks like native'

test 'Promise.reject' (assert)->
  assert.ok isFunction(Promise.reject), 'Is function'
  assert.ok /native code/.test(Promise.reject), 'looks like native'

if Object.setPrototypeOf
  test 'Promise subclassing' (assert)->
    # this is ES5 syntax to create a valid ES6 subclass
    SubPromise = ->
      self = new Promise it
      Object.setPrototypeOf self, SubPromise::
      self.mine = 'subclass'
      self
    Object.setPrototypeOf SubPromise, Promise
    SubPromise:: = Object.create Promise::
    SubPromise::@@ = SubPromise
    # now let's see if this works like a proper subclass.
    p1 = SubPromise.resolve 5
    assert.strictEqual p1.mine, 'subclass'
    p1 = p1.then -> assert.strictEqual it, 5
    assert.strictEqual p1.mine, 'subclass'
    p2 = new SubPromise -> it 6
    assert.strictEqual p2.mine, 'subclass'
    p2 = p2.then -> assert.strictEqual it, 6
    assert.strictEqual p2.mine, 'subclass'
    p3 = SubPromise.all [p1, p2]
    assert.strictEqual p3.mine, 'subclass'
    # double check
    assert.ok p3 instanceof Promise
    assert.ok p3 instanceof SubPromise
    # check the async values
    p3.then assert.async!, -> assert.ok it, no
