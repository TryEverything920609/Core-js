'use strict';

var isRegExp = require('../internals/is-regexp');
var anObject = require('../internals/an-object');
var speciesConstructor = require('../internals/species-constructor');
var advanceStringIndex = require('../internals/advance-string-index');
var toLength = require('../internals/to-length');
var regExpExec = require('../internals/regexp-exec');
var nativeExec = RegExp.prototype.exec;
var arrayPush = [].push;
var min = Math.min;
var LENGTH = 'length';

// eslint-disable-next-line no-empty
var SUPPORTS_Y = !!(function () { try { return new RegExp('x', 'y'); } catch (e) {} })();

// @@split logic
require('../internals/fix-regexp-well-known-symbol-logic')(
  'split',
  2,
  function (defined, SPLIT, nativeSplit, nativeRegExpSplit, delegatesToSymbol) {
    var internalSplit = nativeSplit;
    if (
      'abbc'.split(/(b)*/)[1] == 'c' ||
      'test'.split(/(?:)/, -1)[LENGTH] != 4 ||
      'ab'.split(/(?:ab)*/)[LENGTH] != 2 ||
      '.'.split(/(.?)(.?)/)[LENGTH] != 4 ||
      '.'.split(/()()/)[LENGTH] > 1 ||
      ''.split(/.?/)[LENGTH]
    ) {
      var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
      // based on es5-shim implementation, need to rework it
      internalSplit = function (separator, limit) {
        var string = String(this);
        if (separator === undefined && limit === 0) return [];
        // If `separator` is not a regex, use native split
        if (!isRegExp(separator)) {
          return nativeSplit.call(string, separator, limit !== undefined ? limit >>> 0 : 4294967295);
        }
        var output = [];
        var flags = (separator.ignoreCase ? 'i' : '') +
                    (separator.multiline ? 'm' : '') +
                    (separator.unicode ? 'u' : '') +
                    (separator.sticky ? 'y' : '');
        var lastLastIndex = 0;
        var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
        // Make `global` and avoid `lastIndex` issues by working with a copy
        var separatorCopy = new RegExp(separator.source, flags + 'g');
        var separator2, match, lastIndex, lastLength, i;
        // Doesn't need flags gy, but they don't hurt
        if (!NPCG) separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
        while (match = separatorCopy.exec(string)) {
          // `separatorCopy.lastIndex` is not reliable cross-browser
          lastIndex = match.index + match[0][LENGTH];
          if (lastIndex > lastLastIndex) {
            output.push(string.slice(lastLastIndex, match.index));
            // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
            // eslint-disable-next-line no-loop-func
            if (!NPCG && match[LENGTH] > 1) match[0].replace(separator2, function () {
              for (i = 1; i < arguments[LENGTH] - 2; i++) if (arguments[i] === undefined) match[i] = undefined;
            });
            if (match[LENGTH] > 1 && match.index < string[LENGTH]) arrayPush.apply(output, match.slice(1));
            lastLength = match[0][LENGTH];
            lastLastIndex = lastIndex;
            if (output[LENGTH] >= splitLimit) break;
          }
          if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
        }
        if (lastLastIndex === string[LENGTH]) {
          if (lastLength || !separatorCopy.test('')) output.push('');
        } else output.push(string.slice(lastLastIndex));
        return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
      };
    // Chakra, V8
    } else if ('0'.split(undefined, 0)[LENGTH]) {
      internalSplit = function (separator, limit) {
        return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
      };
    }

    return [
      // `String.prototype.split` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.split
      function split(separator, limit) {
        var O = defined(this);
        var splitter = separator == undefined ? undefined : separator[SPLIT];
        return splitter !== undefined
          ? splitter.call(separator, O, limit)
          : internalSplit.call(String(O), separator, limit);
      },
      // `RegExp.prototype[@@split]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
      //
      // NOTE: This cannot be properly polyfilled in engines that don't support
      // the 'y' flag.
      function (regexp, limit) {
        // We can never use `internalSplit` if exec has been changed, because
        // internalSplit contains workarounds for things which might have been
        // purposely changed by the developer.
        if (regexp.exec === nativeExec) {
          if (delegatesToSymbol && internalSplit === nativeSplit) {
            // The native #split method already delegates to @@split (this
            // polyfilled function, leasing to infinite recursion).
            // We avoid it by directly calling the native @@split method.
            return nativeRegExpSplit.call(regexp, this, limit);
          }
          return internalSplit.call(this, regexp, limit);
        }

        var rx = anObject(regexp);
        var S = String(this);
        var C = speciesConstructor(rx, RegExp);

        var unicodeMatching = rx.unicode;
        var flags = (rx.ignoreCase ? 'i' : '') +
                      (rx.multiline ? 'm' : '') +
                      (rx.unicode ? 'u' : '') +
                      (SUPPORTS_Y ? 'y' : 'g');

        // ^(? + rx + ) is needed, in combination with some S slicing, to
        // simulate the 'y' flag.
        var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
        var lim = limit === undefined ? 0xffffffff : limit >>> 0;
        if (lim === 0) return [];
        if (S.length === 0) return regExpExec(splitter, S) === null ? [S] : [];
        var p = 0;
        var q = 0;
        var A = [];
        while (q < S.length) {
          splitter.lastIndex = SUPPORTS_Y ? q : 0;
          var z = regExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
          var e;
          if (
            z === null ||
            (e = min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
          ) {
            q = advanceStringIndex(S, q, unicodeMatching);
          } else {
            A.push(S.slice(p, q));
            if (A.length === lim) return A;
            for (var i = 1; i <= z.length - 1; i++) {
              A.push(z[i]);
              if (A.length === lim) return A;
            }
            q = p = e;
          }
        }
        A.push(S.slice(p));
        return A;
      }
    ];
  },
  !SUPPORTS_Y
);
