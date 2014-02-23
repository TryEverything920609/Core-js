{isFunction} = Function
test 'Array::at' !->
  ok isFunction(Array::at), 'Is function'
  ok [1 2 3]at(0)  is 1,    '[1, 2, 3].at(0) is 1'
  ok [1 2 3]at(2)  is 3,    '[1, 2, 3].at(2) is 3'
  ok [1 2 3]at(3)  is void, '[1, 2, 3].at(3) is undefined'
  ok [1 2 3]at(-1) is 3,    '[1, 2, 3].at(-1) is 3'
  ok [1 2 3]at(-3) is 1,    '[1, 2, 3].at(-3) is 1'
  ok [1 2 3]at(-4) is void, '[1, 2, 3].at(-4) is undefined'
test 'Array::pluck' !->
  ok isFunction(Array::pluck), 'Is function'
  deepEqual <[1 2 321]>pluck(\length), [1 1 3], 'return array of properties'
  deepEqual [\1 2 void]pluck(\length), [1 void void], 'works with undefined'
test 'Array::reduceTo' !->
  ok isFunction(Array::reduceTo), 'Is function'
  (arr = [1])reduceTo (val, key, that)->
    deepEqual {} @, 'Default context is empty object'
    ok val  is 1, 'First argumert is value'
    ok key  is 0, 'Second argumert is index'
    ok that is arr, 'Third argumert is array' 
  [1]reduceTo obj = {} ->
    ok @ is obj, 'Can reduce to exist object'
  deepEqual [3 2 1] [1 2 3]reduceTo([] (@unshift <|)), 'Reduce to object and return it'
test 'Array::merge' !->
  ok isFunction(Array::merge), 'Is function'
  arr = [1 2 3]
  ok arr is arr.merge([4 5 6]), 'Return exist array'
  deepEqual arr, [1 2 3 4 5 6], 'Add elements of argument array to this array'
  deepEqual <[q w e]>.merge(\asd), <[q w e a s d]>, 'Work with array-like objects'