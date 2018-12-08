'use strict';
// var DEBUG = true;
var DESCRIPTORS = require('../internals/descriptors');
var USE_NATIVE_URL = require('../internals/native-url');
var NativeURL = require('../internals/global').URL;
var defineProperties = require('../internals/object-define-properties');
var redefine = require('../internals/redefine');
var anInstance = require('../internals/an-instance');
var has = require('../internals/has');
var toASCII = require('../internals/punycode-to-ascii');
var URLSearchParamsModule = require('../modules/web.url-search-params');
var URLSearchParams = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;
var InternalStateModule = require('../internals/internal-state');
var setInternalState = InternalStateModule.set;
var getInternalURLState = InternalStateModule.getterFor('URL');
var pow = Math.pow;

var INVALID_AUTHORITY = 'Invalid authority';
var INVALID_SCHEME = 'Invalid scheme';
var INVALID_HOST = 'Invalid host';
var INVALID_PORT = 'Invalid port';

var ALPHA = /[a-zA-Z]/;
var ALPHANUMERIC = /[a-zA-Z0-9+\-.]/;
var DIGIT = /[0-9]/;
var HEX_START = /^(0x|0X)/;
var OCT = /^[0-7]+$/;
var DEC = /^[0-9]+$/;
var HEX = /^[0-9A-Fa-f]+$/;
// eslint-disable-next-line no-control-regex
var FORBIDDEN_HOST_CODE_POINT = /\u0000|\u0009|\u000A|\u000D|\u0020|#|%|\/|:|\?|@|\[|\\|\]/;
// eslint-disable-next-line no-control-regex
var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F\u0020]+|[\u0000-\u001F\u0020]+$/g;
// eslint-disable-next-line no-control-regex
var TAB_AND_NEW_LINE = /\u0009|\u000A|\u000D/g;
var EOF = '';

var parseHost = function (state, buffer) {
  var result, j;
  if (buffer.charAt(0) == '[') {
    if (buffer.charAt(buffer.length - 1) != ']') return INVALID_HOST;
    result = parseIPv6(buffer.slice(1, -1));
    if (!result) return INVALID_HOST;
    state.host = result;
  // opaque host
  } else if (!isSpecial(state)) {
    if (~buffer.indexOf('%')) return INVALID_HOST;
    result = '';
    for (j = 0; j < buffer.length; j++) result += percentEncode(buffer.charAt(j), {});
    state.host = result;
  } else {
    buffer = toASCII(buffer);
    if (FORBIDDEN_HOST_CODE_POINT.test(buffer)) return INVALID_HOST;
    state.host = parseIPv4(buffer);
  }
};

var parseIPv4 = function (buffer) {
  var parts = buffer.split('.');
  var partsLength, numbers, i, part, R, n, ipv4;
  if (parts[parts.length - 1] == '') {
    if (parts.length) parts.pop();
  }
  partsLength = parts.length;
  if (partsLength > 4) return buffer;
  numbers = [];
  for (i = 0; i < partsLength; i++) {
    part = parts[i];
    if (part == '') return buffer;
    R = 10;
    if (part.length > 1 && part.charAt(0) == '0') {
      R = HEX_START.test(part) ? 16 : 8;
      part = part.slice(R == 8 ? 1 : 2);
    }
    if (!(R == 10 ? DEC : R == 8 ? OCT : HEX).test(part)) return buffer;
    n = parseInt(part, R);
    // eslint-disable-next-line no-self-compare
    if (n != n) return buffer;
    if (i == partsLength - 1) {
      if (n >= pow(256, 5 - partsLength)) return buffer;
    } else if (n > 255) return buffer;
    numbers.push(n);
  }
  ipv4 = numbers.pop();
  for (i = 0; i < numbers.length; i++) {
    ipv4 += numbers[i] * pow(256, 3 - i);
  }
  return ipv4;
};

