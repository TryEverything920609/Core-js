QUnit.test('Number.isInteger', function (assert) {
  var isInteger = Number.isInteger;
  var create = Object.create;
  assert.isFunction(isInteger);
  assert.name(isInteger, 'isInteger');
  assert.arity(isInteger, 1);
  assert.looksNative(isInteger);
  assert.nonEnumerable(Number, 'isInteger');
  var integers = [
    1,
    -1,
    Math.pow(2, 16),
    Math.pow(2, 16) - 1,
    Math.pow(2, 31),
    Math.pow(2, 31) - 1,
    Math.pow(2, 32),
    Math.pow(2, 32) - 1,
    -0
  ];
  for (var i = 0, length = integers.length; i < length; ++i) {
    var val = integers[i];
    assert.ok(isInteger(val), 'isInteger ' + typeof val + ' ' + val);
  }
  var notIntegers = [
    NaN,
    0.1,
    Infinity,
    'NaN',
    '5',
    false,
    new Number(NaN),
    new Number(Infinity),
    new Number(5),
    new Number(0.1),
    undefined,
    null,
    {},
    function () { /* empty */ }
  ];
  for (var i = 0, length = notIntegers.length; i < length; ++i) {
    var val = notIntegers[i];
    assert.ok(!isInteger(val), 'not isInteger ' + typeof val + ' ' + val);
  }
  assert.ok(!isInteger(create(null)), 'Number.isInteger(Object.create(null)) -> false');
});
