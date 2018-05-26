// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
require('./_export')({ target: 'Array', proto: true }, { copyWithin: require('core-js-internals/array-copy-within') });

require('./_add-to-unscopables')('copyWithin');
