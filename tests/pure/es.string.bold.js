import bold from 'core-js-pure/fn/string/bold';

QUnit.test('String#bold', assert => {
  assert.isFunction(bold);
  assert.same(bold('a'), '<b>a</b>', 'lower case');
});
