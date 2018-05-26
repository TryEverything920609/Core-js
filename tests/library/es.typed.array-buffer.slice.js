var test = QUnit.test;

test('ArrayBuffer#slice', function (assert) {
  var ArrayBuffer = core.ArrayBuffer;
  var slice = ArrayBuffer.slice;
  assert.isFunction(slice);
  var buffer = arrayToBuffer([1, 2, 3, 4, 5]);
  assert.ok(buffer instanceof ArrayBuffer, 'correct buffer');
  assert.ok(slice(buffer) !== buffer, 'returns new buffer');
  assert.ok(slice(buffer) instanceof ArrayBuffer, 'correct instance');
  assert.arrayEqual(bufferToArray(slice(buffer)), [1, 2, 3, 4, 5]);
  assert.arrayEqual(bufferToArray(slice(buffer, 1, 3)), [2, 3]);
  assert.arrayEqual(bufferToArray(slice(buffer, 1, undefined)), [2, 3, 4, 5]);
  assert.arrayEqual(bufferToArray(slice(buffer, 1, -1)), [2, 3, 4]);
  assert.arrayEqual(bufferToArray(slice(buffer, -2, -1)), [4]);
  assert.arrayEqual(bufferToArray(slice(buffer, -2, -3)), []);
});