// eslint-disable-next-line max-statements
var parseIPv6 = function (buffer) {
  var address = [0, 0, 0, 0, 0, 0, 0, 0];
  var pieceIndex = 0;
  var compress = null;
  var pointer = 0;
  var char, value, length, numbersSeen, ipv4Piece, number, swaps, swap;
  if (buffer.charAt(0) == ':') {
    if (buffer.charAt(1) != ':') return;
    pointer += 2;
    pieceIndex++;
  }
  while ((char = buffer.charAt(pointer)) != EOF) {
    if (pieceIndex == 8) return;
    if (char == ':') {
      if (compress !== null) return;
      pointer++;
      pieceIndex++;
      compress = pieceIndex;
      continue;
    }
    value = length = 0;
    while (HEX.test(char = buffer.charAt(pointer)) && length < 4) {
      value = value * 16 + parseInt(char, 16);
      pointer++;
      length++;
    }
    if (char == '.') {
      if (length == 0) return;
      pointer -= length;
      if (pieceIndex > 6) return;
      numbersSeen = 0;
      while ((char = buffer.charAt(pointer)) != EOF) {
        ipv4Piece = null;
        if (numbersSeen > 0) {
          if (char == '.' && numbersSeen < 4) pointer++;
          else return;
        }
        if (!DIGIT.test(char)) return;
        do {
          number = parseInt(char, 10);
          if (ipv4Piece === null) ipv4Piece = number;
          else if (ipv4Piece == 0) return;
          ipv4Piece = ipv4Piece * 10 + number;
        } while (DIGIT.test(char = buffer.charAt(pointer)));
        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
        numbersSeen++;
        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
      }
      if (numbersSeen != 4) return;
      break;
    } else if (char == ':') {
      pointer++;
      if (buffer.charAt(pointer) == EOF) return;
    } else if (char != EOF) return;
    address[pieceIndex++] = value;
  }
  if (compress !== null) {
    swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex != 0 && swaps > 0) {
      swap = address[pieceIndex];
      address[pieceIndex--] = address[compress + swaps - 1];
      address[compress + --swaps] = swap;
    }
  } else if (pieceIndex != 8) return;
  return address;
};

var findLongestZeroSequence = function (ipv6) {
  var maxIndex = null;
  var maxLength = 1;
  var currStart = null;
  var currLength = 0;
  var i = 0;
  for (; i < 8; i++) {
    if (ipv6[i] !== 0) {
      if (currLength > maxLength) {
        maxIndex = currStart;
        maxLength = currLength;
      }
      currStart = null;
      currLength = 0;
    } else {
      if (currStart === null) currStart = i;
      ++currLength;
    }
  }
  if (currLength > maxLength) {
    maxIndex = currStart;
    maxLength = currLength;
  }
  return maxIndex;
};

var serializeHost = function (host) {
  var result, i, compress, ignore0;
  // ipv4
  if (typeof host == 'number') {
    result = [];
    for (i = 0; i < 4; i++) {
      result.unshift(host % 256);
      host = Math.floor(host / 256);
    } return result.join('.');
  // ipv6
  } else if (typeof host == 'object') {
    result = [];
    compress = findLongestZeroSequence(host);
    for (i = 0; i < 8; i++) {
      if (ignore0 && host[i] === 0) continue;
      if (ignore0) ignore0 = false;
      if (compress === i) {
        result.push(i ? '' : ':');
        ignore0 = true;
      } else result.push(host[i].toString(16));
    }
    return '[' + result.join(':') + ']';
  } return host;
};

var specialSchemes = {
  ftp: 21,
  file: null,
  gopher: 70,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};

var isSpecial = function (url) {
  return has(specialSchemes, url.scheme);
};

var isSingleDot = function (buffer) {
  return buffer === '.' || buffer.toLowerCase() === '%2e';
};

var isDoubleDot = function (buffer) {
  buffer = buffer.toLowerCase();
  return buffer === '..' || buffer === '%2e.' || buffer === '.%2e' || buffer === '%2e%2e';
};

var escapeSet = { '"': 1, '#': 1, '<': 1, '>': 1, '?': 1, '`': 1 };

var fragmentSet = { '"': 1, '<': 1, '>': 1, '`': 1 };

var querySet = { '"': 1, '#': 1, '<': 1, '>': 1, '`': 1 };

var percentEncode = function (char, set) {
  var code = char.charCodeAt(0);
  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
};

var includesCredentials = function (state) {
  return state.username != '' || state.password != '';
};

