{module, test} = QUnit
module \ES6

{freeze} = Object

test 'WeakSet' (assert)->
  assert.isFunction WeakSet
  assert.name WeakSet, \WeakSet
  assert.arity WeakSet, 0
  assert.looksNative WeakSet
  assert.ok \add    of WeakSet::, 'add in WeakSet.prototype'
  assert.ok \delete of WeakSet::, 'delete in WeakSet.prototype'
  assert.ok \has    of WeakSet::, 'has in WeakSet.prototype'
  assert.ok new WeakSet instanceof WeakSet, 'new WeakSet instanceof WeakSet'
  assert.ok new WeakSet(createIterable [a = {}]).has(a), 'Init from iterable'
  assert.ok (new WeakSet!
    ..add freeze f = {}
  ).has(f), 'Support frozen objects'
  S = new WeakSet
  S.add freeze f = {}
  assert.strictEqual S.has(f), on
  S.delete f
  assert.strictEqual S.has(f), no
  # return #throw
  done = no
  iter = createIterable [null, 1, 2], return: -> done := on
  try => new WeakSet iter
  assert.ok done, '.return #throw'
  assert.ok !(\clear of WeakSet::), 'should not contains `.clear` method'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[Symbol?iterator] = ->
    done := on
    [][Symbol?iterator]call @
  new WeakSet a
  assert.ok done

test 'WeakSet#add' (assert)->
  assert.isFunction WeakSet::add
  assert.name WeakSet::add, \add
  assert.arity WeakSet::add, 1
  assert.looksNative WeakSet::add
  assert.ok new WeakSet!add(a = {}), 'works with object as keys'
  assert.ok (try new WeakSet!add(42); no; catch => on), 'throws with primitive keys'
  wset = new WeakSet!
  assert.same wset.add({}), wset, 'return this'

test 'WeakSet#delete' (assert)->
  assert.isFunction WeakSet::delete
  NATIVE? and #assert.name WeakSet::delete, \delete # can't be polyfilled in some environments
  assert.arity WeakSet::delete, 1
  assert.looksNative WeakSet::delete
  S = new WeakSet!
    ..add a = {}
    ..add b = {}
  assert.ok S.has(a) && S.has(b), 'WeakSet has values before .delete()'
  S.delete a
  assert.ok !S.has(a) && S.has(b), 'WeakSet has`nt value after .delete()'

test 'WeakSet#has' (assert)->
  assert.isFunction WeakSet::has
  assert.name WeakSet::has, \has
  assert.arity WeakSet::has, 1
  assert.looksNative WeakSet::has
  M = new WeakSet!
  assert.ok not M.has({}), 'WeakSet has`nt value'
  M.add a = {}
  assert.ok M.has(a), 'WeakSet has value after .add()'
  M.delete a
  assert.ok not M.has(a), 'WeakSet has`nt value after .delete()'

test 'WeakSet::@@toStringTag' (assert)->
  assert.strictEqual WeakSet::[Symbol?toStringTag], \WeakSet, 'WeakSet::@@toStringTag is `WeakSet`'