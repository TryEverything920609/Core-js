var version = [
  '3.0.0-alpha.1',
  require('./_is-pure') ? 'pure' : 'global',
  '© 2018 Denis Pushkarev (zloirock.ru)'
];

require('core-js-internals/shared')('versions', []).push(version);

module.exports = { version: version };
