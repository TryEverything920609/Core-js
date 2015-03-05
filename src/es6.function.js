'use strict';
var $       = require('./$')
  , NAME    = 'name'
  , FnProto = Function.prototype;
// 19.2.4.2 name
NAME in FnProto || ($.FW && $.DESC && $.setDesc(FnProto, NAME, {
  configurable: true,
  get: function(){
    var match = String(this).match(/^\s*function ([^ (]*)/)
      , name  = match ? match[1] : '';
    $.has(this, NAME) || $.setDesc(this, NAME, $.desc(5, name));
    return name;
  },
  set: function(value){
    $.has(this, NAME) || $.setDesc(this, NAME, $.desc(0, value));
  }
}));