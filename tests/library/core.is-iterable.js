var test = QUnit.test;

test('core.isIterable', function (assert) {
  var isIterable = core.isIterable;
  assert.isFunction(isIterable);
  assert.ok(isIterable(createIterable([])));
  assert.ok(isIterable([]));
  assert.ok(isIterable(function () {
    return arguments;
  }()));
  assert.ok(isIterable(Array.prototype));
  assert.ok(!isIterable({}));
});