var isWindowsDriveLetter = function (input) {
  var tmp;
  return input.length == 2 && ALPHA.test(input.charAt(0))
    && ((tmp = input.charAt(1)) == ':' || tmp == '|');
};

var isWindowsDrive = function (input, pointer) {
  var tmp;
  return isWindowsDriveLetter(input.charAt(pointer) + input.charAt(pointer + 1))
    && ((tmp = input.charAt(pointer + 2)) === EOF || tmp === '/' || tmp === '\\' || tmp === '?' || tmp === '#');
};

var shortenURLsPath = function (state) {
  var path = state.path;
  if (
    path.length &&
    (state.scheme != 'file' || path.length != 1 || !isWindowsDrive(path[0], 0) || path[0].charAt(1) != ':')
  ) path.pop();
};

// States:
var SCHEME_START = {}; // 'SCHEME_START';
var SCHEME = {}; // 'SCHEME';
var NO_SCHEME = {}; // 'NO_SCHEME';
var SPECIAL_RELATIVE_OR_AUTHORITY = {}; // 'SPECIAL_RELATIVE_OR_AUTHORITY';
var PATH_OR_AUTHORITY = {}; // 'PATH_OR_AUTHORITY';
var RELATIVE = {}; // 'RELATIVE';
var RELATIVE_SLASH = {}; // 'RELATIVE_SLASH';
var SPECIAL_AUTHORITY_SLASHES = {}; // 'SPECIAL_AUTHORITY_SLASHES';
var SPECIAL_AUTHORITY_IGNORE_SLASHES = {}; // 'SPECIAL_AUTHORITY_IGNORE_SLASHES';
var AUTHORITY = {}; // 'AUTHORITY';
var HOST = {}; // 'HOST';
var HOSTNAME = {}; // 'HOSTNAME';
var PORT = {}; // 'PORT';
var FILE = {}; // 'FILE';
var FILE_SLASH = {}; // 'FILE_SLASH';
var FILE_HOST = {}; // 'FILE_HOST';
var PATH_START = {}; // 'PATH_START';
var PATH = {}; // 'PATH';
var CANNOT_BE_A_BASE_URL_PATH = {}; // 'CANNOT_BE_A_BASE_URL_PATH';
var QUERY = {}; // 'QUERY';
var FRAGMENT = {}; // 'FRAGMENT';

