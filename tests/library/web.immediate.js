import { GLOBAL } from '../helpers/constants';
import { timeLimitedPromise } from '../helpers/helpers';

const { setImmediate, clearImmediate } = core;

QUnit.test('setImmediate / clearImmediate', assert => {
  let called = false;
  assert.expect(6);
  assert.isFunction(setImmediate, 'setImmediate is function');
  assert.isFunction(clearImmediate, 'clearImmediate is function');
  timeLimitedPromise(1e3, res => {
    setImmediate(() => {
      called = true;
      res();
    });
  }).then(() => {
    assert.ok(true, 'setImmediate works');
  }).catch(() => {
    assert.ok(false, 'setImmediate works');
  }).then(assert.async());
  assert.strictEqual(called, false, 'setImmediate is async');
  timeLimitedPromise(1e3, res => {
    setImmediate((a, b) => {
      res(a + b);
    }, 'a', 'b');
  }).then(it => {
    assert.strictEqual(it, 'ab', 'setImmediate works with additional args');
  }).catch(() => {
    assert.ok(false, 'setImmediate works with additional args');
  }).then(assert.async());
  timeLimitedPromise(50, res => {
    clearImmediate(setImmediate(res));
  }).then(() => {
    assert.ok(false, 'clearImmediate works');
  }).catch(() => {
    assert.ok(true, 'clearImmediate works');
  }).then(assert.async());
});

const now = Date.now || function () {
  return +new Date();
};

function perf() {
  setTimeout(() => {
    let x = 0;
    const time = now();
    function inc() {
      setImmediate(() => {
        x = x + 1;
        if (now() - time < 5e3) {
          inc();
        } else if (GLOBAL.console) {
          // eslint-disable-next-line no-console
          console.log(`setImmediate: ${ x / 5 } per second`);
        }
      });
    }
    inc();
  }, 5e3);
}

if (typeof window != 'undefined' && window !== null) {
  window.onload = perf;
} else {
  perf();
}
