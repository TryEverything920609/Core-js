{module, test} = QUnit
module \ES6
DESCRIPTORS and test 'Uint16Array conversions', !(assert)~>
  data = [
    [0,0,[0,0]]
    [-0,0,[0,0]]
    [1,1,[1,0]]
    [-1,65535,[255,255]]
    [1.1,1,[1,0]]
    [-1.1,65535,[255,255]]
    [1.9,1,[1,0]]
    [-1.9,65535,[255,255]]
    [127,127,[127,0]]
    [-127,65409,[129,255]]
    [128,128,[128,0]]
    [-128,65408,[128,255]]
    [255,255,[255,0]]
    [-255,65281,[1,255]]
    [255.1,255,[255,0]]
    [255.9,255,[255,0]]
    [256,256,[0,1]]
    [32767,32767,[255,127]]
    [-32767,32769,[1,128]]
    [32768,32768,[0,128]]
    [-32768,32768,[0,128]]
    [65535,65535,[255,255]]
    [65536,0,[0,0]]
    [65537,1,[1,0]]
    [65536.54321,0,[0,0]]
    [-65536.54321,0,[0,0]]
    [2147483647,65535,[255,255]]
    [-2147483647,1,[1,0]]
    [2147483648,0,[0,0]]
    [-2147483648,0,[0,0]]
    [2147483649,1,[1,0]]
    [-2147483649,65535,[255,255]]
    [4294967295,65535,[255,255]]
    [4294967296,0,[0,0]]
    [4294967297,1,[1,0]]
    [Infinity,0,[0,0]]
    [-Infinity,0,[0,0]]
    [-1.7976931348623157e+308,0,[0,0]]
    [1.7976931348623157e+308,0,[0,0]]
    [5e-324,0,[0,0]]
    [-5e-324,0,[0,0]]
    [NaN,0,[0,0]]
  ]

  typed = new Uint16Array 1
  z = -> if it is 0 and 1 / it is -Infinity => '-0' else it
  for it in data
    typed[0] = it[0]
    assert.same typed[0], it[1], "#{z it[0]} -> #{z it[1]}"
    assert.arrayEqual new Uint8Array(typed.buffer), (if LITTLE_ENDIAN => it[2] else it[2]reverse!), "#{z it[0]} -> #{it[2]}"