// eslint-disable-next-line max-statements
var parse = function (url, input, stateOverride, base) {
  var state = stateOverride || SCHEME_START;
  var pointer = 0;
  var buffer = '';
  var seenAt = false;
  var seenBracket = false;
  var seenPasswordToken = false;
  var char, failure;

  input = input.replace(TAB_AND_NEW_LINE, '');

  while (input.charAt(pointer - 1) != EOF || pointer == 0) {
    char = input.charAt(pointer);
    // eslint-disable-next-line
    // if (DEBUG) console.log(pointer, char, state);
    switch (state) {
      case SCHEME_START:
        if (char && ALPHA.test(char)) {
          buffer += char.toLowerCase();
          state = SCHEME;
        } else if (!stateOverride) {
          state = NO_SCHEME;
          continue;
        } else return INVALID_SCHEME;
        break;

      case SCHEME:
        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
          buffer += char.toLowerCase();
        } else if (char == ':') {
          if (stateOverride) {
            if (
              (isSpecial(url) != has(specialSchemes, buffer)) ||
              (buffer == 'file' && (includesCredentials(url) || url.port !== null)) ||
              (url.scheme == 'file' && !url.host)
            ) return;
          }
          url.scheme = buffer;
          if (stateOverride) {
            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
            return;
          }
          buffer = '';
          if (url.scheme == 'file') {
            state = FILE;
          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
            state = SPECIAL_RELATIVE_OR_AUTHORITY;
          } else if (isSpecial(url)) {
            state = SPECIAL_AUTHORITY_SLASHES;
          } else if (input.charAt(pointer + 1) == '/') {
            state = PATH_OR_AUTHORITY;
            pointer++;
          } else {
            url.cannotBeABaseURL = true;
            url.path.push('');
            state = CANNOT_BE_A_BASE_URL_PATH;
          }
        } else if (!stateOverride) {
          buffer = '';
          state = NO_SCHEME;
          pointer = 0;
          continue;
        } else return INVALID_SCHEME;
        break;

      case NO_SCHEME:
        if (!base || (base.cannotBeABaseURL && char != '#')) return INVALID_SCHEME;
        if (base.cannotBeABaseURL && char == '#') {
          url.scheme = base.scheme;
          url.path = base.path.slice();
          url.query = base.query;
          url.fragment = base.fragment;
          url.cannotBeABaseURL = true;
          state = FRAGMENT;
          break;
        }
        state = base.scheme == 'file' ? FILE : RELATIVE;
        continue;

      case SPECIAL_RELATIVE_OR_AUTHORITY:
        if (char == '/' && input.charAt(pointer + 1) == '/') {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          pointer++;
        } else {
          state = RELATIVE;
          continue;
        } break;

      case PATH_OR_AUTHORITY:
        if (char == '/') {
          state = AUTHORITY;
          break;
        } else {
          state = PATH;
          continue;
        }

      case RELATIVE:
        url.scheme = base.scheme;
        if (char == EOF) {
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = base.query;
          url.username = base.username;
          url.password = base.password;
          return;
        } else if (char == '/' || char == '\\') {
          state = RELATIVE_SLASH;
        } else if (char == '?') {
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.username = base.username;
          url.password = base.password;
          url.query = '';
          state = QUERY;
        } else if (char == '#') {
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = base.query;
          url.username = base.username;
          url.password = base.password;
          url.fragment = '';
          state = FRAGMENT;
        } else {
          url.host = base.host;
          url.port = base.port;
          url.username = base.username;
          url.password = base.password;
          url.path = base.path.slice();
          url.path.pop();
          state = PATH;
          continue;
        } break;

      case RELATIVE_SLASH:
        if (isSpecial(url) && (char == '/' || char == '\\')) {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
        } else if (char == '/') {
          state = AUTHORITY;
        } else {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          state = PATH;
          continue;
        } break;

      case SPECIAL_AUTHORITY_SLASHES:
        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
        pointer++;
        break;

      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
        if (char != '/' && char != '\\') {
          state = AUTHORITY;
          continue;
        } break;

      case AUTHORITY:
        if (char == '@') {
          if (seenAt) buffer += '%40';
          seenAt = true;
          for (var i = 0; i < buffer.length; i++) {
            var codePoint = buffer.charAt(i);
            if (codePoint == ':' && !seenPasswordToken) {
              seenPasswordToken = true;
              continue;
            }
            var encodedCodePoints = percentEncode(codePoint, escapeSet);
            if (seenPasswordToken) url.password += encodedCodePoints;
            else url.username += encodedCodePoints;
          }
          buffer = '';
        } else if (
          EOF == char || '/' == char || '?' == char || '#' == char ||
          (char == '\\' && isSpecial(url))
        ) {
          if (seenAt && buffer == '') return INVALID_AUTHORITY;
          pointer -= buffer.length + 1;
          buffer = '';
          state = HOST;
        } else buffer += char;
        break;

      case HOST:
      case HOSTNAME:
        if (stateOverride && url.scheme == 'file') {
          state = FILE_HOST;
          continue;
        } else if (char == ':' && !seenBracket) {
          if (buffer == '') return INVALID_HOST;
          failure = parseHost(url, buffer);
          if (failure) return failure;
          buffer = '';
          state = PORT;
          if (stateOverride == HOSTNAME) return;
        } else if (
          EOF == char || '/' == char || '?' == char || '#' == char ||
          (char == '\\' && isSpecial(url))
        ) {
          if (isSpecial(url) && buffer == '') return INVALID_HOST;
          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port != null)) return;
          failure = parseHost(url, buffer);
          if (failure) return failure;
          buffer = '';
          state = PATH_START;
          if (stateOverride) return;
          continue;
        } else {
          if (char == '[') seenBracket = true;
          else if (char == ']') seenBracket = false;
          buffer += char;
        } break;

      case PORT:
        if (DIGIT.test(char)) {
          buffer += char;
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url)) ||
          stateOverride
        ) {
          if (buffer != '') {
            var port = parseInt(buffer, 10);
            if (port > 0xffff) return INVALID_PORT;
            url.port = (isSpecial(url) && port === specialSchemes[url.scheme]) ? null : port;
            buffer = '';
          }
          if (stateOverride) return;
          state = PATH_START;
          continue;
        } else return INVALID_PORT;
        break;

      case FILE:
        url.scheme = 'file';
        if (char == '/' || char == '\\') state = FILE_SLASH;
        else if (base && base.scheme == 'file') {
          if (char == EOF) {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = base.query;
          } else if (char == '?') {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = '';
            state = QUERY;
          } else if (char == '#') {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = base.query;
            url.fragment = '';
            state = FRAGMENT;
          } else {
            if (isWindowsDrive(input, pointer)) {
              url.host = base.host;
              url.path = base.path.slice();
              shortenURLsPath(url);
            }
            state = PATH;
            continue;
          }
        } else {
          state = PATH;
          continue;
        } break;

      case FILE_SLASH:
        if (char == '/' || char == '\\') {
          state = FILE_HOST;
          break;
        }
        if (base && base.scheme == 'file' && !isWindowsDrive(input, pointer)) {
          var temp = base.path[0] || '';
          if (isWindowsDrive(temp, 0) && temp.charAt(1) == ':') url.path.push(temp);
        }
        state = PATH;
        continue;

      case FILE_HOST:
        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
          if (!stateOverride && isWindowsDriveLetter(buffer)) {
            state = PATH;
          } else if (buffer == '') {
            url.host = '';
            if (stateOverride) return;
            state = PATH_START;
          } else {
            failure = parseHost(url, buffer);
            if (failure) return failure;
            if (url.host == 'localhost') url.host = '';
            if (stateOverride) return;
            buffer = '';
            state = PATH_START;
          } continue;
        } else buffer += char;
        break;

      case PATH_START:
        if (isSpecial(url)) {
          state = PATH;
          if ('/' != char && '\\' != char) continue;
        } else if (!stateOverride && char == '?') {
          url.query = '';
          state = QUERY;
        } else if (!stateOverride && char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          state = PATH;
          if (char != '/') continue;
        } break;

      case PATH:
        if (
          EOF == char || '/' == char ||
          (char == '\\' && isSpecial(url)) ||
          (!stateOverride && ('?' == char || '#' == char))
        ) {
          if (isDoubleDot(buffer)) {
            shortenURLsPath(url);
            if (char != '/' && !(char == '\\' && isSpecial(url))) {
              url.path.push('');
            }
          } else if (isSingleDot(buffer)) {
            if (char != '/' && !(char == '\\' && isSpecial(url))) {
              url.path.push('');
            }
          } else {
            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
              if (url.host) url.host = '';
              buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
            }
            url.path.push(buffer);
          }
          buffer = '';
          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
            while (url.path.length > 1 && url.path[0] === '') {
              url.path.shift();
            }
          }
          if (char == '?') {
            url.query = '';
            state = QUERY;
          } else if ('#' == char) {
            url.fragment = '';
            state = FRAGMENT;
          }
        } else {
          buffer += percentEncode(char, escapeSet);
        } break;

      case CANNOT_BE_A_BASE_URL_PATH:
        if (char == '?') {
          url.query = '';
          state = QUERY;
        } else if (char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          url.path[0] += percentEncode(char, {});
        }
        break;

      case QUERY:
        if (!stateOverride && '#' == char) {
          url.fragment = '';
          state = FRAGMENT;
        } else if (EOF != char) {
          // TODO
          url.query += percentEncode(char, querySet);
        } break;

      case FRAGMENT:
        if (EOF != char) url.fragment += percentEncode(char, fragmentSet);
        break;
    }

    pointer++;
  }
};

