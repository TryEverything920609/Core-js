function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
};
assert.def = function(it){
  if(it == undefined)throw TypeError('Function called on null or undefined');
  return it;
};
assert.fn = function(it){
  if(!isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
assert.REDUCE = 'Reduce of empty object with no initial value';