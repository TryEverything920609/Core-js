import { GLOBAL } from '../helpers/constants';

if (GLOBAL.JSON) {
  QUnit.test('Well‑formed JSON.stringify', assert => {
    const { stringify } = JSON;
    assert.isFunction(stringify);
    assert.arity(stringify, 3);
    assert.name(stringify, 'stringify');
    assert.looksNative(stringify);

    assert.same(stringify({ foo: 'bar' }), '{"foo":"bar"}', 'basic');
    assert.same(stringify('\uDEAD'), '"\\udead"', 'r1');
    assert.same(stringify('\uDF06\uD834'), '"\\udf06\\ud834"', 'r2');
    assert.same(stringify('\uDF06ab\uD834'), '"\\udf06ab\\ud834"', 'r3');
    assert.same(stringify('𠮷'), '"𠮷"', 'r4');
  });
}
