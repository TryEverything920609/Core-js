var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var anObject = require('core-js-internals/an-object');

// `Reflect.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-reflect.getownpropertydescriptor
require('../internals/export')({ target: 'Reflect', stat: true }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return getOwnPropertyDescriptorModule.f(anObject(target), propertyKey);
  }
});
