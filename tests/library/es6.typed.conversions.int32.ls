{module, test} = QUnit
module \ES6
DESCRIPTORS and test 'Int32 conversions', !(assert)~>
  {Uint8Array, DataView} = core
  NAME  = \Int32
  ARRAY = NAME + \Array
  Typed = core[ARRAY]
  SET   = \set + NAME
  GET   = \get + NAME
  data = [
    [0,0,[0,0,0,0]]
    [-0,0,[0,0,0,0]]
    [1,1,[1,0,0,0]]
    [-1,-1,[255,255,255,255]]
    [1.1,1,[1,0,0,0]]
    [-1.1,-1,[255,255,255,255]]
    [1.9,1,[1,0,0,0]]
    [-1.9,-1,[255,255,255,255]]
    [127,127,[127,0,0,0]]
    [-127,-127,[129,255,255,255]]
    [128,128,[128,0,0,0]]
    [-128,-128,[128,255,255,255]]
    [255,255,[255,0,0,0]]
    [-255,-255,[1,255,255,255]]
    [255.1,255,[255,0,0,0]]
    [255.9,255,[255,0,0,0]]
    [256,256,[0,1,0,0]]
    [32767,32767,[255,127,0,0]]
    [-32767,-32767,[1,128,255,255]]
    [32768,32768,[0,128,0,0]]
    [-32768,-32768,[0,128,255,255]]
    [65535,65535,[255,255,0,0]]
    [65536,65536,[0,0,1,0]]
    [65537,65537,[1,0,1,0]]
    [65536.54321,65536,[0,0,1,0]]
    [-65536.54321,-65536,[0,0,255,255]]
    [2147483647,2147483647,[255,255,255,127]]
    [-2147483647,-2147483647,[1,0,0,128]]
    [2147483648,-2147483648,[0,0,0,128]]
    [-2147483648,-2147483648,[0,0,0,128]]
    [2147483649,-2147483647,[1,0,0,128]]
    [-2147483649,2147483647,[255,255,255,127]]
    [4294967295,-1,[255,255,255,255]]
    [4294967296,0,[0,0,0,0]]
    [4294967297,1,[1,0,0,0]]
    [Infinity,0,[0,0,0,0]]
    [-Infinity,0,[0,0,0,0]]
    [-1.7976931348623157e+308,0,[0,0,0,0]]
    [1.7976931348623157e+308,0,[0,0,0,0]]
    [5e-324,0,[0,0,0,0]]
    [-5e-324,0,[0,0,0,0]]
    [NaN,0,[0,0,0,0]]
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
    assert.arrayEqual viewFrom(big)[GET](0), value, "view{#big}.#GET(0) -> #value"
    view[SET] 0, value, no
    assert.arrayEqual uint8, big, "view.#SET(0, #{z value}, false) -> [#big]"
    assert.arrayEqual viewFrom(big)[GET](0, no), value, "view{#big}.#GET(0, false) -> #value"
    view[SET] 0, value, on
    assert.arrayEqual uint8, little, "view.#SET(0, #{z value}, true) -> [#little]"
    assert.arrayEqual viewFrom(big)[GET](0, on), value, "view{#little}.#GET(0, false) -> #value"