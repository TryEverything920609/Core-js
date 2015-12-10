{module, test} = QUnit
module \ES6
DESCRIPTORS and test 'Float64Array conversions', !(assert)~>
  data = [
    [0,0,[0,0,0,0,0,0,0,0]]
    [-0,-0,[0,0,0,0,0,0,0,128]]
    [1,1,[0,0,0,0,0,0,240,63]]
    [-1,-1,[0,0,0,0,0,0,240,191]]
    [1.1,1.1,[154,153,153,153,153,153,241,63]]
    [-1.1,-1.1,[154,153,153,153,153,153,241,191]]
    [1.9,1.9,[102,102,102,102,102,102,254,63]]
    [-1.9,-1.9,[102,102,102,102,102,102,254,191]]
    [127,127,[0,0,0,0,0,192,95,64]]
    [-127,-127,[0,0,0,0,0,192,95,192]]
    [128,128,[0,0,0,0,0,0,96,64]]
    [-128,-128,[0,0,0,0,0,0,96,192]]
    [255,255,[0,0,0,0,0,224,111,64]]
    [-255,-255,[0,0,0,0,0,224,111,192]]
    [255.1,255.1,[51,51,51,51,51,227,111,64]]
    [255.9,255.9,[205,204,204,204,204,252,111,64]]
    [256,256,[0,0,0,0,0,0,112,64]]
    [32767,32767,[0,0,0,0,192,255,223,64]]
    [-32767,-32767,[0,0,0,0,192,255,223,192]]
    [32768,32768,[0,0,0,0,0,0,224,64]]
    [-32768,-32768,[0,0,0,0,0,0,224,192]]
    [65535,65535,[0,0,0,0,224,255,239,64]]
    [65536,65536,[0,0,0,0,0,0,240,64]]
    [65537,65537,[0,0,0,0,16,0,240,64]]
    [65536.54321,65536.54321,[14,248,252,176,8,0,240,64]]
    [-65536.54321,-65536.54321,[14,248,252,176,8,0,240,192]]
    [2147483647,2147483647,[0,0,192,255,255,255,223,65]]
    [-2147483647,-2147483647,[0,0,192,255,255,255,223,193]]
    [2147483648,2147483648,[0,0,0,0,0,0,224,65]]
    [-2147483648,-2147483648,[0,0,0,0,0,0,224,193]]
    [2147483649,2147483649,[0,0,32,0,0,0,224,65]]
    [-2147483649,-2147483649,[0,0,32,0,0,0,224,193]]
    [4294967295,4294967295,[0,0,224,255,255,255,239,65]]
    [4294967296,4294967296,[0,0,0,0,0,0,240,65]]
    [4294967297,4294967297,[0,0,16,0,0,0,240,65]]
    [Infinity,Infinity,[0,0,0,0,0,0,240,127]]
    [-Infinity,-Infinity,[0,0,0,0,0,0,240,255]]
    [-1.7976931348623157e+308,-1.7976931348623157e+308,[255,255,255,255,255,255,239,255]]
    [1.7976931348623157e+308,1.7976931348623157e+308,[255,255,255,255,255,255,239,127]]
    [5e-324,5e-324,[1,0,0,0,0,0,0,0]]
    [-5e-324,-5e-324,[1,0,0,0,0,0,0,128]]
  ]

  typed = new Float64Array 1
  z = -> if it is 0 and 1 / it is -Infinity => '-0' else it
  for it in data
    typed[0] = it[0]
    assert.same typed[0], it[1], "#{z it[0]} -> #{z it[1]}"
    assert.arrayEqual new Uint8Array(typed.buffer), (if LITTLE_ENDIAN => it[2] else it[2]reverse!), "#{z it[0]} -> #{it[2]}"

  typed[0] = NaN
  assert.same typed[0], NaN, "NaN -> NaN"