var initializeState = function (state) {
  state.scheme = '';
  state.username = '';
  state.password = '';
  state.host = null;
  state.port = null;
  state.path = [];
  state.query = null;
  state.fragment = null;
  state.cannotBeABaseURL = false;
};

// `URL` constructor
// https://url.spec.whatwg.org/#url-class
var URLConstructor = function URL(url /* , base */) {
  var that = anInstance(this, URLConstructor, 'URL');
  var base = arguments.length > 1 ? arguments[1] : undefined;
  var urlString = String(url);
  var state = this.state = setInternalState(that, { type: 'URL' });
  var baseState, result;
  // if (DEBUG) this.state = state;
  if (base !== undefined) {
    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
    else {
      initializeState(baseState = {});
      result = parse(baseState, String(base));
      if (result) throw new TypeError(result);
    }
  }
  initializeState(state);
  result = parse(state, urlString.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, ''), null, baseState);
  if (result) throw new TypeError(result);
  var searchParams = state.searchParams = new URLSearchParams(state.query || undefined);
  getInternalSearchParamsState(searchParams).updateURL = function () {
    state.query = String(searchParams);
  };
  if (!DESCRIPTORS) {
    that.href = serializeURL.call(that);
    that.origin = getOrigin.call(that);
    that.protocol = getProtocol.call(that);
    that.username = getUsername.call(that);
    that.password = getPassword.call(that);
    that.host = getHost.call(that);
    that.hostname = getHostname.call(that);
    that.port = getPort.call(that);
    that.pathname = getPathname.call(that);
    that.search = getSearch.call(that);
    that.searchParams = getSearchParams.call(that);
    that.hash = getHash.call(that);
  }
};

