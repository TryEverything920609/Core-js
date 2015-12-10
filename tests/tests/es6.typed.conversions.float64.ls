{module, test} = QUnit
module \ES6
DESCRIPTORS and test 'Float64 conversions', !(assert)~>
  NAME  = \Float64
  ARRAY = NAME + \Array
  Typed = global[ARRAY]
  SET   = \set + NAME
  GET   = \get + NAME
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

  typed = new Typed 1
  uint8 = new Uint8Array typed.buffer
  view  = new DataView typed.buffer

  viewFrom = -> new DataView new Uint8Array(it).buffer
  z = -> if it is 0 and 1 / it is -Infinity => '-0' else it
  
  for [value, conversion, little] in data
    
    big = little.slice!reverse!
    rep = if LITTLE_ENDIAN => little else big

    typed[0] = value
    assert.same typed[0], conversion, "#ARRAY #{z value} -> #{z conversion}"
    assert.arrayEqual uint8, rep, "#ARRAY #{z value} -> [#rep]"

    view[SET] 0, value
    assert.arrayEqual uint8, big, "view.#SET(0, #{z value}) -> [#big]"
    assert.same viewFrom(big)[GET](0), conversion, "view{#big}.#GET(0) -> #{z conversion}"
    view[SET] 0, value, no
    assert.arrayEqual uint8, big, "view.#SET(0, #{z value}, false) -> [#big]"
    assert.same viewFrom(big)[GET](0, no), conversion, "view{#big}.#GET(0, false) -> #{z conversion}"
    view[SET] 0, value, on
    assert.arrayEqual uint8, little, "view.#SET(0, #{z value}, true) -> [#little]"
    assert.same viewFrom(little)[GET](0, on), conversion, "view{#little}.#GET(0, false) -> #{z conversion}"

  typed[0] = NaN
  assert.same typed[0], NaN, "NaN -> NaN"