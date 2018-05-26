var test = QUnit.test;

test('Reflect.set', function (assert) {
  var set = core.Reflect.set;
  var defineProperty = core.Object.defineProperty;
  var getOwnPropertyDescriptor = core.Object.getOwnPropertyDescriptor;
  var create = core.Object.create;
  assert.isFunction(set);
  if ('name' in set) {
    assert.name(set, 'set');
  }
  var object = {};
  assert.ok(set(object, 'quux', 654), true);
  assert.strictEqual(object.quux, 654);
  var target = {};
  var receiver = {};
  set(target, 'foo', 1, receiver);
  assert.strictEqual(target.foo, undefined, 'target.foo === undefined');
  assert.strictEqual(receiver.foo, 1, 'receiver.foo === 1');
  if (DESCRIPTORS) {
    defineProperty(receiver, 'bar', {
      value: 0,
      writable: true,
      enumerable: false,
      configurable: true
    });
    set(target, 'bar', 1, receiver);
    assert.strictEqual(receiver.bar, 1, 'receiver.bar === 1');
    assert.strictEqual(getOwnPropertyDescriptor(receiver, 'bar').enumerable, false, 'enumerability not overridden');
    var out = null;
    target = create(defineProperty({ z: 3 }, 'w', {
      set: function () {
        out = this;
      }
    }), {
      x: {
        value: 1,
        writable: true,
        configurable: true
      },
      y: {
        set: function () {
          out = this;
        }
      },
      c: {
        value: 1,
        writable: false,
        configurable: false
      }
    });
    assert.strictEqual(set(target, 'x', 2, target), true, 'set x');
    assert.strictEqual(target.x, 2, 'set x');
    out = null;
    assert.strictEqual(set(target, 'y', 2, target), true, 'set y');
    assert.strictEqual(out, target, 'set y');
    assert.strictEqual(set(target, 'z', 4, target), true);
    assert.strictEqual(target.z, 4, 'set z');
    out = null;
    assert.strictEqual(set(target, 'w', 1, target), true, 'set w');
    assert.strictEqual(out, target, 'set w');
    assert.strictEqual(set(target, 'u', 0, target), true, 'set u');
    assert.strictEqual(target.u, 0, 'set u');
    assert.strictEqual(set(target, 'c', 2, target), false, 'set c');
    assert.strictEqual(target.c, 1, 'set c');
  }
  assert['throws'](function () {
    set(42, 'q', 42);
  }, TypeError, 'throws on primitive');
});