var URLPrototype = URLConstructor.prototype;

var serializeURL = function () {
  var state = getInternalURLState(this);
  var scheme = state.scheme;
  var username = state.username;
  var password = state.password;
  var host = state.host;
  var port = state.port;
  var path = state.path;
  var query = state.query;
  var fragment = state.fragment;
  var output = scheme + ':';
  if (host !== null) {
    output += '//';
    if (includesCredentials(state)) {
      output += username + (password ? ':' + password : '') + '@';
    }
    output += serializeHost(host);
    if (port !== null) output += ':' + port;
  } else if (scheme == 'file') output += '//';
  output += state.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
  if (query !== null) output += '?' + query;
  if (fragment !== null) output += '#' + fragment;
  return output;
};

var getOrigin = function () {
  var state = getInternalURLState(this);
  var scheme = state.scheme;
  var port = state.port;
  if (scheme == 'blob') try {
    return new URL(scheme.path[0]).origin;
  } catch (e) {
    return 'null';
  }
  if (scheme == 'file' || !isSpecial(state)) return 'null';
  return scheme + '://' + serializeHost(state.host) + (port !== null ? ':' + port : '');
};

var getProtocol = function () {
  return getInternalURLState(this).scheme + ':';
};

var getUsername = function () {
  return getInternalURLState(this).username;
};

var getPassword = function () {
  return getInternalURLState(this).password;
};

var getHost = function () {
  var state = getInternalURLState(this);
  var host = state.host;
  var port = state.port;
  return host === null ? ''
    : port === null ? serializeHost(host)
    : serializeHost(host) + ':' + port;
};

var getHostname = function () {
  var host = getInternalURLState(this).host;
  return host === null ? '' : serializeHost(host);
};

var getPort = function () {
  var port = getInternalURLState(this).port;
  return port === null ? '' : String(port);
};

var getPathname = function () {
  var state = getInternalURLState(this);
  var path = state.path;
  return state.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
};

var getSearch = function () {
  var query = getInternalURLState(this).query;
  return query ? '?' + query : '';
};

var getSearchParams = function () {
  return getInternalURLState(this).searchParams;
};

var getHash = function () {
  var fragment = getInternalURLState(this).fragment;
  return fragment ? '#' + fragment : '';
};

var cannotHaveUsernamePasswordPort = function (state) {
  return !state.host || state.cannotBeABaseURL || state.scheme == 'file';
};

var accessorDescriptor = function (getter, setter) {
  return { get: getter, set: setter, configurable: true, enumerable: true };
};

