// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
require('./_export')({ target: 'Object', stat: true, forced: !require('./_descriptors') }, {
  defineProperties: require('./_object-dps')
});
