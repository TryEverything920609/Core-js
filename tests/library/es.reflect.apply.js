QUnit.test('Reflect.apply', assert => {
  const { apply } = core.Reflect;
  assert.isFunction(apply);
  assert.arity(apply, 3);
  if ('name' in apply) {
    assert.name(apply, 'apply');
  }
  assert.strictEqual(apply(Array.prototype.push, [1, 2], [3, 4, 5]), 5);
  function F(a, b, c) {
    return a + b + c;
  }
  F.apply = 42;
  assert.strictEqual(apply(F, null, ['foo', 'bar', 'baz']), 'foobarbaz', 'works with redefined apply');
  assert.throws(() => {
    return apply(42, null, []);
  }, TypeError, 'throws on primitive');
  assert.throws(() => {
    return apply(() => { /* empty */ }, null);
  }, TypeError, 'throws without third argument');
  assert.throws(() => {
    return apply(() => { /* empty */ }, null, '123');
  }, TypeError, 'throws on primitive as third argument');
});