if (DESCRIPTORS) {
  defineProperties(URLPrototype, {
    // `URL.prototype.href` accessors pair
    // https://url.spec.whatwg.org/#dom-url-href
    href: accessorDescriptor(serializeURL, function (href) {
      var state = getInternalURLState(this);
      var urlString = String(href);
      initializeState(state);
      var result = parse(state, urlString.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, ''));
      if (result) throw new TypeError(result);
      getInternalSearchParamsState(state.searchParams).updateSearchParams(state.query);
    }),
    // `URL.prototype.origin` getter
    // https://url.spec.whatwg.org/#dom-url-origin
    origin: accessorDescriptor(getOrigin),
    // `URL.prototype.protocol` accessors pair
    // https://url.spec.whatwg.org/#dom-url-protocol
    protocol: accessorDescriptor(getProtocol, function (protocol) {
      var state = getInternalURLState(this);
      parse(state, protocol + ':', SCHEME_START);
    }),
    // `URL.prototype.username` accessors pair
    // https://url.spec.whatwg.org/#dom-url-username
    username: accessorDescriptor(getUsername, function (username) {
      var state = getInternalURLState(this);
      if (cannotHaveUsernamePasswordPort(state)) return;
      state.username = '';
      for (var i = 0; i < username.length; i++) {
        state.username += percentEncode(username.charAt(i), escapeSet);
      }
    }),
    // `URL.prototype.password` accessors pair
    // https://url.spec.whatwg.org/#dom-url-password
    password: accessorDescriptor(getPassword, function (password) {
      var state = getInternalURLState(this);
      if (cannotHaveUsernamePasswordPort(state)) return;
      state.password = '';
      for (var i = 0; i < password.length; i++) {
        state.password += percentEncode(password.charAt(i), escapeSet);
      }
    }),
    // `URL.prototype.host` accessors pair
    // https://url.spec.whatwg.org/#dom-url-host
    host: accessorDescriptor(getHost, function (host) {
      var state = getInternalURLState(this);
      if (state.cannotBeABaseURL) return;
      parse(state, host + '', HOST);
    }),
    // `URL.prototype.hostname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hostname
    hostname: accessorDescriptor(getHostname, function (hostname) {
      var state = getInternalURLState(this);
      if (state.cannotBeABaseURL) return;
      parse(state, hostname + '', HOSTNAME);
    }),
    // `URL.prototype.port` accessors pair
    // https://url.spec.whatwg.org/#dom-url-port
    port: accessorDescriptor(getPort, function (port) {
      var state = getInternalURLState(this);
      if (cannotHaveUsernamePasswordPort(state)) return;
      parse(state, port + '', PORT);
    }),
    // `URL.prototype.pathname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-pathname
    pathname: accessorDescriptor(getPathname, function (pathname) {
      var state = getInternalURLState(this);
      if (state.cannotBeABaseURL) return;
      state.path = [];
      parse(state, pathname + '', PATH_START);
    }),
    // `URL.prototype.search` accessors pair
    // https://url.spec.whatwg.org/#dom-url-search
    search: accessorDescriptor(getSearch, function (search) {
      var state = getInternalURLState(this);
      search = String(search);
      if (search == '') {
        state.query = null;
      } else {
        if ('?' == search.charAt(0)) search = search.slice(1);
        state.query = '';
        parse(state, search, QUERY);
      }
      getInternalSearchParamsState(state.searchParams).updateSearchParams(state.query);
    }),
    // `URL.prototype.searchParams` getter
    // https://url.spec.whatwg.org/#dom-url-searchparams
    searchParams: accessorDescriptor(getSearchParams),
    // `URL.prototype.hash` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hash
    hash: accessorDescriptor(getHash, function (hash) {
      var state = getInternalURLState(this);
      hash = String(hash);
      if (hash == '') {
        state.fragment = null;
        return;
      }
      if ('#' == hash.charAt(0)) hash = hash.slice(1);
      state.fragment = '';
      parse(state, hash, FRAGMENT);
    })
  });
}

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
redefine(URLPrototype, 'toJSON', function toJSON() {
  return serializeURL.call(this);
}, { enumerable: true });

// `URL.prototype.toString` method
// https://url.spec.whatwg.org/#URL-stringification-behavior
redefine(URLPrototype, 'toString', function toString() {
  return serializeURL.call(this);
}, { enumerable: true });

if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  // `URL.createObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
    return nativeCreateObjectURL.apply(NativeURL, arguments);
  });
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
    return nativeRevokeObjectURL.apply(NativeURL, arguments);
  });
}

require('../internals/set-to-string-tag')(URLConstructor, 'URL');

require('../internals/export')({ global: true, forced: !USE_NATIVE_URL }, {
  URL: URLConstructor
});
