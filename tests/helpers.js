// Generated by LiveScript 1.3.1
(function(){
  QUnit.assert.epsilon = function(a, b, E, message){
    this.push(Math.abs(a - b) <= (E != null ? E : 1e-11), a, b, message);
  };
}).call(this);

// Generated by LiveScript 1.3.1
(function(){
  QUnit.assert.same = function(a, b, message){
    this.push(a === b
      ? a !== 0 || 1 / a === 1 / b
      : a != a && b != b, a, b, message);
  };
}).call(this);
