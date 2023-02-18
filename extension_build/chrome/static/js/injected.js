/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 7547:
/***/ (function(module) {

"use strict";
/*globals self, window */


/*eslint-disable @mysticatea/prettier */
var _ref = typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : /* otherwise */undefined,
  AbortController = _ref.AbortController,
  AbortSignal = _ref.AbortSignal;
/*eslint-enable @mysticatea/prettier */

module.exports = AbortController;
module.exports.AbortSignal = AbortSignal;
module.exports["default"] = AbortController;

/***/ }),

/***/ 2470:
/***/ (function(__unused_webpack_module, exports) {

"use strict";


exports.byteLength = byteLength;
exports.toByteArray = toByteArray;
exports.fromByteArray = fromByteArray;
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;
function getLens(b64) {
  var len = b64.length;
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=');
  if (validLen === -1) validLen = len;
  var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}

// base64 is 4/3 + up to two characters of the original data
function byteLength(b64) {
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function _byteLength(b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  var curByte = 0;

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
  var i;
  for (i = 0; i < len; i += 4) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = tmp >> 16 & 0xFF;
    arr[curByte++] = tmp >> 8 & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }
  if (placeHoldersLen === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[curByte++] = tmp & 0xFF;
  }
  if (placeHoldersLen === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[curByte++] = tmp >> 8 & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }
  return arr;
}
function tripletToBase64(num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
}
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
    output.push(tripletToBase64(tmp));
  }
  return output.join('');
}
function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
  }
  return parts.join('');
}

/***/ }),

/***/ 918:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var _classCallCheck = (__webpack_require__(6690)["default"]);
var _createClass = (__webpack_require__(9728)["default"]);
var _assertThisInitialized = (__webpack_require__(6115)["default"]);
var _inherits = (__webpack_require__(1655)["default"]);
var _createSuper = (__webpack_require__(6389)["default"]);
var base64 = __webpack_require__(2470);
var ieee754 = __webpack_require__(545);
var customInspectSymbol = typeof Symbol === 'function' && typeof Symbol['for'] === 'function' // eslint-disable-line dot-notation
? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
: null;
exports.Buffer = Buffer;
exports.SlowBuffer = SlowBuffer;
exports.INSPECT_MAX_BYTES = 50;
var K_MAX_LENGTH = 0x7fffffff;
exports.kMaxLength = K_MAX_LENGTH;

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
  console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
}
function typedArraySupport() {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1);
    var proto = {
      foo: function foo() {
        return 42;
      }
    };
    Object.setPrototypeOf(proto, Uint8Array.prototype);
    Object.setPrototypeOf(arr, proto);
    return arr.foo() === 42;
  } catch (e) {
    return false;
  }
}
Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function get() {
    if (!Buffer.isBuffer(this)) return undefined;
    return this.buffer;
  }
});
Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function get() {
    if (!Buffer.isBuffer(this)) return undefined;
    return this.byteOffset;
  }
});
function createBuffer(length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"');
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length);
  Object.setPrototypeOf(buf, Buffer.prototype);
  return buf;
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer(arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError('The "string" argument must be of type string. Received type number');
    }
    return allocUnsafe(arg);
  }
  return from(arg, encodingOrOffset, length);
}
Buffer.poolSize = 8192; // not used by this implementation

function from(value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset);
  }
  if (ArrayBuffer.isView(value)) {
    return fromArrayView(value);
  }
  if (value == null) {
    throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
  }
  if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
    return fromArrayBuffer(value, encodingOrOffset, length);
  }
  if (typeof SharedArrayBuffer !== 'undefined' && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length);
  }
  if (typeof value === 'number') {
    throw new TypeError('The "value" argument must not be of type number. Received type number');
  }
  var valueOf = value.valueOf && value.valueOf();
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length);
  }
  var b = fromObject(value);
  if (b) return b;
  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
  }
  throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length);
};

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
Object.setPrototypeOf(Buffer, Uint8Array);
function assertSize(size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number');
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"');
  }
}
function alloc(size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(size);
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
  }
  return createBuffer(size);
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding);
};
function allocUnsafe(size) {
  assertSize(size);
  return createBuffer(size < 0 ? 0 : checked(size) | 0);
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size);
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size);
};
function fromString(string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }
  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding);
  }
  var length = byteLength(string, encoding) | 0;
  var buf = createBuffer(length);
  var actual = buf.write(string, encoding);
  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual);
  }
  return buf;
}
function fromArrayLike(array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  var buf = createBuffer(length);
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255;
  }
  return buf;
}
function fromArrayView(arrayView) {
  if (isInstance(arrayView, Uint8Array)) {
    var copy = new Uint8Array(arrayView);
    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
  }
  return fromArrayLike(arrayView);
}
function fromArrayBuffer(array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds');
  }
  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds');
  }
  var buf;
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array);
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset);
  } else {
    buf = new Uint8Array(array, byteOffset, length);
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype);
  return buf;
}
function fromObject(obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0;
    var buf = createBuffer(len);
    if (buf.length === 0) {
      return buf;
    }
    obj.copy(buf, 0, 0, len);
    return buf;
  }
  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0);
    }
    return fromArrayLike(obj);
  }
  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data);
  }
}
function checked(length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
  }
  return length | 0;
}
function SlowBuffer(length) {
  if (+length != length) {
    // eslint-disable-line eqeqeq
    length = 0;
  }
  return Buffer.alloc(+length);
}
Buffer.isBuffer = function isBuffer(b) {
  return b != null && b._isBuffer === true && b !== Buffer.prototype; // so Buffer.isBuffer(Buffer.prototype) will be false
};

Buffer.compare = function compare(a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
  }
  if (a === b) return 0;
  var x = a.length;
  var y = b.length;
  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }
  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};
Buffer.isEncoding = function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true;
    default:
      return false;
  }
};
Buffer.concat = function concat(list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }
  if (list.length === 0) {
    return Buffer.alloc(0);
  }
  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }
  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (isInstance(buf, Uint8Array)) {
      if (pos + buf.length > buffer.length) {
        if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
        buf.copy(buffer, pos);
      } else {
        Uint8Array.prototype.set.call(buffer, buf, pos);
      }
    } else if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    } else {
      buf.copy(buffer, pos);
    }
    pos += buf.length;
  }
  return buffer;
};
function byteLength(string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length;
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength;
  }
  if (typeof string !== 'string') {
    throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + typeof string);
  }
  var len = string.length;
  var mustMatch = arguments.length > 2 && arguments[2] === true;
  if (!mustMatch && len === 0) return 0;

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len;
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length;
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2;
      case 'hex':
        return len >>> 1;
      case 'base64':
        return base64ToBytes(string).length;
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length; // assume utf8
        }

        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;
function slowToString(encoding, start, end) {
  var loweredCase = false;

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return '';
  }
  if (end === undefined || end > this.length) {
    end = this.length;
  }
  if (end <= 0) {
    return '';
  }

  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;
  if (end <= start) {
    return '';
  }
  if (!encoding) encoding = 'utf8';
  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end);
      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end);
      case 'ascii':
        return asciiSlice(this, start, end);
      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end);
      case 'base64':
        return base64Slice(this, start, end);
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end);
      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true;
function swap(b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}
Buffer.prototype.swap16 = function swap16() {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits');
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this;
};
Buffer.prototype.swap32 = function swap32() {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits');
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this;
};
Buffer.prototype.swap64 = function swap64() {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits');
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this;
};
Buffer.prototype.toString = function toString() {
  var length = this.length;
  if (length === 0) return '';
  if (arguments.length === 0) return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
};
Buffer.prototype.toLocaleString = Buffer.prototype.toString;
Buffer.prototype.equals = function equals(b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
  if (this === b) return true;
  return Buffer.compare(this, b) === 0;
};
Buffer.prototype.inspect = function inspect() {
  var str = '';
  var max = exports.INSPECT_MAX_BYTES;
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
  if (this.length > max) str += ' ... ';
  return '<Buffer ' + str + '>';
};
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
}
Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength);
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + typeof target);
  }
  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }
  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index');
  }
  if (thisStart >= thisEnd && start >= end) {
    return 0;
  }
  if (thisStart >= thisEnd) {
    return -1;
  }
  if (start >= end) {
    return 1;
  }
  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;
  if (this === target) return 0;
  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);
  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);
  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break;
    }
  }
  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1;

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset; // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : buffer.length - 1;
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1;else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;else return -1;
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1;
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }
  throw new TypeError('val must be string, number or Buffer');
}
function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;
  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }
  function read(buf, i) {
    if (indexSize === 1) {
      return buf[i];
    } else {
      return buf.readUInt16BE(i * indexSize);
    }
  }
  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
  }
  return -1;
}
Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1;
};
Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};
Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};
function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }
  var strLen = string.length;
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  var i;
  for (i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (numberIsNaN(parsed)) return i;
    buf[offset + i] = parsed;
  }
  return i;
}
function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}
function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}
function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}
function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}
Buffer.prototype.write = function write(string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
    // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
    // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0;
    if (isFinite(length)) {
      length = length >>> 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  } else {
    throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
  }
  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;
  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds');
  }
  if (!encoding) encoding = 'utf8';
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length);
      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length);
      case 'ascii':
      case 'latin1':
      case 'binary':
        return asciiWrite(this, string, offset, length);
      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length);
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length);
      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};
Buffer.prototype.toJSON = function toJSON() {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};
function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf);
  } else {
    return base64.fromByteArray(buf.slice(start, end));
  }
}
function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];
  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;
    if (i + bytesPerSequence <= end) {
      var secondByte = void 0,
        thirdByte = void 0,
        fourthByte = void 0,
        tempCodePoint = void 0;
      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }
    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }
    res.push(codePoint);
    i += bytesPerSequence;
  }
  return decodeCodePointsArray(res);
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;
function decodeCodePointsArray(codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }
  return res;
}
function asciiSlice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);
  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret;
}
function latin1Slice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);
  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret;
}
function hexSlice(buf, start, end) {
  var len = buf.length;
  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;
  var out = '';
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]];
  }
  return out;
}
function utf16leSlice(buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
  for (var i = 0; i < bytes.length - 1; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res;
}
Buffer.prototype.slice = function slice(start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;
  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }
  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }
  if (end < start) end = start;
  var newBuf = this.subarray(start, end);
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype);
  return newBuf;
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
}
Buffer.prototype.readUintLE = Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  return val;
};
Buffer.prototype.readUintBE = Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }
  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }
  return val;
};
Buffer.prototype.readUint8 = Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset];
};
Buffer.prototype.readUint16LE = Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
};
Buffer.prototype.readUint16BE = Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
};
Buffer.prototype.readUint32LE = Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};
Buffer.prototype.readUint32BE = Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};
Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, 'offset');
  var first = this[offset];
  var last = this[offset + 7];
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8);
  }
  var lo = first + this[++offset] * Math.pow(2, 8) + this[++offset] * Math.pow(2, 16) + this[++offset] * Math.pow(2, 24);
  var hi = this[++offset] + this[++offset] * Math.pow(2, 8) + this[++offset] * Math.pow(2, 16) + last * Math.pow(2, 24);
  return BigInt(lo) + (BigInt(hi) << BigInt(32));
});
Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, 'offset');
  var first = this[offset];
  var last = this[offset + 7];
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8);
  }
  var hi = first * Math.pow(2, 24) + this[++offset] * Math.pow(2, 16) + this[++offset] * Math.pow(2, 8) + this[++offset];
  var lo = this[++offset] * Math.pow(2, 24) + this[++offset] * Math.pow(2, 16) + this[++offset] * Math.pow(2, 8) + last;
  return (BigInt(hi) << BigInt(32)) + BigInt(lo);
});
Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength);
  return val;
};
Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength);
  return val;
};
Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return this[offset];
  return (0xff - this[offset] + 1) * -1;
};
Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | this[offset + 1] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};
Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | this[offset] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};
Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};
Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};
Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, 'offset');
  var first = this[offset];
  var last = this[offset + 7];
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8);
  }
  var val = this[offset + 4] + this[offset + 5] * Math.pow(2, 8) + this[offset + 6] * Math.pow(2, 16) + (last << 24); // Overflow

  return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * Math.pow(2, 8) + this[++offset] * Math.pow(2, 16) + this[++offset] * Math.pow(2, 24));
});
Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, 'offset');
  var first = this[offset];
  var last = this[offset + 7];
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8);
  }
  var val = (first << 24) +
  // Overflow
  this[++offset] * Math.pow(2, 16) + this[++offset] * Math.pow(2, 8) + this[++offset];
  return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * Math.pow(2, 24) + this[++offset] * Math.pow(2, 16) + this[++offset] * Math.pow(2, 8) + last);
});
Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, true, 23, 4);
};
Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, false, 23, 4);
};
Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, true, 52, 8);
};
Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, false, 52, 8);
};
function checkInt(buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
}
Buffer.prototype.writeUintLE = Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }
  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }
  return offset + byteLength;
};
Buffer.prototype.writeUintBE = Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }
  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }
  return offset + byteLength;
};
Buffer.prototype.writeUint8 = Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  this[offset] = value & 0xff;
  return offset + 1;
};
Buffer.prototype.writeUint16LE = Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  this[offset] = value & 0xff;
  this[offset + 1] = value >>> 8;
  return offset + 2;
};
Buffer.prototype.writeUint16BE = Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  this[offset] = value >>> 8;
  this[offset + 1] = value & 0xff;
  return offset + 2;
};
Buffer.prototype.writeUint32LE = Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  this[offset + 3] = value >>> 24;
  this[offset + 2] = value >>> 16;
  this[offset + 1] = value >>> 8;
  this[offset] = value & 0xff;
  return offset + 4;
};
Buffer.prototype.writeUint32BE = Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  this[offset] = value >>> 24;
  this[offset + 1] = value >>> 16;
  this[offset + 2] = value >>> 8;
  this[offset + 3] = value & 0xff;
  return offset + 4;
};
function wrtBigUInt64LE(buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7);
  var lo = Number(value & BigInt(0xffffffff));
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  var hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  return offset;
}
function wrtBigUInt64BE(buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7);
  var lo = Number(value & BigInt(0xffffffff));
  buf[offset + 7] = lo;
  lo = lo >> 8;
  buf[offset + 6] = lo;
  lo = lo >> 8;
  buf[offset + 5] = lo;
  lo = lo >> 8;
  buf[offset + 4] = lo;
  var hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
  buf[offset + 3] = hi;
  hi = hi >> 8;
  buf[offset + 2] = hi;
  hi = hi >> 8;
  buf[offset + 1] = hi;
  hi = hi >> 8;
  buf[offset] = hi;
  return offset + 8;
}
Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'));
});
Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'));
});
Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);
    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }
  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }
  return offset + byteLength;
};
Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);
    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }
  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }
  return offset + byteLength;
};
Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = value & 0xff;
  return offset + 1;
};
Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  this[offset] = value & 0xff;
  this[offset + 1] = value >>> 8;
  return offset + 2;
};
Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  this[offset] = value >>> 8;
  this[offset + 1] = value & 0xff;
  return offset + 2;
};
Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  this[offset] = value & 0xff;
  this[offset + 1] = value >>> 8;
  this[offset + 2] = value >>> 16;
  this[offset + 3] = value >>> 24;
  return offset + 4;
};
Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  this[offset] = value >>> 24;
  this[offset + 1] = value >>> 16;
  this[offset + 2] = value >>> 8;
  this[offset + 3] = value & 0xff;
  return offset + 4;
};
Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return wrtBigUInt64LE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'));
});
Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return wrtBigUInt64BE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'));
});
function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
  if (offset < 0) throw new RangeError('Index out of range');
}
function writeFloat(buf, value, offset, littleEndian, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}
Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
};
Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
};
function writeDouble(buf, value, offset, littleEndian, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}
Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
};
Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy(target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length === 0 || this.length === 0) return 0;

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds');
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
  if (end < 0) throw new RangeError('sourceEnd out of bounds');

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }
  var len = end - start;
  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end);
  } else {
    Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
  }
  return len;
};

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill(val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string');
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding);
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code;
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  } else if (typeof val === 'boolean') {
    val = Number(val);
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index');
  }
  if (end <= start) {
    return this;
  }
  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;
  if (!val) val = 0;
  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
    var len = bytes.length;
    if (len === 0) {
      throw new TypeError('The value "' + val + '" is invalid for argument "value"');
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }
  return this;
};

// CUSTOM ERRORS
// =============

// Simplified versions from Node, changed for Buffer-only usage
var errors = {};
function E(sym, getMessage, Base) {
  errors[sym] = /*#__PURE__*/function (_Base) {
    _inherits(NodeError, _Base);
    var _super = _createSuper(NodeError);
    function NodeError() {
      var _this;
      _classCallCheck(this, NodeError);
      _this = _super.call(this);
      Object.defineProperty(_assertThisInitialized(_this), 'message', {
        value: getMessage.apply(_assertThisInitialized(_this), arguments),
        writable: true,
        configurable: true
      });

      // Add the error code to the name to include it in the stack trace.
      _this.name = "".concat(_this.name, " [").concat(sym, "]");
      // Access the stack to generate the error message including the error code
      // from the name.
      _this.stack; // eslint-disable-line no-unused-expressions
      // Reset the name to the actual name.
      delete _this.name;
      return _this;
    }
    _createClass(NodeError, [{
      key: "code",
      get: function get() {
        return sym;
      },
      set: function set(value) {
        Object.defineProperty(this, 'code', {
          configurable: true,
          enumerable: true,
          value: value,
          writable: true
        });
      }
    }, {
      key: "toString",
      value: function toString() {
        return "".concat(this.name, " [").concat(sym, "]: ").concat(this.message);
      }
    }]);
    return NodeError;
  }(Base);
}
E('ERR_BUFFER_OUT_OF_BOUNDS', function (name) {
  if (name) {
    return "".concat(name, " is outside of buffer bounds");
  }
  return 'Attempt to access memory outside buffer bounds';
}, RangeError);
E('ERR_INVALID_ARG_TYPE', function (name, actual) {
  return "The \"".concat(name, "\" argument must be of type number. Received type ").concat(typeof actual);
}, TypeError);
E('ERR_OUT_OF_RANGE', function (str, range, input) {
  var msg = "The value of \"".concat(str, "\" is out of range.");
  var received = input;
  if (Number.isInteger(input) && Math.abs(input) > Math.pow(2, 32)) {
    received = addNumericalSeparator(String(input));
  } else if (typeof input === 'bigint') {
    received = String(input);
    if (input > Math.pow(BigInt(2), BigInt(32)) || input < -Math.pow(BigInt(2), BigInt(32))) {
      received = addNumericalSeparator(received);
    }
    received += 'n';
  }
  msg += " It must be ".concat(range, ". Received ").concat(received);
  return msg;
}, RangeError);
function addNumericalSeparator(val) {
  var res = '';
  var i = val.length;
  var start = val[0] === '-' ? 1 : 0;
  for (; i >= start + 4; i -= 3) {
    res = "_".concat(val.slice(i - 3, i)).concat(res);
  }
  return "".concat(val.slice(0, i)).concat(res);
}

// CHECK FUNCTIONS
// ===============

function checkBounds(buf, offset, byteLength) {
  validateNumber(offset, 'offset');
  if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {
    boundsError(offset, buf.length - (byteLength + 1));
  }
}
function checkIntBI(value, min, max, buf, offset, byteLength) {
  if (value > max || value < min) {
    var n = typeof min === 'bigint' ? 'n' : '';
    var range;
    if (byteLength > 3) {
      if (min === 0 || min === BigInt(0)) {
        range = ">= 0".concat(n, " and < 2").concat(n, " ** ").concat((byteLength + 1) * 8).concat(n);
      } else {
        range = ">= -(2".concat(n, " ** ").concat((byteLength + 1) * 8 - 1).concat(n, ") and < 2 ** ") + "".concat((byteLength + 1) * 8 - 1).concat(n);
      }
    } else {
      range = ">= ".concat(min).concat(n, " and <= ").concat(max).concat(n);
    }
    throw new errors.ERR_OUT_OF_RANGE('value', range, value);
  }
  checkBounds(buf, offset, byteLength);
}
function validateNumber(value, name) {
  if (typeof value !== 'number') {
    throw new errors.ERR_INVALID_ARG_TYPE(name, 'number', value);
  }
}
function boundsError(value, length, type) {
  if (Math.floor(value) !== value) {
    validateNumber(value, type);
    throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value);
  }
  if (length < 0) {
    throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
  }
  throw new errors.ERR_OUT_OF_RANGE(type || 'offset', ">= ".concat(type ? 1 : 0, " and <= ").concat(length), value);
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
function base64clean(str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0];
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return '';
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str;
}
function utf8ToBytes(string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];
  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        }

        // valid lead
        leadSurrogate = codePoint;
        continue;
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue;
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }
    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break;
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break;
      bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break;
      bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break;
      bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else {
      throw new Error('Invalid code point');
    }
  }
  return bytes;
}
function asciiToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray;
}
function utf16leToBytes(str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break;
    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }
  return byteArray;
}
function base64ToBytes(str) {
  return base64.toByteArray(base64clean(str));
}
function blitBuffer(src, dst, offset, length) {
  var i;
  for (i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }
  return i;
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance(obj, type) {
  return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
}
function numberIsNaN(obj) {
  // For IE11 support
  return obj !== obj; // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = function () {
  var alphabet = '0123456789abcdef';
  var table = new Array(256);
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16;
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j];
    }
  }
  return table;
}();

// Return not function with Error if BigInt not supported
function defineBigIntMethod(fn) {
  return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn;
}
function BufferBigIntNotDefined() {
  throw new Error('BigInt not supported');
}

/***/ }),

/***/ 8041:
/***/ (function(module) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function' ? R.apply : function ReflectApply(target, receiver, args) {
  return Function.prototype.apply.call(target, receiver, args);
};
var ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}
function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}
var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};
function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;
function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}
Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function get() {
    return defaultMaxListeners;
  },
  set: function set(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});
EventEmitter.init = function () {
  if (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }
  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};
function _getMaxListeners(that) {
  if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}
EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};
EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = type === 'error';
  var events = this._events;
  if (events !== undefined) doError = doError && events.error === undefined;else if (!doError) return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0) er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];
  if (handler === undefined) return false;
  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i) ReflectApply(listeners[i], this, args);
  }
  return true;
};
function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;
  checkListener(listener);
  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type, listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }
  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + String(type) + ' listeners ' + 'added. Use emitter.setMaxListeners() to ' + 'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }
  return target;
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};
EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.prependListener = function prependListener(type, listener) {
  return _addListener(this, type, listener, true);
};
function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0) return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}
function _onceWrap(target, type, listener) {
  var state = {
    fired: false,
    wrapFn: undefined,
    target: target,
    type: type,
    listener: listener
  };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}
EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};
EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
  checkListener(listener);
  this.prependListener(type, _onceWrap(this, type, listener));
  return this;
};

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener = function removeListener(type, listener) {
  var list, events, position, i, originalListener;
  checkListener(listener);
  events = this._events;
  if (events === undefined) return this;
  list = events[type];
  if (list === undefined) return this;
  if (list === listener || list.listener === listener) {
    if (--this._eventsCount === 0) this._events = Object.create(null);else {
      delete events[type];
      if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
    }
  } else if (typeof list !== 'function') {
    position = -1;
    for (i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || list[i].listener === listener) {
        originalListener = list[i].listener;
        position = i;
        break;
      }
    }
    if (position < 0) return this;
    if (position === 0) list.shift();else {
      spliceOne(list, position);
    }
    if (list.length === 1) events[type] = list[0];
    if (events.removeListener !== undefined) this.emit('removeListener', type, originalListener || listener);
  }
  return this;
};
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
  var listeners, events, i;
  events = this._events;
  if (events === undefined) return this;

  // not listening for removeListener, no need to emit
  if (events.removeListener === undefined) {
    if (arguments.length === 0) {
      this._events = Object.create(null);
      this._eventsCount = 0;
    } else if (events[type] !== undefined) {
      if (--this._eventsCount === 0) this._events = Object.create(null);else delete events[type];
    }
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    var keys = Object.keys(events);
    var key;
    for (i = 0; i < keys.length; ++i) {
      key = keys[i];
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = Object.create(null);
    this._eventsCount = 0;
    return this;
  }
  listeners = events[type];
  if (typeof listeners === 'function') {
    this.removeListener(type, listeners);
  } else if (listeners !== undefined) {
    // LIFO order
    for (i = listeners.length - 1; i >= 0; i--) {
      this.removeListener(type, listeners[i]);
    }
  }
  return this;
};
function _listeners(target, type, unwrap) {
  var events = target._events;
  if (events === undefined) return [];
  var evlistener = events[type];
  if (evlistener === undefined) return [];
  if (typeof evlistener === 'function') return unwrap ? [evlistener.listener || evlistener] : [evlistener];
  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}
EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};
EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};
EventEmitter.listenerCount = function (emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};
EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;
  if (events !== undefined) {
    var evlistener = events[type];
    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }
  return 0;
}
EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};
function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i) copy[i] = arr[i];
  return copy;
}
function spliceOne(list, index) {
  for (; index + 1 < list.length; index++) list[index] = list[index + 1];
  list.pop();
}
function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}
function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }
    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    }
    ;
    eventTargetAgnosticAddListener(emitter, name, resolver, {
      once: true
    });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, {
        once: true
      });
    }
  });
}
function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}
function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

/***/ }),

/***/ 545:
/***/ (function(__unused_webpack_module, exports) {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};
exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);
  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }
    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }
  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
  buffer[offset + i - d] |= s * 128;
};

/***/ }),

/***/ 7490:
/***/ (function(module) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;
function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}
(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }
  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();
function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  }
  // if setTimeout wasn't available but was latter defined
  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }
  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}
function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  }
  // if clearTimeout wasn't available but was latter defined
  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }
  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }
  draining = false;
  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }
  if (queue.length) {
    drainQueue();
  }
}
function drainQueue() {
  if (draining) {
    return;
  }
  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;
  while (len) {
    currentQueue = queue;
    queue = [];
    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }
    queueIndex = -1;
    len = queue.length;
  }
  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}
process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);
  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }
  queue.push(new Item(fun, args));
  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
};

// v8 likes predictible objects
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};
function noop() {}
process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;
process.listeners = function (name) {
  return [];
};
process.binding = function (name) {
  throw new Error('process.binding is not supported');
};
process.cwd = function () {
  return '/';
};
process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};
process.umask = function () {
  return 0;
};

/***/ }),

/***/ 1580:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(4706),
  AbortError = _require.AbortError,
  codes = _require.codes;
var eos = __webpack_require__(4297);
var ERR_INVALID_ARG_TYPE = codes.ERR_INVALID_ARG_TYPE;

// This method is inlined here for readable-stream
// It also does not allow for signal to not exist on the stream
// https://github.com/nodejs/node/pull/36061#discussion_r533718029
var validateAbortSignal = function validateAbortSignal(signal, name) {
  if (typeof signal !== 'object' || !('aborted' in signal)) {
    throw new ERR_INVALID_ARG_TYPE(name, 'AbortSignal', signal);
  }
};
function isNodeStream(obj) {
  return !!(obj && typeof obj.pipe === 'function');
}
module.exports.addAbortSignal = function addAbortSignal(signal, stream) {
  validateAbortSignal(signal, 'signal');
  if (!isNodeStream(stream)) {
    throw new ERR_INVALID_ARG_TYPE('stream', 'stream.Stream', stream);
  }
  return module.exports.addAbortSignalNoValidate(signal, stream);
};
module.exports.addAbortSignalNoValidate = function (signal, stream) {
  if (typeof signal !== 'object' || !('aborted' in signal)) {
    return stream;
  }
  var onAbort = function onAbort() {
    stream.destroy(new AbortError(undefined, {
      cause: signal.reason
    }));
  };
  if (signal.aborted) {
    onAbort();
  } else {
    signal.addEventListener('abort', onAbort);
    eos(stream, function () {
      return signal.removeEventListener('abort', onAbort);
    });
  }
  return stream;
};

/***/ }),

/***/ 5489:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _objectSpread = (__webpack_require__(2122)["default"]);
var _regeneratorRuntime = (__webpack_require__(7061)["default"]);
var _classCallCheck = (__webpack_require__(6690)["default"]);
var _createClass = (__webpack_require__(9728)["default"]);
var _require = __webpack_require__(1070),
  StringPrototypeSlice = _require.StringPrototypeSlice,
  SymbolIterator = _require.SymbolIterator,
  TypedArrayPrototypeSet = _require.TypedArrayPrototypeSet,
  Uint8Array = _require.Uint8Array;
var _require2 = __webpack_require__(918),
  Buffer = _require2.Buffer;
var _require3 = __webpack_require__(7067),
  inspect = _require3.inspect;
module.exports = /*#__PURE__*/function (_Symbol$for) {
  function BufferList() {
    _classCallCheck(this, BufferList);
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;
      while ((p = p.next) !== null) ret += s + p.data;
      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;
      while (p) {
        TypedArrayPrototypeSet(ret, p.data, i);
        i += p.data.length;
        p = p.next;
      }
      return ret;
    }

    // Consumes a specified amount of bytes or characters from the buffered data.
  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var data = this.head.data;
      if (n < data.length) {
        // `slice` is the same for buffers and strings.
        var slice = data.slice(0, n);
        this.head.data = data.slice(n);
        return slice;
      }
      if (n === data.length) {
        // First chunk is a perfect match.
        return this.shift();
      }
      // Result spans more than one buffer.
      return hasStrings ? this._getString(n) : this._getBuffer(n);
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    }
  }, {
    key: SymbolIterator,
    value: /*#__PURE__*/_regeneratorRuntime().mark(function value() {
      var p;
      return _regeneratorRuntime().wrap(function value$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            p = this.head;
          case 1:
            if (!p) {
              _context.next = 7;
              break;
            }
            _context.next = 4;
            return p.data;
          case 4:
            p = p.next;
            _context.next = 1;
            break;
          case 7:
          case "end":
            return _context.stop();
        }
      }, value, this);
    }) // Consumes a specified amount of characters from the buffered data.
  }, {
    key: "_getString",
    value: function _getString(n) {
      var ret = '';
      var p = this.head;
      var c = 0;
      do {
        var str = p.data;
        if (n > str.length) {
          ret += str;
          n -= str.length;
        } else {
          if (n === str.length) {
            ret += str;
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            ret += StringPrototypeSlice(str, 0, n);
            this.head = p;
            p.data = StringPrototypeSlice(str, n);
          }
          break;
        }
        ++c;
      } while ((p = p.next) !== null);
      this.length -= c;
      return ret;
    }

    // Consumes a specified amount of bytes from the buffered data.
  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var retLen = n;
      var p = this.head;
      var c = 0;
      do {
        var buf = p.data;
        if (n > buf.length) {
          TypedArrayPrototypeSet(ret, buf, retLen - n);
          n -= buf.length;
        } else {
          if (n === buf.length) {
            TypedArrayPrototypeSet(ret, buf, retLen - n);
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            TypedArrayPrototypeSet(ret, new Uint8Array(buf.buffer, buf.byteOffset, n), retLen - n);
            this.head = p;
            p.data = buf.slice(n);
          }
          break;
        }
        ++c;
      } while ((p = p.next) !== null);
      this.length -= c;
      return ret;
    }

    // Make sure the linked list only shows the minimal necessary information.
  }, {
    key: _Symbol$for,
    value: function value(_, options) {
      return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);
  return BufferList;
}(Symbol.for('nodejs.util.inspect.custom'));

/***/ }),

/***/ 8457:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(6545),
  pipeline = _require.pipeline;
var Duplex = __webpack_require__(6637);
var _require2 = __webpack_require__(6617),
  destroyer = _require2.destroyer;
var _require3 = __webpack_require__(6767),
  isNodeStream = _require3.isNodeStream,
  isReadable = _require3.isReadable,
  isWritable = _require3.isWritable;
var _require4 = __webpack_require__(4706),
  AbortError = _require4.AbortError,
  _require4$codes = _require4.codes,
  ERR_INVALID_ARG_VALUE = _require4$codes.ERR_INVALID_ARG_VALUE,
  ERR_MISSING_ARGS = _require4$codes.ERR_MISSING_ARGS;
module.exports = function compose() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }
  if (streams.length === 0) {
    throw new ERR_MISSING_ARGS('streams');
  }
  if (streams.length === 1) {
    return Duplex.from(streams[0]);
  }
  var orgStreams = [].concat(streams);
  if (typeof streams[0] === 'function') {
    streams[0] = Duplex.from(streams[0]);
  }
  if (typeof streams[streams.length - 1] === 'function') {
    var idx = streams.length - 1;
    streams[idx] = Duplex.from(streams[idx]);
  }
  for (var n = 0; n < streams.length; ++n) {
    if (!isNodeStream(streams[n])) {
      // TODO(ronag): Add checks for non streams.
      continue;
    }
    if (n < streams.length - 1 && !isReadable(streams[n])) {
      throw new ERR_INVALID_ARG_VALUE("streams[".concat(n, "]"), orgStreams[n], 'must be readable');
    }
    if (n > 0 && !isWritable(streams[n])) {
      throw new ERR_INVALID_ARG_VALUE("streams[".concat(n, "]"), orgStreams[n], 'must be writable');
    }
  }
  var ondrain;
  var onfinish;
  var onreadable;
  var onclose;
  var d;
  function onfinished(err) {
    var cb = onclose;
    onclose = null;
    if (cb) {
      cb(err);
    } else if (err) {
      d.destroy(err);
    } else if (!readable && !writable) {
      d.destroy();
    }
  }
  var head = streams[0];
  var tail = pipeline(streams, onfinished);
  var writable = !!isWritable(head);
  var readable = !!isReadable(tail);

  // TODO(ronag): Avoid double buffering.
  // Implement Writable/Readable/Duplex traits.
  // See, https://github.com/nodejs/node/pull/33515.
  d = new Duplex({
    // TODO (ronag): highWaterMark?
    writableObjectMode: !!(head !== null && head !== undefined && head.writableObjectMode),
    readableObjectMode: !!(tail !== null && tail !== undefined && tail.writableObjectMode),
    writable: writable,
    readable: readable
  });
  if (writable) {
    d._write = function (chunk, encoding, callback) {
      if (head.write(chunk, encoding)) {
        callback();
      } else {
        ondrain = callback;
      }
    };
    d._final = function (callback) {
      head.end();
      onfinish = callback;
    };
    head.on('drain', function () {
      if (ondrain) {
        var cb = ondrain;
        ondrain = null;
        cb();
      }
    });
    tail.on('finish', function () {
      if (onfinish) {
        var cb = onfinish;
        onfinish = null;
        cb();
      }
    });
  }
  if (readable) {
    tail.on('readable', function () {
      if (onreadable) {
        var cb = onreadable;
        onreadable = null;
        cb();
      }
    });
    tail.on('end', function () {
      d.push(null);
    });
    d._read = function () {
      while (true) {
        var buf = tail.read();
        if (buf === null) {
          onreadable = d._read;
          return;
        }
        if (!d.push(buf)) {
          return;
        }
      }
    };
  }
  d._destroy = function (err, callback) {
    if (!err && onclose !== null) {
      err = new AbortError();
    }
    onreadable = null;
    ondrain = null;
    onfinish = null;
    if (onclose === null) {
      callback(err);
    } else {
      onclose = callback;
      destroyer(tail, err);
    }
  };
  return d;
};

/***/ }),

/***/ 6617:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


/* replacement start */
var process = __webpack_require__(7490);

/* replacement end */

var _require = __webpack_require__(4706),
  aggregateTwoErrors = _require.aggregateTwoErrors,
  ERR_MULTIPLE_CALLBACK = _require.codes.ERR_MULTIPLE_CALLBACK,
  AbortError = _require.AbortError;
var _require2 = __webpack_require__(1070),
  Symbol = _require2.Symbol;
var _require3 = __webpack_require__(6767),
  kDestroyed = _require3.kDestroyed,
  isDestroyed = _require3.isDestroyed,
  isFinished = _require3.isFinished,
  isServerRequest = _require3.isServerRequest;
var kDestroy = Symbol('kDestroy');
var kConstruct = Symbol('kConstruct');
function checkError(err, w, r) {
  if (err) {
    // Avoid V8 leak, https://github.com/nodejs/node/pull/34103#issuecomment-652002364
    err.stack; // eslint-disable-line no-unused-expressions

    if (w && !w.errored) {
      w.errored = err;
    }
    if (r && !r.errored) {
      r.errored = err;
    }
  }
}

// Backwards compat. cb() is undocumented and unused in core but
// unfortunately might be used by modules.
function destroy(err, cb) {
  var r = this._readableState;
  var w = this._writableState;
  // With duplex streams we use the writable side for state.
  var s = w || r;
  if (w && w.destroyed || r && r.destroyed) {
    if (typeof cb === 'function') {
      cb();
    }
    return this;
  }

  // We set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks
  checkError(err, w, r);
  if (w) {
    w.destroyed = true;
  }
  if (r) {
    r.destroyed = true;
  }

  // If still constructing then defer calling _destroy.
  if (!s.constructed) {
    this.once(kDestroy, function (er) {
      _destroy(this, aggregateTwoErrors(er, err), cb);
    });
  } else {
    _destroy(this, err, cb);
  }
  return this;
}
function _destroy(self, err, cb) {
  var called = false;
  function onDestroy(err) {
    if (called) {
      return;
    }
    called = true;
    var r = self._readableState;
    var w = self._writableState;
    checkError(err, w, r);
    if (w) {
      w.closed = true;
    }
    if (r) {
      r.closed = true;
    }
    if (typeof cb === 'function') {
      cb(err);
    }
    if (err) {
      process.nextTick(emitErrorCloseNT, self, err);
    } else {
      process.nextTick(emitCloseNT, self);
    }
  }
  try {
    self._destroy(err || null, onDestroy);
  } catch (err) {
    onDestroy(err);
  }
}
function emitErrorCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}
function emitCloseNT(self) {
  var r = self._readableState;
  var w = self._writableState;
  if (w) {
    w.closeEmitted = true;
  }
  if (r) {
    r.closeEmitted = true;
  }
  if (w && w.emitClose || r && r.emitClose) {
    self.emit('close');
  }
}
function emitErrorNT(self, err) {
  var r = self._readableState;
  var w = self._writableState;
  if (w && w.errorEmitted || r && r.errorEmitted) {
    return;
  }
  if (w) {
    w.errorEmitted = true;
  }
  if (r) {
    r.errorEmitted = true;
  }
  self.emit('error', err);
}
function undestroy() {
  var r = this._readableState;
  var w = this._writableState;
  if (r) {
    r.constructed = true;
    r.closed = false;
    r.closeEmitted = false;
    r.destroyed = false;
    r.errored = null;
    r.errorEmitted = false;
    r.reading = false;
    r.ended = r.readable === false;
    r.endEmitted = r.readable === false;
  }
  if (w) {
    w.constructed = true;
    w.destroyed = false;
    w.closed = false;
    w.closeEmitted = false;
    w.errored = null;
    w.errorEmitted = false;
    w.finalCalled = false;
    w.prefinished = false;
    w.ended = w.writable === false;
    w.ending = w.writable === false;
    w.finished = w.writable === false;
  }
}
function errorOrDestroy(stream, err, sync) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.

  var r = stream._readableState;
  var w = stream._writableState;
  if (w && w.destroyed || r && r.destroyed) {
    return this;
  }
  if (r && r.autoDestroy || w && w.autoDestroy) stream.destroy(err);else if (err) {
    // Avoid V8 leak, https://github.com/nodejs/node/pull/34103#issuecomment-652002364
    err.stack; // eslint-disable-line no-unused-expressions

    if (w && !w.errored) {
      w.errored = err;
    }
    if (r && !r.errored) {
      r.errored = err;
    }
    if (sync) {
      process.nextTick(emitErrorNT, stream, err);
    } else {
      emitErrorNT(stream, err);
    }
  }
}
function construct(stream, cb) {
  if (typeof stream._construct !== 'function') {
    return;
  }
  var r = stream._readableState;
  var w = stream._writableState;
  if (r) {
    r.constructed = false;
  }
  if (w) {
    w.constructed = false;
  }
  stream.once(kConstruct, cb);
  if (stream.listenerCount(kConstruct) > 1) {
    // Duplex
    return;
  }
  process.nextTick(constructNT, stream);
}
function constructNT(stream) {
  var called = false;
  function onConstruct(err) {
    if (called) {
      errorOrDestroy(stream, err !== null && err !== undefined ? err : new ERR_MULTIPLE_CALLBACK());
      return;
    }
    called = true;
    var r = stream._readableState;
    var w = stream._writableState;
    var s = w || r;
    if (r) {
      r.constructed = true;
    }
    if (w) {
      w.constructed = true;
    }
    if (s.destroyed) {
      stream.emit(kDestroy, err);
    } else if (err) {
      errorOrDestroy(stream, err, true);
    } else {
      process.nextTick(emitConstructNT, stream);
    }
  }
  try {
    stream._construct(onConstruct);
  } catch (err) {
    onConstruct(err);
  }
}
function emitConstructNT(stream) {
  stream.emit(kConstruct);
}
function isRequest(stream) {
  return stream && stream.setHeader && typeof stream.abort === 'function';
}
function emitCloseLegacy(stream) {
  stream.emit('close');
}
function emitErrorCloseLegacy(stream, err) {
  stream.emit('error', err);
  process.nextTick(emitCloseLegacy, stream);
}

// Normalize destroy for legacy.
function destroyer(stream, err) {
  if (!stream || isDestroyed(stream)) {
    return;
  }
  if (!err && !isFinished(stream)) {
    err = new AbortError();
  }

  // TODO: Remove isRequest branches.
  if (isServerRequest(stream)) {
    stream.socket = null;
    stream.destroy(err);
  } else if (isRequest(stream)) {
    stream.abort();
  } else if (isRequest(stream.req)) {
    stream.req.abort();
  } else if (typeof stream.destroy === 'function') {
    stream.destroy(err);
  } else if (typeof stream.close === 'function') {
    // TODO: Don't lose err?
    stream.close();
  } else if (err) {
    process.nextTick(emitErrorCloseLegacy, stream, err);
  } else {
    process.nextTick(emitCloseLegacy, stream);
  }
  if (!stream.destroyed) {
    stream[kDestroyed] = true;
  }
}
module.exports = {
  construct: construct,
  destroyer: destroyer,
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};

/***/ }),

/***/ 6637:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototype inheritance, this class
// prototypically inherits from Readable, and then parasitically from
// Writable.



var _objectSpread = (__webpack_require__(2122)["default"]);
var _require = __webpack_require__(1070),
  ObjectDefineProperties = _require.ObjectDefineProperties,
  ObjectGetOwnPropertyDescriptor = _require.ObjectGetOwnPropertyDescriptor,
  ObjectKeys = _require.ObjectKeys,
  ObjectSetPrototypeOf = _require.ObjectSetPrototypeOf;
module.exports = Duplex;
var Readable = __webpack_require__(8581);
var Writable = __webpack_require__(3613);
ObjectSetPrototypeOf(Duplex.prototype, Readable.prototype);
ObjectSetPrototypeOf(Duplex, Readable);
{
  var keys = ObjectKeys(Writable.prototype);
  // Allow the keys array to be GC'ed.
  for (var i = 0; i < keys.length; i++) {
    var method = keys[i];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}
function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  if (options) {
    this.allowHalfOpen = options.allowHalfOpen !== false;
    if (options.readable === false) {
      this._readableState.readable = false;
      this._readableState.ended = true;
      this._readableState.endEmitted = true;
    }
    if (options.writable === false) {
      this._writableState.writable = false;
      this._writableState.ending = true;
      this._writableState.ended = true;
      this._writableState.finished = true;
    }
  } else {
    this.allowHalfOpen = true;
  }
}
ObjectDefineProperties(Duplex.prototype, {
  writable: _objectSpread({
    __proto__: null
  }, ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writable')),
  writableHighWaterMark: _objectSpread({
    __proto__: null
  }, ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableHighWaterMark')),
  writableObjectMode: _objectSpread({
    __proto__: null
  }, ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableObjectMode')),
  writableBuffer: _objectSpread({
    __proto__: null
  }, ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableBuffer')),
  writableLength: _objectSpread({
    __proto__: null
  }, ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableLength')),
  writableFinished: _objectSpread({
    __proto__: null
  }, ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableFinished')),
  writableCorked: _objectSpread({
    __proto__: null
  }, ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableCorked')),
  writableEnded: _objectSpread({
    __proto__: null
  }, ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableEnded')),
  writableNeedDrain: _objectSpread({
    __proto__: null
  }, ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableNeedDrain')),
  destroyed: {
    __proto__: null,
    get: function get() {
      if (this._readableState === undefined || this._writableState === undefined) {
        return false;
      }
      return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function set(value) {
      // Backward compatibility, the user is explicitly
      // managing destroyed.
      if (this._readableState && this._writableState) {
        this._readableState.destroyed = value;
        this._writableState.destroyed = value;
      }
    }
  }
});
var webStreamsAdapters;

// Lazy to avoid circular references
function lazyWebStreams() {
  if (webStreamsAdapters === undefined) webStreamsAdapters = {};
  return webStreamsAdapters;
}
Duplex.fromWeb = function (pair, options) {
  return lazyWebStreams().newStreamDuplexFromReadableWritablePair(pair, options);
};
Duplex.toWeb = function (duplex) {
  return lazyWebStreams().newReadableWritablePairFromDuplex(duplex);
};
var duplexify;
Duplex.from = function (body) {
  if (!duplexify) {
    duplexify = __webpack_require__(830);
  }
  return duplexify(body, 'body');
};

/***/ }),

/***/ 830:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _regeneratorRuntime = (__webpack_require__(7061)["default"]);
var _asyncToGenerator = (__webpack_require__(7156)["default"]);
var _createClass = (__webpack_require__(9728)["default"]);
var _classCallCheck = (__webpack_require__(6690)["default"]);
var _inherits = (__webpack_require__(1655)["default"]);
var _createSuper = (__webpack_require__(6389)["default"]);
var _awaitAsyncGenerator = (__webpack_require__(6737)["default"]);
var _wrapAsyncGenerator = (__webpack_require__(8186)["default"]);
/* replacement start */

var process = __webpack_require__(7490)

/* replacement end */;

'use strict';
var bufferModule = __webpack_require__(918);
var _require = __webpack_require__(6767),
  isReadable = _require.isReadable,
  isWritable = _require.isWritable,
  isIterable = _require.isIterable,
  isNodeStream = _require.isNodeStream,
  isReadableNodeStream = _require.isReadableNodeStream,
  isWritableNodeStream = _require.isWritableNodeStream,
  isDuplexNodeStream = _require.isDuplexNodeStream;
var eos = __webpack_require__(4297);
var _require2 = __webpack_require__(4706),
  AbortError = _require2.AbortError,
  _require2$codes = _require2.codes,
  ERR_INVALID_ARG_TYPE = _require2$codes.ERR_INVALID_ARG_TYPE,
  ERR_INVALID_RETURN_VALUE = _require2$codes.ERR_INVALID_RETURN_VALUE;
var _require3 = __webpack_require__(6617),
  destroyer = _require3.destroyer;
var Duplex = __webpack_require__(6637);
var Readable = __webpack_require__(8581);
var _require4 = __webpack_require__(7067),
  createDeferredPromise = _require4.createDeferredPromise;
var from = __webpack_require__(6129);
var Blob = globalThis.Blob || bufferModule.Blob;
var isBlob = typeof Blob !== 'undefined' ? function isBlob(b) {
  return b instanceof Blob;
} : function isBlob(b) {
  return false;
};
var AbortController = globalThis.AbortController || (__webpack_require__(7547).AbortController);
var _require5 = __webpack_require__(1070),
  FunctionPrototypeCall = _require5.FunctionPrototypeCall;

// This is needed for pre node 17.
var Duplexify = /*#__PURE__*/function (_Duplex) {
  "use strict";

  _inherits(Duplexify, _Duplex);
  var _super = _createSuper(Duplexify);
  function Duplexify(options) {
    var _this;
    _classCallCheck(this, Duplexify);
    _this = _super.call(this, options);

    // https://github.com/nodejs/node/pull/34385

    if ((options === null || options === undefined ? undefined : options.readable) === false) {
      _this._readableState.readable = false;
      _this._readableState.ended = true;
      _this._readableState.endEmitted = true;
    }
    if ((options === null || options === undefined ? undefined : options.writable) === false) {
      _this._writableState.writable = false;
      _this._writableState.ending = true;
      _this._writableState.ended = true;
      _this._writableState.finished = true;
    }
    return _this;
  }
  return _createClass(Duplexify);
}(Duplex);
module.exports = function duplexify(body, name) {
  if (isDuplexNodeStream(body)) {
    return body;
  }
  if (isReadableNodeStream(body)) {
    return _duplexify({
      readable: body
    });
  }
  if (isWritableNodeStream(body)) {
    return _duplexify({
      writable: body
    });
  }
  if (isNodeStream(body)) {
    return _duplexify({
      writable: false,
      readable: false
    });
  }

  // TODO: Webstreams
  // if (isReadableStream(body)) {
  //   return _duplexify({ readable: Readable.fromWeb(body) });
  // }

  // TODO: Webstreams
  // if (isWritableStream(body)) {
  //   return _duplexify({ writable: Writable.fromWeb(body) });
  // }

  if (typeof body === 'function') {
    var _fromAsyncGen = fromAsyncGen(body),
      value = _fromAsyncGen.value,
      write = _fromAsyncGen.write,
      _final = _fromAsyncGen.final,
      destroy = _fromAsyncGen.destroy;
    if (isIterable(value)) {
      return from(Duplexify, value, {
        // TODO (ronag): highWaterMark?
        objectMode: true,
        write: write,
        final: _final,
        destroy: destroy
      });
    }
    var _then = value === null || value === undefined ? undefined : value.then;
    if (typeof _then === 'function') {
      var d;
      var promise = FunctionPrototypeCall(_then, value, function (val) {
        if (val != null) {
          throw new ERR_INVALID_RETURN_VALUE('nully', 'body', val);
        }
      }, function (err) {
        destroyer(d, err);
      });
      return d = new Duplexify({
        // TODO (ronag): highWaterMark?
        objectMode: true,
        readable: false,
        write: write,
        final: function final(cb) {
          _final( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  _context.next = 3;
                  return promise;
                case 3:
                  process.nextTick(cb, null);
                  _context.next = 9;
                  break;
                case 6:
                  _context.prev = 6;
                  _context.t0 = _context["catch"](0);
                  process.nextTick(cb, _context.t0);
                case 9:
                case "end":
                  return _context.stop();
              }
            }, _callee, null, [[0, 6]]);
          })));
        },
        destroy: destroy
      });
    }
    throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or AsyncFunction', name, value);
  }
  if (isBlob(body)) {
    return duplexify(body.arrayBuffer());
  }
  if (isIterable(body)) {
    return from(Duplexify, body, {
      // TODO (ronag): highWaterMark?
      objectMode: true,
      writable: false
    });
  }

  // TODO: Webstreams.
  // if (
  //   isReadableStream(body?.readable) &&
  //   isWritableStream(body?.writable)
  // ) {
  //   return Duplexify.fromWeb(body);
  // }

  if (typeof (body === null || body === undefined ? undefined : body.writable) === 'object' || typeof (body === null || body === undefined ? undefined : body.readable) === 'object') {
    var readable = body !== null && body !== undefined && body.readable ? isReadableNodeStream(body === null || body === undefined ? undefined : body.readable) ? body === null || body === undefined ? undefined : body.readable : duplexify(body.readable) : undefined;
    var writable = body !== null && body !== undefined && body.writable ? isWritableNodeStream(body === null || body === undefined ? undefined : body.writable) ? body === null || body === undefined ? undefined : body.writable : duplexify(body.writable) : undefined;
    return _duplexify({
      readable: readable,
      writable: writable
    });
  }
  var then = body === null || body === undefined ? undefined : body.then;
  if (typeof then === 'function') {
    var _d;
    FunctionPrototypeCall(then, body, function (val) {
      if (val != null) {
        _d.push(val);
      }
      _d.push(null);
    }, function (err) {
      destroyer(_d, err);
    });
    return _d = new Duplexify({
      objectMode: true,
      writable: false,
      read: function read() {}
    });
  }
  throw new ERR_INVALID_ARG_TYPE(name, ['Blob', 'ReadableStream', 'WritableStream', 'Stream', 'Iterable', 'AsyncIterable', 'Function', '{ readable, writable } pair', 'Promise'], body);
};
function fromAsyncGen(fn) {
  var _createDeferredPromis = createDeferredPromise(),
    promise = _createDeferredPromis.promise,
    resolve = _createDeferredPromis.resolve;
  var ac = new AbortController();
  var signal = ac.signal;
  var value = fn(_wrapAsyncGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var _promise, _yield$_awaitAsyncGen, chunk, done, cb, _createDeferredPromis2;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          if (false) {}
          _promise = promise;
          promise = null;
          _context2.next = 5;
          return _awaitAsyncGenerator(_promise);
        case 5:
          _yield$_awaitAsyncGen = _context2.sent;
          chunk = _yield$_awaitAsyncGen.chunk;
          done = _yield$_awaitAsyncGen.done;
          cb = _yield$_awaitAsyncGen.cb;
          process.nextTick(cb);
          if (!done) {
            _context2.next = 12;
            break;
          }
          return _context2.abrupt("return");
        case 12:
          if (!signal.aborted) {
            _context2.next = 14;
            break;
          }
          throw new AbortError(undefined, {
            cause: signal.reason
          });
        case 14:
          _createDeferredPromis2 = createDeferredPromise();
          promise = _createDeferredPromis2.promise;
          resolve = _createDeferredPromis2.resolve;
          _context2.next = 19;
          return chunk;
        case 19:
          _context2.next = 0;
          break;
        case 21:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }))(), {
    signal: signal
  });
  return {
    value: value,
    write: function write(chunk, encoding, cb) {
      var _resolve = resolve;
      resolve = null;
      _resolve({
        chunk: chunk,
        done: false,
        cb: cb
      });
    },
    final: function final(cb) {
      var _resolve = resolve;
      resolve = null;
      _resolve({
        done: true,
        cb: cb
      });
    },
    destroy: function destroy(err, cb) {
      ac.abort();
      cb(err);
    }
  };
}
function _duplexify(pair) {
  var r = pair.readable && typeof pair.readable.read !== 'function' ? Readable.wrap(pair.readable) : pair.readable;
  var w = pair.writable;
  var readable = !!isReadable(r);
  var writable = !!isWritable(w);
  var ondrain;
  var onfinish;
  var onreadable;
  var onclose;
  var d;
  function onfinished(err) {
    var cb = onclose;
    onclose = null;
    if (cb) {
      cb(err);
    } else if (err) {
      d.destroy(err);
    } else if (!readable && !writable) {
      d.destroy();
    }
  }

  // TODO(ronag): Avoid double buffering.
  // Implement Writable/Readable/Duplex traits.
  // See, https://github.com/nodejs/node/pull/33515.
  d = new Duplexify({
    // TODO (ronag): highWaterMark?
    readableObjectMode: !!(r !== null && r !== undefined && r.readableObjectMode),
    writableObjectMode: !!(w !== null && w !== undefined && w.writableObjectMode),
    readable: readable,
    writable: writable
  });
  if (writable) {
    eos(w, function (err) {
      writable = false;
      if (err) {
        destroyer(r, err);
      }
      onfinished(err);
    });
    d._write = function (chunk, encoding, callback) {
      if (w.write(chunk, encoding)) {
        callback();
      } else {
        ondrain = callback;
      }
    };
    d._final = function (callback) {
      w.end();
      onfinish = callback;
    };
    w.on('drain', function () {
      if (ondrain) {
        var cb = ondrain;
        ondrain = null;
        cb();
      }
    });
    w.on('finish', function () {
      if (onfinish) {
        var cb = onfinish;
        onfinish = null;
        cb();
      }
    });
  }
  if (readable) {
    eos(r, function (err) {
      readable = false;
      if (err) {
        destroyer(r, err);
      }
      onfinished(err);
    });
    r.on('readable', function () {
      if (onreadable) {
        var cb = onreadable;
        onreadable = null;
        cb();
      }
    });
    r.on('end', function () {
      d.push(null);
    });
    d._read = function () {
      while (true) {
        var buf = r.read();
        if (buf === null) {
          onreadable = d._read;
          return;
        }
        if (!d.push(buf)) {
          return;
        }
      }
    };
  }
  d._destroy = function (err, callback) {
    if (!err && onclose !== null) {
      err = new AbortError();
    }
    onreadable = null;
    ondrain = null;
    onfinish = null;
    if (onclose === null) {
      callback(err);
    } else {
      onclose = callback;
      destroyer(w, err);
      destroyer(r, err);
    }
  };
  return d;
}

/***/ }),

/***/ 4297:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/* replacement start */

var process = __webpack_require__(7490)

/* replacement end */
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).
;

'use strict';
var _require = __webpack_require__(4706),
  AbortError = _require.AbortError,
  codes = _require.codes;
var ERR_INVALID_ARG_TYPE = codes.ERR_INVALID_ARG_TYPE,
  ERR_STREAM_PREMATURE_CLOSE = codes.ERR_STREAM_PREMATURE_CLOSE;
var _require2 = __webpack_require__(7067),
  kEmptyObject = _require2.kEmptyObject,
  once = _require2.once;
var _require3 = __webpack_require__(1066),
  validateAbortSignal = _require3.validateAbortSignal,
  validateFunction = _require3.validateFunction,
  validateObject = _require3.validateObject;
var _require4 = __webpack_require__(1070),
  Promise = _require4.Promise;
var _require5 = __webpack_require__(6767),
  isClosed = _require5.isClosed,
  isReadable = _require5.isReadable,
  isReadableNodeStream = _require5.isReadableNodeStream,
  isReadableFinished = _require5.isReadableFinished,
  isReadableErrored = _require5.isReadableErrored,
  isWritable = _require5.isWritable,
  isWritableNodeStream = _require5.isWritableNodeStream,
  isWritableFinished = _require5.isWritableFinished,
  isWritableErrored = _require5.isWritableErrored,
  isNodeStream = _require5.isNodeStream,
  _willEmitClose = _require5.willEmitClose;
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
var nop = function nop() {};
function eos(stream, options, callback) {
  var _options$readable, _options$writable;
  if (arguments.length === 2) {
    callback = options;
    options = kEmptyObject;
  } else if (options == null) {
    options = kEmptyObject;
  } else {
    validateObject(options, 'options');
  }
  validateFunction(callback, 'callback');
  validateAbortSignal(options.signal, 'options.signal');
  callback = once(callback);
  var readable = (_options$readable = options.readable) !== null && _options$readable !== undefined ? _options$readable : isReadableNodeStream(stream);
  var writable = (_options$writable = options.writable) !== null && _options$writable !== undefined ? _options$writable : isWritableNodeStream(stream);
  if (!isNodeStream(stream)) {
    // TODO: Webstreams.
    throw new ERR_INVALID_ARG_TYPE('stream', 'Stream', stream);
  }
  var wState = stream._writableState;
  var rState = stream._readableState;
  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) {
      onfinish();
    }
  };

  // TODO (ronag): Improve soft detection to include core modules and
  // common ecosystem modules that do properly emit 'close' but fail
  // this generic check.
  var willEmitClose = _willEmitClose(stream) && isReadableNodeStream(stream) === readable && isWritableNodeStream(stream) === writable;
  var writableFinished = isWritableFinished(stream, false);
  var onfinish = function onfinish() {
    writableFinished = true;
    // Stream should not be destroyed here. If it is that
    // means that user space is doing something differently and
    // we cannot trust willEmitClose.
    if (stream.destroyed) {
      willEmitClose = false;
    }
    if (willEmitClose && (!stream.readable || readable)) {
      return;
    }
    if (!readable || readableFinished) {
      callback.call(stream);
    }
  };
  var readableFinished = isReadableFinished(stream, false);
  var onend = function onend() {
    readableFinished = true;
    // Stream should not be destroyed here. If it is that
    // means that user space is doing something differently and
    // we cannot trust willEmitClose.
    if (stream.destroyed) {
      willEmitClose = false;
    }
    if (willEmitClose && (!stream.writable || writable)) {
      return;
    }
    if (!writable || writableFinished) {
      callback.call(stream);
    }
  };
  var onerror = function onerror(err) {
    callback.call(stream, err);
  };
  var closed = isClosed(stream);
  var onclose = function onclose() {
    closed = true;
    var errored = isWritableErrored(stream) || isReadableErrored(stream);
    if (errored && typeof errored !== 'boolean') {
      return callback.call(stream, errored);
    }
    if (readable && !readableFinished && isReadableNodeStream(stream, true)) {
      if (!isReadableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
    }
    if (writable && !writableFinished) {
      if (!isWritableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
    }
    callback.call(stream);
  };
  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };
  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    if (!willEmitClose) {
      stream.on('abort', onclose);
    }
    if (stream.req) {
      onrequest();
    } else {
      stream.on('request', onrequest);
    }
  } else if (writable && !wState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }

  // Not all streams will emit 'close' after 'aborted'.
  if (!willEmitClose && typeof stream.aborted === 'boolean') {
    stream.on('aborted', onclose);
  }
  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (options.error !== false) {
    stream.on('error', onerror);
  }
  stream.on('close', onclose);
  if (closed) {
    process.nextTick(onclose);
  } else if (wState !== null && wState !== undefined && wState.errorEmitted || rState !== null && rState !== undefined && rState.errorEmitted) {
    if (!willEmitClose) {
      process.nextTick(onclose);
    }
  } else if (!readable && (!willEmitClose || isReadable(stream)) && (writableFinished || isWritable(stream) === false)) {
    process.nextTick(onclose);
  } else if (!writable && (!willEmitClose || isWritable(stream)) && (readableFinished || isReadable(stream) === false)) {
    process.nextTick(onclose);
  } else if (rState && stream.req && stream.aborted) {
    process.nextTick(onclose);
  }
  var cleanup = function cleanup() {
    callback = nop;
    stream.removeListener('aborted', onclose);
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
  if (options.signal && !closed) {
    var abort = function abort() {
      // Keep it because cleanup removes it.
      var endCallback = callback;
      cleanup();
      endCallback.call(stream, new AbortError(undefined, {
        cause: options.signal.reason
      }));
    };
    if (options.signal.aborted) {
      process.nextTick(abort);
    } else {
      var originalCallback = callback;
      callback = once(function () {
        options.signal.removeEventListener('abort', abort);
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        originalCallback.apply(stream, args);
      });
      options.signal.addEventListener('abort', abort);
    }
  }
  return cleanup;
}
function finished(stream, opts) {
  return new Promise(function (resolve, reject) {
    eos(stream, opts, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
module.exports = eos;
module.exports.finished = finished;

/***/ }),

/***/ 6129:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


/* replacement start */
var _regeneratorRuntime = (__webpack_require__(7061)["default"]);
var _asyncToGenerator = (__webpack_require__(7156)["default"]);
var _objectSpread = (__webpack_require__(2122)["default"]);
var process = __webpack_require__(7490);

/* replacement end */

var _require = __webpack_require__(1070),
  PromisePrototypeThen = _require.PromisePrototypeThen,
  SymbolAsyncIterator = _require.SymbolAsyncIterator,
  SymbolIterator = _require.SymbolIterator;
var _require2 = __webpack_require__(918),
  Buffer = _require2.Buffer;
var _require$codes = (__webpack_require__(4706).codes),
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES;
function from(Readable, iterable, opts) {
  var iterator;
  if (typeof iterable === 'string' || iterable instanceof Buffer) {
    return new Readable(_objectSpread(_objectSpread({
      objectMode: true
    }, opts), {}, {
      read: function read() {
        this.push(iterable);
        this.push(null);
      }
    }));
  }
  var isAsync;
  if (iterable && iterable[SymbolAsyncIterator]) {
    isAsync = true;
    iterator = iterable[SymbolAsyncIterator]();
  } else if (iterable && iterable[SymbolIterator]) {
    isAsync = false;
    iterator = iterable[SymbolIterator]();
  } else {
    throw new ERR_INVALID_ARG_TYPE('iterable', ['Iterable'], iterable);
  }
  var readable = new Readable(_objectSpread({
    objectMode: true,
    highWaterMark: 1
  }, opts));

  // Flag to protect against _read
  // being called before last iteration completion.
  var reading = false;
  readable._read = function () {
    if (!reading) {
      reading = true;
      next();
    }
  };
  readable._destroy = function (error, cb) {
    PromisePrototypeThen(close(error), function () {
      return process.nextTick(cb, error);
    },
    // nextTick is here in case cb throws
    function (e) {
      return process.nextTick(cb, e || error);
    });
  };
  function close(_x) {
    return _close.apply(this, arguments);
  }
  function _close() {
    _close = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(error) {
      var hadError, hasThrow, _yield$iterator$throw, value, done, _yield$iterator$retur, _value;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            hadError = error !== undefined && error !== null;
            hasThrow = typeof iterator.throw === 'function';
            if (!(hadError && hasThrow)) {
              _context.next = 12;
              break;
            }
            _context.next = 5;
            return iterator.throw(error);
          case 5:
            _yield$iterator$throw = _context.sent;
            value = _yield$iterator$throw.value;
            done = _yield$iterator$throw.done;
            _context.next = 10;
            return value;
          case 10:
            if (!done) {
              _context.next = 12;
              break;
            }
            return _context.abrupt("return");
          case 12:
            if (!(typeof iterator.return === 'function')) {
              _context.next = 19;
              break;
            }
            _context.next = 15;
            return iterator.return();
          case 15:
            _yield$iterator$retur = _context.sent;
            _value = _yield$iterator$retur.value;
            _context.next = 19;
            return _value;
          case 19:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return _close.apply(this, arguments);
  }
  function next() {
    return _next.apply(this, arguments);
  }
  function _next() {
    _next = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var _ref, value, done, res;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            if (!isAsync) {
              _context2.next = 7;
              break;
            }
            _context2.next = 4;
            return iterator.next();
          case 4:
            _context2.t0 = _context2.sent;
            _context2.next = 8;
            break;
          case 7:
            _context2.t0 = iterator.next();
          case 8:
            _ref = _context2.t0;
            value = _ref.value;
            done = _ref.done;
            if (!done) {
              _context2.next = 15;
              break;
            }
            readable.push(null);
            _context2.next = 33;
            break;
          case 15:
            if (!(value && typeof value.then === 'function')) {
              _context2.next = 21;
              break;
            }
            _context2.next = 18;
            return value;
          case 18:
            _context2.t1 = _context2.sent;
            _context2.next = 22;
            break;
          case 21:
            _context2.t1 = value;
          case 22:
            res = _context2.t1;
            if (!(res === null)) {
              _context2.next = 28;
              break;
            }
            reading = false;
            throw new ERR_STREAM_NULL_VALUES();
          case 28:
            if (!readable.push(res)) {
              _context2.next = 32;
              break;
            }
            return _context2.abrupt("continue", 39);
          case 32:
            reading = false;
          case 33:
            _context2.next = 38;
            break;
          case 35:
            _context2.prev = 35;
            _context2.t2 = _context2["catch"](0);
            readable.destroy(_context2.t2);
          case 38:
            return _context2.abrupt("break", 41);
          case 39:
            _context2.next = 0;
            break;
          case 41:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[0, 35]]);
    }));
    return _next.apply(this, arguments);
  }
  return readable;
}
module.exports = from;

/***/ }),

/***/ 4647:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(1070),
  ArrayIsArray = _require.ArrayIsArray,
  ObjectSetPrototypeOf = _require.ObjectSetPrototypeOf;
var _require2 = __webpack_require__(8041),
  EE = _require2.EventEmitter;
function Stream(opts) {
  EE.call(this, opts);
}
ObjectSetPrototypeOf(Stream.prototype, EE.prototype);
ObjectSetPrototypeOf(Stream, EE);
Stream.prototype.pipe = function (dest, options) {
  var source = this;
  function ondata(chunk) {
    if (dest.writable && dest.write(chunk) === false && source.pause) {
      source.pause();
    }
  }
  source.on('data', ondata);
  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }
  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }
  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;
    dest.end();
  }
  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;
    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // Don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      this.emit('error', er);
    }
  }
  prependListener(source, 'error', onerror);
  prependListener(dest, 'error', onerror);

  // Remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);
    source.removeListener('end', onend);
    source.removeListener('close', onclose);
    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);
    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);
    dest.removeListener('close', cleanup);
  }
  source.on('end', cleanup);
  source.on('close', cleanup);
  dest.on('close', cleanup);
  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};
function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (ArrayIsArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}
module.exports = {
  Stream: Stream,
  prependListener: prependListener
};

/***/ }),

/***/ 3668:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _defineProperty = (__webpack_require__(8416)["default"]);
var _createClass = (__webpack_require__(9728)["default"]);
var _classCallCheck = (__webpack_require__(6690)["default"]);
var _inherits = (__webpack_require__(1655)["default"]);
var _createSuper = (__webpack_require__(6389)["default"]);
var _regeneratorRuntime = (__webpack_require__(7061)["default"]);
var _asyncToGenerator = (__webpack_require__(7156)["default"]);
var _asyncGeneratorDelegate = (__webpack_require__(8131)["default"]);
var _asyncIterator = (__webpack_require__(8237)["default"]);
var _awaitAsyncGenerator = (__webpack_require__(6737)["default"]);
var _wrapAsyncGenerator = (__webpack_require__(8186)["default"]);
var AbortController = globalThis.AbortController || (__webpack_require__(7547).AbortController);
var _require = __webpack_require__(4706),
  _require$codes = _require.codes,
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
  ERR_OUT_OF_RANGE = _require$codes.ERR_OUT_OF_RANGE,
  AbortError = _require.AbortError;
var _require2 = __webpack_require__(1066),
  validateAbortSignal = _require2.validateAbortSignal,
  validateInteger = _require2.validateInteger,
  validateObject = _require2.validateObject;
var kWeakHandler = (__webpack_require__(1070).Symbol)('kWeak');
var _require3 = __webpack_require__(4297),
  finished = _require3.finished;
var _require4 = __webpack_require__(1070),
  ArrayPrototypePush = _require4.ArrayPrototypePush,
  MathFloor = _require4.MathFloor,
  Number = _require4.Number,
  NumberIsNaN = _require4.NumberIsNaN,
  Promise = _require4.Promise,
  PromiseReject = _require4.PromiseReject,
  PromisePrototypeThen = _require4.PromisePrototypeThen,
  Symbol = _require4.Symbol;
var kEmpty = Symbol('kEmpty');
var kEof = Symbol('kEof');
function map(fn, options) {
  if (typeof fn !== 'function') {
    throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
  }
  if (options != null) {
    validateObject(options, 'options');
  }
  if ((options === null || options === undefined ? undefined : options.signal) != null) {
    validateAbortSignal(options.signal, 'options.signal');
  }
  var concurrency = 1;
  if ((options === null || options === undefined ? undefined : options.concurrency) != null) {
    concurrency = MathFloor(options.concurrency);
  }
  validateInteger(concurrency, 'concurrency', 1);
  return /*#__PURE__*/function () {
    var _map = _wrapAsyncGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var _options$signal, _options$signal2, ac, stream, queue, signal, signalOpt, abort, next, resume, done, onDone, pump, _pump, val;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _pump = function _pump3() {
              _pump = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
                var _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, _val2, _val, _val3, _options$signal3;
                return _regeneratorRuntime().wrap(function _callee$(_context) {
                  while (1) switch (_context.prev = _context.next) {
                    case 0:
                      _context.prev = 0;
                      _iteratorAbruptCompletion = false;
                      _didIteratorError = false;
                      _context.prev = 3;
                      _iterator = _asyncIterator(stream);
                    case 5:
                      _context.next = 7;
                      return _iterator.next();
                    case 7:
                      if (!(_iteratorAbruptCompletion = !(_step = _context.sent).done)) {
                        _context.next = 25;
                        break;
                      }
                      _val2 = _step.value;
                      if (!done) {
                        _context.next = 11;
                        break;
                      }
                      return _context.abrupt("return");
                    case 11:
                      if (!signal.aborted) {
                        _context.next = 13;
                        break;
                      }
                      throw new AbortError();
                    case 13:
                      try {
                        _val2 = fn(_val2, signalOpt);
                      } catch (err) {
                        _val2 = PromiseReject(err);
                      }
                      if (!(_val2 === kEmpty)) {
                        _context.next = 16;
                        break;
                      }
                      return _context.abrupt("continue", 22);
                    case 16:
                      if (typeof ((_val = _val2) === null || _val === undefined ? undefined : _val.catch) === 'function') {
                        _val2.catch(onDone);
                      }
                      queue.push(_val2);
                      if (next) {
                        next();
                        next = null;
                      }
                      if (!(!done && queue.length && queue.length >= concurrency)) {
                        _context.next = 22;
                        break;
                      }
                      _context.next = 22;
                      return new Promise(function (resolve) {
                        resume = resolve;
                      });
                    case 22:
                      _iteratorAbruptCompletion = false;
                      _context.next = 5;
                      break;
                    case 25:
                      _context.next = 31;
                      break;
                    case 27:
                      _context.prev = 27;
                      _context.t0 = _context["catch"](3);
                      _didIteratorError = true;
                      _iteratorError = _context.t0;
                    case 31:
                      _context.prev = 31;
                      _context.prev = 32;
                      if (!(_iteratorAbruptCompletion && _iterator.return != null)) {
                        _context.next = 36;
                        break;
                      }
                      _context.next = 36;
                      return _iterator.return();
                    case 36:
                      _context.prev = 36;
                      if (!_didIteratorError) {
                        _context.next = 39;
                        break;
                      }
                      throw _iteratorError;
                    case 39:
                      return _context.finish(36);
                    case 40:
                      return _context.finish(31);
                    case 41:
                      queue.push(kEof);
                      _context.next = 49;
                      break;
                    case 44:
                      _context.prev = 44;
                      _context.t1 = _context["catch"](0);
                      _val3 = PromiseReject(_context.t1);
                      PromisePrototypeThen(_val3, undefined, onDone);
                      queue.push(_val3);
                    case 49:
                      _context.prev = 49;
                      done = true;
                      if (next) {
                        next();
                        next = null;
                      }
                      options === null || options === undefined ? undefined : (_options$signal3 = options.signal) === null || _options$signal3 === undefined ? undefined : _options$signal3.removeEventListener('abort', abort);
                      return _context.finish(49);
                    case 54:
                    case "end":
                      return _context.stop();
                  }
                }, _callee, null, [[0, 44, 49, 54], [3, 27, 31, 41], [32,, 36, 40]]);
              }));
              return _pump.apply(this, arguments);
            };
            pump = function _pump2() {
              return _pump.apply(this, arguments);
            };
            onDone = function _onDone() {
              done = true;
            };
            ac = new AbortController();
            stream = this;
            queue = [];
            signal = ac.signal;
            signalOpt = {
              signal: signal
            };
            abort = function abort() {
              return ac.abort();
            };
            if (options !== null && options !== undefined && (_options$signal = options.signal) !== null && _options$signal !== undefined && _options$signal.aborted) {
              abort();
            }
            options === null || options === undefined ? undefined : (_options$signal2 = options.signal) === null || _options$signal2 === undefined ? undefined : _options$signal2.addEventListener('abort', abort);
            done = false;
            pump();
            _context2.prev = 13;
          case 14:
            if (false) {}
          case 15:
            if (!(queue.length > 0)) {
              _context2.next = 30;
              break;
            }
            _context2.next = 18;
            return _awaitAsyncGenerator(queue[0]);
          case 18:
            val = _context2.sent;
            if (!(val === kEof)) {
              _context2.next = 21;
              break;
            }
            return _context2.abrupt("return");
          case 21:
            if (!signal.aborted) {
              _context2.next = 23;
              break;
            }
            throw new AbortError();
          case 23:
            if (!(val !== kEmpty)) {
              _context2.next = 26;
              break;
            }
            _context2.next = 26;
            return val;
          case 26:
            queue.shift();
            if (resume) {
              resume();
              resume = null;
            }
            _context2.next = 15;
            break;
          case 30:
            _context2.next = 32;
            return _awaitAsyncGenerator(new Promise(function (resolve) {
              next = resolve;
            }));
          case 32:
            _context2.next = 14;
            break;
          case 34:
            _context2.prev = 34;
            ac.abort();
            done = true;
            if (resume) {
              resume();
              resume = null;
            }
            return _context2.finish(34);
          case 39:
          case "end":
            return _context2.stop();
        }
      }, _callee2, this, [[13,, 34, 39]]);
    }));
    function map() {
      return _map.apply(this, arguments);
    }
    return map;
  }().call(this);
}
function asIndexedPairs() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
  if (options != null) {
    validateObject(options, 'options');
  }
  if ((options === null || options === undefined ? undefined : options.signal) != null) {
    validateAbortSignal(options.signal, 'options.signal');
  }
  return /*#__PURE__*/function () {
    var _asIndexedPairs = _wrapAsyncGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
      var index, _iteratorAbruptCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, val, _options$signal4;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            index = 0;
            _iteratorAbruptCompletion2 = false;
            _didIteratorError2 = false;
            _context3.prev = 3;
            _iterator2 = _asyncIterator(this);
          case 5:
            _context3.next = 7;
            return _awaitAsyncGenerator(_iterator2.next());
          case 7:
            if (!(_iteratorAbruptCompletion2 = !(_step2 = _context3.sent).done)) {
              _context3.next = 16;
              break;
            }
            val = _step2.value;
            if (!(options !== null && options !== undefined && (_options$signal4 = options.signal) !== null && _options$signal4 !== undefined && _options$signal4.aborted)) {
              _context3.next = 11;
              break;
            }
            throw new AbortError({
              cause: options.signal.reason
            });
          case 11:
            _context3.next = 13;
            return [index++, val];
          case 13:
            _iteratorAbruptCompletion2 = false;
            _context3.next = 5;
            break;
          case 16:
            _context3.next = 22;
            break;
          case 18:
            _context3.prev = 18;
            _context3.t0 = _context3["catch"](3);
            _didIteratorError2 = true;
            _iteratorError2 = _context3.t0;
          case 22:
            _context3.prev = 22;
            _context3.prev = 23;
            if (!(_iteratorAbruptCompletion2 && _iterator2.return != null)) {
              _context3.next = 27;
              break;
            }
            _context3.next = 27;
            return _awaitAsyncGenerator(_iterator2.return());
          case 27:
            _context3.prev = 27;
            if (!_didIteratorError2) {
              _context3.next = 30;
              break;
            }
            throw _iteratorError2;
          case 30:
            return _context3.finish(27);
          case 31:
            return _context3.finish(22);
          case 32:
          case "end":
            return _context3.stop();
        }
      }, _callee3, this, [[3, 18, 22, 32], [23,, 27, 31]]);
    }));
    function asIndexedPairs() {
      return _asIndexedPairs.apply(this, arguments);
    }
    return asIndexedPairs;
  }().call(this);
}
function some(_x) {
  return _some.apply(this, arguments);
}
function _some() {
  _some = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(fn) {
    var options,
      _iteratorAbruptCompletion3,
      _didIteratorError3,
      _iteratorError3,
      _iterator3,
      _step3,
      unused,
      _args8 = arguments;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          options = _args8.length > 1 && _args8[1] !== undefined ? _args8[1] : undefined;
          _iteratorAbruptCompletion3 = false;
          _didIteratorError3 = false;
          _context8.prev = 3;
          _iterator3 = _asyncIterator(filter.call(this, fn, options));
        case 5:
          _context8.next = 7;
          return _iterator3.next();
        case 7:
          if (!(_iteratorAbruptCompletion3 = !(_step3 = _context8.sent).done)) {
            _context8.next = 13;
            break;
          }
          unused = _step3.value;
          return _context8.abrupt("return", true);
        case 10:
          _iteratorAbruptCompletion3 = false;
          _context8.next = 5;
          break;
        case 13:
          _context8.next = 19;
          break;
        case 15:
          _context8.prev = 15;
          _context8.t0 = _context8["catch"](3);
          _didIteratorError3 = true;
          _iteratorError3 = _context8.t0;
        case 19:
          _context8.prev = 19;
          _context8.prev = 20;
          if (!(_iteratorAbruptCompletion3 && _iterator3.return != null)) {
            _context8.next = 24;
            break;
          }
          _context8.next = 24;
          return _iterator3.return();
        case 24:
          _context8.prev = 24;
          if (!_didIteratorError3) {
            _context8.next = 27;
            break;
          }
          throw _iteratorError3;
        case 27:
          return _context8.finish(24);
        case 28:
          return _context8.finish(19);
        case 29:
          return _context8.abrupt("return", false);
        case 30:
        case "end":
          return _context8.stop();
      }
    }, _callee8, this, [[3, 15, 19, 29], [20,, 24, 28]]);
  }));
  return _some.apply(this, arguments);
}
function every(_x2) {
  return _every.apply(this, arguments);
}
function _every() {
  _every = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(fn) {
    var options,
      _args10 = arguments;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          options = _args10.length > 1 && _args10[1] !== undefined ? _args10[1] : undefined;
          if (!(typeof fn !== 'function')) {
            _context10.next = 3;
            break;
          }
          throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
        case 3:
          _context10.next = 5;
          return some.call(this, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
            var _args9 = arguments;
            return _regeneratorRuntime().wrap(function _callee9$(_context9) {
              while (1) switch (_context9.prev = _context9.next) {
                case 0:
                  _context9.next = 2;
                  return fn.apply(void 0, _args9);
                case 2:
                  return _context9.abrupt("return", !_context9.sent);
                case 3:
                case "end":
                  return _context9.stop();
              }
            }, _callee9);
          })), options);
        case 5:
          return _context10.abrupt("return", !_context10.sent);
        case 6:
        case "end":
          return _context10.stop();
      }
    }, _callee10, this);
  }));
  return _every.apply(this, arguments);
}
function find(_x3, _x4) {
  return _find.apply(this, arguments);
}
function _find() {
  _find = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(fn, options) {
    var _iteratorAbruptCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, result;
    return _regeneratorRuntime().wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _iteratorAbruptCompletion4 = false;
          _didIteratorError4 = false;
          _context11.prev = 2;
          _iterator4 = _asyncIterator(filter.call(this, fn, options));
        case 4:
          _context11.next = 6;
          return _iterator4.next();
        case 6:
          if (!(_iteratorAbruptCompletion4 = !(_step4 = _context11.sent).done)) {
            _context11.next = 12;
            break;
          }
          result = _step4.value;
          return _context11.abrupt("return", result);
        case 9:
          _iteratorAbruptCompletion4 = false;
          _context11.next = 4;
          break;
        case 12:
          _context11.next = 18;
          break;
        case 14:
          _context11.prev = 14;
          _context11.t0 = _context11["catch"](2);
          _didIteratorError4 = true;
          _iteratorError4 = _context11.t0;
        case 18:
          _context11.prev = 18;
          _context11.prev = 19;
          if (!(_iteratorAbruptCompletion4 && _iterator4.return != null)) {
            _context11.next = 23;
            break;
          }
          _context11.next = 23;
          return _iterator4.return();
        case 23:
          _context11.prev = 23;
          if (!_didIteratorError4) {
            _context11.next = 26;
            break;
          }
          throw _iteratorError4;
        case 26:
          return _context11.finish(23);
        case 27:
          return _context11.finish(18);
        case 28:
          return _context11.abrupt("return", undefined);
        case 29:
        case "end":
          return _context11.stop();
      }
    }, _callee11, this, [[2, 14, 18, 28], [19,, 23, 27]]);
  }));
  return _find.apply(this, arguments);
}
function forEach(_x5, _x6) {
  return _forEach.apply(this, arguments);
}
function _forEach() {
  _forEach = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(fn, options) {
    var forEachFn, _forEachFn, _iteratorAbruptCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, unused;
    return _regeneratorRuntime().wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _forEachFn = function _forEachFn3() {
            _forEachFn = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(value, options) {
              return _regeneratorRuntime().wrap(function _callee12$(_context12) {
                while (1) switch (_context12.prev = _context12.next) {
                  case 0:
                    _context12.next = 2;
                    return fn(value, options);
                  case 2:
                    return _context12.abrupt("return", kEmpty);
                  case 3:
                  case "end":
                    return _context12.stop();
                }
              }, _callee12);
            }));
            return _forEachFn.apply(this, arguments);
          };
          forEachFn = function _forEachFn2(_x13, _x14) {
            return _forEachFn.apply(this, arguments);
          };
          if (!(typeof fn !== 'function')) {
            _context13.next = 4;
            break;
          }
          throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
        case 4:
          // eslint-disable-next-line no-unused-vars
          _iteratorAbruptCompletion5 = false;
          _didIteratorError5 = false;
          _context13.prev = 6;
          _iterator5 = _asyncIterator(map.call(this, forEachFn, options));
        case 8:
          _context13.next = 10;
          return _iterator5.next();
        case 10:
          if (!(_iteratorAbruptCompletion5 = !(_step5 = _context13.sent).done)) {
            _context13.next = 16;
            break;
          }
          unused = _step5.value;
          ;
        case 13:
          _iteratorAbruptCompletion5 = false;
          _context13.next = 8;
          break;
        case 16:
          _context13.next = 22;
          break;
        case 18:
          _context13.prev = 18;
          _context13.t0 = _context13["catch"](6);
          _didIteratorError5 = true;
          _iteratorError5 = _context13.t0;
        case 22:
          _context13.prev = 22;
          _context13.prev = 23;
          if (!(_iteratorAbruptCompletion5 && _iterator5.return != null)) {
            _context13.next = 27;
            break;
          }
          _context13.next = 27;
          return _iterator5.return();
        case 27:
          _context13.prev = 27;
          if (!_didIteratorError5) {
            _context13.next = 30;
            break;
          }
          throw _iteratorError5;
        case 30:
          return _context13.finish(27);
        case 31:
          return _context13.finish(22);
        case 32:
        case "end":
          return _context13.stop();
      }
    }, _callee13, this, [[6, 18, 22, 32], [23,, 27, 31]]);
  }));
  return _forEach.apply(this, arguments);
}
function filter(fn, options) {
  if (typeof fn !== 'function') {
    throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn);
  }
  function filterFn(_x7, _x8) {
    return _filterFn.apply(this, arguments);
  }
  function _filterFn() {
    _filterFn = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(value, options) {
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return fn(value, options);
          case 2:
            if (!_context4.sent) {
              _context4.next = 4;
              break;
            }
            return _context4.abrupt("return", value);
          case 4:
            return _context4.abrupt("return", kEmpty);
          case 5:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    }));
    return _filterFn.apply(this, arguments);
  }
  return map.call(this, filterFn, options);
}

// Specific to provide better error to reduce since the argument is only
// missing if the stream has no items in it - but the code is still appropriate
var ReduceAwareErrMissingArgs = /*#__PURE__*/function (_ERR_MISSING_ARGS) {
  _inherits(ReduceAwareErrMissingArgs, _ERR_MISSING_ARGS);
  var _super = _createSuper(ReduceAwareErrMissingArgs);
  function ReduceAwareErrMissingArgs() {
    var _this;
    _classCallCheck(this, ReduceAwareErrMissingArgs);
    _this = _super.call(this, 'reduce');
    _this.message = 'Reduce of an empty stream requires an initial value';
    return _this;
  }
  return _createClass(ReduceAwareErrMissingArgs);
}(ERR_MISSING_ARGS);
function reduce(_x9, _x10, _x11) {
  return _reduce.apply(this, arguments);
}
function _reduce() {
  _reduce = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(reducer, initialValue, options) {
    var _options$signal5,
      hasInitialValue,
      err,
      ac,
      signal,
      opts,
      gotAnyItemFromStream,
      _iteratorAbruptCompletion6,
      _didIteratorError6,
      _iteratorError6,
      _iterator6,
      _step6,
      value,
      _options$signal6,
      _args14 = arguments;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          if (!(typeof reducer !== 'function')) {
            _context14.next = 2;
            break;
          }
          throw new ERR_INVALID_ARG_TYPE('reducer', ['Function', 'AsyncFunction'], reducer);
        case 2:
          if (options != null) {
            validateObject(options, 'options');
          }
          if ((options === null || options === undefined ? undefined : options.signal) != null) {
            validateAbortSignal(options.signal, 'options.signal');
          }
          hasInitialValue = _args14.length > 1;
          if (!(options !== null && options !== undefined && (_options$signal5 = options.signal) !== null && _options$signal5 !== undefined && _options$signal5.aborted)) {
            _context14.next = 11;
            break;
          }
          err = new AbortError(undefined, {
            cause: options.signal.reason
          });
          this.once('error', function () {}); // The error is already propagated
          _context14.next = 10;
          return finished(this.destroy(err));
        case 10:
          throw err;
        case 11:
          ac = new AbortController();
          signal = ac.signal;
          if (options !== null && options !== undefined && options.signal) {
            opts = _defineProperty({
              once: true
            }, kWeakHandler, this);
            options.signal.addEventListener('abort', function () {
              return ac.abort();
            }, opts);
          }
          gotAnyItemFromStream = false;
          _context14.prev = 15;
          _iteratorAbruptCompletion6 = false;
          _didIteratorError6 = false;
          _context14.prev = 18;
          _iterator6 = _asyncIterator(this);
        case 20:
          _context14.next = 22;
          return _iterator6.next();
        case 22:
          if (!(_iteratorAbruptCompletion6 = !(_step6 = _context14.sent).done)) {
            _context14.next = 38;
            break;
          }
          value = _step6.value;
          gotAnyItemFromStream = true;
          if (!(options !== null && options !== undefined && (_options$signal6 = options.signal) !== null && _options$signal6 !== undefined && _options$signal6.aborted)) {
            _context14.next = 27;
            break;
          }
          throw new AbortError();
        case 27:
          if (hasInitialValue) {
            _context14.next = 32;
            break;
          }
          initialValue = value;
          hasInitialValue = true;
          _context14.next = 35;
          break;
        case 32:
          _context14.next = 34;
          return reducer(initialValue, value, {
            signal: signal
          });
        case 34:
          initialValue = _context14.sent;
        case 35:
          _iteratorAbruptCompletion6 = false;
          _context14.next = 20;
          break;
        case 38:
          _context14.next = 44;
          break;
        case 40:
          _context14.prev = 40;
          _context14.t0 = _context14["catch"](18);
          _didIteratorError6 = true;
          _iteratorError6 = _context14.t0;
        case 44:
          _context14.prev = 44;
          _context14.prev = 45;
          if (!(_iteratorAbruptCompletion6 && _iterator6.return != null)) {
            _context14.next = 49;
            break;
          }
          _context14.next = 49;
          return _iterator6.return();
        case 49:
          _context14.prev = 49;
          if (!_didIteratorError6) {
            _context14.next = 52;
            break;
          }
          throw _iteratorError6;
        case 52:
          return _context14.finish(49);
        case 53:
          return _context14.finish(44);
        case 54:
          if (!(!gotAnyItemFromStream && !hasInitialValue)) {
            _context14.next = 56;
            break;
          }
          throw new ReduceAwareErrMissingArgs();
        case 56:
          _context14.prev = 56;
          ac.abort();
          return _context14.finish(56);
        case 59:
          return _context14.abrupt("return", initialValue);
        case 60:
        case "end":
          return _context14.stop();
      }
    }, _callee14, this, [[15,, 56, 59], [18, 40, 44, 54], [45,, 49, 53]]);
  }));
  return _reduce.apply(this, arguments);
}
function toArray(_x12) {
  return _toArray.apply(this, arguments);
}
function _toArray() {
  _toArray = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15(options) {
    var result, _iteratorAbruptCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, val, _options$signal7;
    return _regeneratorRuntime().wrap(function _callee15$(_context15) {
      while (1) switch (_context15.prev = _context15.next) {
        case 0:
          if (options != null) {
            validateObject(options, 'options');
          }
          if ((options === null || options === undefined ? undefined : options.signal) != null) {
            validateAbortSignal(options.signal, 'options.signal');
          }
          result = [];
          _iteratorAbruptCompletion7 = false;
          _didIteratorError7 = false;
          _context15.prev = 5;
          _iterator7 = _asyncIterator(this);
        case 7:
          _context15.next = 9;
          return _iterator7.next();
        case 9:
          if (!(_iteratorAbruptCompletion7 = !(_step7 = _context15.sent).done)) {
            _context15.next = 17;
            break;
          }
          val = _step7.value;
          if (!(options !== null && options !== undefined && (_options$signal7 = options.signal) !== null && _options$signal7 !== undefined && _options$signal7.aborted)) {
            _context15.next = 13;
            break;
          }
          throw new AbortError(undefined, {
            cause: options.signal.reason
          });
        case 13:
          ArrayPrototypePush(result, val);
        case 14:
          _iteratorAbruptCompletion7 = false;
          _context15.next = 7;
          break;
        case 17:
          _context15.next = 23;
          break;
        case 19:
          _context15.prev = 19;
          _context15.t0 = _context15["catch"](5);
          _didIteratorError7 = true;
          _iteratorError7 = _context15.t0;
        case 23:
          _context15.prev = 23;
          _context15.prev = 24;
          if (!(_iteratorAbruptCompletion7 && _iterator7.return != null)) {
            _context15.next = 28;
            break;
          }
          _context15.next = 28;
          return _iterator7.return();
        case 28:
          _context15.prev = 28;
          if (!_didIteratorError7) {
            _context15.next = 31;
            break;
          }
          throw _iteratorError7;
        case 31:
          return _context15.finish(28);
        case 32:
          return _context15.finish(23);
        case 33:
          return _context15.abrupt("return", result);
        case 34:
        case "end":
          return _context15.stop();
      }
    }, _callee15, this, [[5, 19, 23, 33], [24,, 28, 32]]);
  }));
  return _toArray.apply(this, arguments);
}
function flatMap(fn, options) {
  var values = map.call(this, fn, options);
  return /*#__PURE__*/function () {
    var _flatMap = _wrapAsyncGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
      var _iteratorAbruptCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, val;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            _iteratorAbruptCompletion8 = false;
            _didIteratorError8 = false;
            _context5.prev = 2;
            _iterator8 = _asyncIterator(values);
          case 4:
            _context5.next = 6;
            return _awaitAsyncGenerator(_iterator8.next());
          case 6:
            if (!(_iteratorAbruptCompletion8 = !(_step8 = _context5.sent).done)) {
              _context5.next = 12;
              break;
            }
            val = _step8.value;
            return _context5.delegateYield(_asyncGeneratorDelegate(_asyncIterator(val), _awaitAsyncGenerator), "t0", 9);
          case 9:
            _iteratorAbruptCompletion8 = false;
            _context5.next = 4;
            break;
          case 12:
            _context5.next = 18;
            break;
          case 14:
            _context5.prev = 14;
            _context5.t1 = _context5["catch"](2);
            _didIteratorError8 = true;
            _iteratorError8 = _context5.t1;
          case 18:
            _context5.prev = 18;
            _context5.prev = 19;
            if (!(_iteratorAbruptCompletion8 && _iterator8.return != null)) {
              _context5.next = 23;
              break;
            }
            _context5.next = 23;
            return _awaitAsyncGenerator(_iterator8.return());
          case 23:
            _context5.prev = 23;
            if (!_didIteratorError8) {
              _context5.next = 26;
              break;
            }
            throw _iteratorError8;
          case 26:
            return _context5.finish(23);
          case 27:
            return _context5.finish(18);
          case 28:
          case "end":
            return _context5.stop();
        }
      }, _callee5, null, [[2, 14, 18, 28], [19,, 23, 27]]);
    }));
    function flatMap() {
      return _flatMap.apply(this, arguments);
    }
    return flatMap;
  }().call(this);
}
function toIntegerOrInfinity(number) {
  // We coerce here to align with the spec
  // https://github.com/tc39/proposal-iterator-helpers/issues/169
  number = Number(number);
  if (NumberIsNaN(number)) {
    return 0;
  }
  if (number < 0) {
    throw new ERR_OUT_OF_RANGE('number', '>= 0', number);
  }
  return number;
}
function drop(number) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  if (options != null) {
    validateObject(options, 'options');
  }
  if ((options === null || options === undefined ? undefined : options.signal) != null) {
    validateAbortSignal(options.signal, 'options.signal');
  }
  number = toIntegerOrInfinity(number);
  return /*#__PURE__*/function () {
    var _drop = _wrapAsyncGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
      var _options$signal8, _iteratorAbruptCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, val, _options$signal9;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            if (!(options !== null && options !== undefined && (_options$signal8 = options.signal) !== null && _options$signal8 !== undefined && _options$signal8.aborted)) {
              _context6.next = 2;
              break;
            }
            throw new AbortError();
          case 2:
            _iteratorAbruptCompletion9 = false;
            _didIteratorError9 = false;
            _context6.prev = 4;
            _iterator9 = _asyncIterator(this);
          case 6:
            _context6.next = 8;
            return _awaitAsyncGenerator(_iterator9.next());
          case 8:
            if (!(_iteratorAbruptCompletion9 = !(_step9 = _context6.sent).done)) {
              _context6.next = 18;
              break;
            }
            val = _step9.value;
            if (!(options !== null && options !== undefined && (_options$signal9 = options.signal) !== null && _options$signal9 !== undefined && _options$signal9.aborted)) {
              _context6.next = 12;
              break;
            }
            throw new AbortError();
          case 12:
            if (!(number-- <= 0)) {
              _context6.next = 15;
              break;
            }
            _context6.next = 15;
            return val;
          case 15:
            _iteratorAbruptCompletion9 = false;
            _context6.next = 6;
            break;
          case 18:
            _context6.next = 24;
            break;
          case 20:
            _context6.prev = 20;
            _context6.t0 = _context6["catch"](4);
            _didIteratorError9 = true;
            _iteratorError9 = _context6.t0;
          case 24:
            _context6.prev = 24;
            _context6.prev = 25;
            if (!(_iteratorAbruptCompletion9 && _iterator9.return != null)) {
              _context6.next = 29;
              break;
            }
            _context6.next = 29;
            return _awaitAsyncGenerator(_iterator9.return());
          case 29:
            _context6.prev = 29;
            if (!_didIteratorError9) {
              _context6.next = 32;
              break;
            }
            throw _iteratorError9;
          case 32:
            return _context6.finish(29);
          case 33:
            return _context6.finish(24);
          case 34:
          case "end":
            return _context6.stop();
        }
      }, _callee6, this, [[4, 20, 24, 34], [25,, 29, 33]]);
    }));
    function drop() {
      return _drop.apply(this, arguments);
    }
    return drop;
  }().call(this);
}
function take(number) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  if (options != null) {
    validateObject(options, 'options');
  }
  if ((options === null || options === undefined ? undefined : options.signal) != null) {
    validateAbortSignal(options.signal, 'options.signal');
  }
  number = toIntegerOrInfinity(number);
  return /*#__PURE__*/function () {
    var _take = _wrapAsyncGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
      var _options$signal10, _iteratorAbruptCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, val, _options$signal11;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            if (!(options !== null && options !== undefined && (_options$signal10 = options.signal) !== null && _options$signal10 !== undefined && _options$signal10.aborted)) {
              _context7.next = 2;
              break;
            }
            throw new AbortError();
          case 2:
            _iteratorAbruptCompletion10 = false;
            _didIteratorError10 = false;
            _context7.prev = 4;
            _iterator10 = _asyncIterator(this);
          case 6:
            _context7.next = 8;
            return _awaitAsyncGenerator(_iterator10.next());
          case 8:
            if (!(_iteratorAbruptCompletion10 = !(_step10 = _context7.sent).done)) {
              _context7.next = 21;
              break;
            }
            val = _step10.value;
            if (!(options !== null && options !== undefined && (_options$signal11 = options.signal) !== null && _options$signal11 !== undefined && _options$signal11.aborted)) {
              _context7.next = 12;
              break;
            }
            throw new AbortError();
          case 12:
            if (!(number-- > 0)) {
              _context7.next = 17;
              break;
            }
            _context7.next = 15;
            return val;
          case 15:
            _context7.next = 18;
            break;
          case 17:
            return _context7.abrupt("return");
          case 18:
            _iteratorAbruptCompletion10 = false;
            _context7.next = 6;
            break;
          case 21:
            _context7.next = 27;
            break;
          case 23:
            _context7.prev = 23;
            _context7.t0 = _context7["catch"](4);
            _didIteratorError10 = true;
            _iteratorError10 = _context7.t0;
          case 27:
            _context7.prev = 27;
            _context7.prev = 28;
            if (!(_iteratorAbruptCompletion10 && _iterator10.return != null)) {
              _context7.next = 32;
              break;
            }
            _context7.next = 32;
            return _awaitAsyncGenerator(_iterator10.return());
          case 32:
            _context7.prev = 32;
            if (!_didIteratorError10) {
              _context7.next = 35;
              break;
            }
            throw _iteratorError10;
          case 35:
            return _context7.finish(32);
          case 36:
            return _context7.finish(27);
          case 37:
          case "end":
            return _context7.stop();
        }
      }, _callee7, this, [[4, 23, 27, 37], [28,, 32, 36]]);
    }));
    function take() {
      return _take.apply(this, arguments);
    }
    return take;
  }().call(this);
}
module.exports.streamReturningOperators = {
  asIndexedPairs: asIndexedPairs,
  drop: drop,
  filter: filter,
  flatMap: flatMap,
  map: map,
  take: take
};
module.exports.promiseReturningOperators = {
  every: every,
  forEach: forEach,
  reduce: reduce,
  toArray: toArray,
  some: some,
  find: find
};

/***/ }),

/***/ 5329:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.



var _require = __webpack_require__(1070),
  ObjectSetPrototypeOf = _require.ObjectSetPrototypeOf;
module.exports = PassThrough;
var Transform = __webpack_require__(3575);
ObjectSetPrototypeOf(PassThrough.prototype, Transform.prototype);
ObjectSetPrototypeOf(PassThrough, Transform);
function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}
PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

/***/ }),

/***/ 6545:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _asyncToGenerator = (__webpack_require__(7156)["default"]);
var _regeneratorRuntime = (__webpack_require__(7061)["default"]);
var _wrapAsyncGenerator = (__webpack_require__(8186)["default"]);
var _awaitAsyncGenerator = (__webpack_require__(6737)["default"]);
var _asyncGeneratorDelegate = (__webpack_require__(8131)["default"]);
var _asyncIterator = (__webpack_require__(8237)["default"]);
/* replacement start */

var process = __webpack_require__(7490)

/* replacement end */
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).
;

'use strict';
var _require = __webpack_require__(1070),
  ArrayIsArray = _require.ArrayIsArray,
  Promise = _require.Promise,
  SymbolAsyncIterator = _require.SymbolAsyncIterator;
var eos = __webpack_require__(4297);
var _require2 = __webpack_require__(7067),
  once = _require2.once;
var destroyImpl = __webpack_require__(6617);
var Duplex = __webpack_require__(6637);
var _require3 = __webpack_require__(4706),
  aggregateTwoErrors = _require3.aggregateTwoErrors,
  _require3$codes = _require3.codes,
  ERR_INVALID_ARG_TYPE = _require3$codes.ERR_INVALID_ARG_TYPE,
  ERR_INVALID_RETURN_VALUE = _require3$codes.ERR_INVALID_RETURN_VALUE,
  ERR_MISSING_ARGS = _require3$codes.ERR_MISSING_ARGS,
  ERR_STREAM_DESTROYED = _require3$codes.ERR_STREAM_DESTROYED,
  ERR_STREAM_PREMATURE_CLOSE = _require3$codes.ERR_STREAM_PREMATURE_CLOSE,
  AbortError = _require3.AbortError;
var _require4 = __webpack_require__(1066),
  validateFunction = _require4.validateFunction,
  validateAbortSignal = _require4.validateAbortSignal;
var _require5 = __webpack_require__(6767),
  isIterable = _require5.isIterable,
  isReadable = _require5.isReadable,
  isReadableNodeStream = _require5.isReadableNodeStream,
  isNodeStream = _require5.isNodeStream;
var AbortController = globalThis.AbortController || (__webpack_require__(7547).AbortController);
var PassThrough;
var Readable;
function destroyer(stream, reading, writing) {
  var finished = false;
  stream.on('close', function () {
    finished = true;
  });
  var cleanup = eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    finished = !err;
  });
  return {
    destroy: function destroy(err) {
      if (finished) return;
      finished = true;
      destroyImpl.destroyer(stream, err || new ERR_STREAM_DESTROYED('pipe'));
    },
    cleanup: cleanup
  };
}
function popCallback(streams) {
  // Streams should never be an empty array. It should always contain at least
  // a single stream. Therefore optimize for the average case instead of
  // checking for length === 0 as well.
  validateFunction(streams[streams.length - 1], 'streams[stream.length - 1]');
  return streams.pop();
}
function makeAsyncIterable(val) {
  if (isIterable(val)) {
    return val;
  } else if (isReadableNodeStream(val)) {
    // Legacy streams are not Iterable.
    return fromReadable(val);
  }
  throw new ERR_INVALID_ARG_TYPE('val', ['Readable', 'Iterable', 'AsyncIterable'], val);
}
function fromReadable(_x) {
  return _fromReadable.apply(this, arguments);
}
function _fromReadable() {
  _fromReadable = _wrapAsyncGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(val) {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!Readable) {
            Readable = __webpack_require__(8581);
          }
          return _context.delegateYield(_asyncGeneratorDelegate(_asyncIterator(Readable.prototype[SymbolAsyncIterator].call(val)), _awaitAsyncGenerator), "t0", 2);
        case 2:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _fromReadable.apply(this, arguments);
}
function pump(_x2, _x3, _x4, _x5) {
  return _pump.apply(this, arguments);
}
function _pump() {
  _pump = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(iterable, writable, finish, _ref) {
    var end, error, onresolve, resume, wait, cleanup, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, chunk;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          end = _ref.end;
          onresolve = null;
          resume = function resume(err) {
            if (err) {
              error = err;
            }
            if (onresolve) {
              var callback = onresolve;
              onresolve = null;
              callback();
            }
          };
          wait = function wait() {
            return new Promise(function (resolve, reject) {
              if (error) {
                reject(error);
              } else {
                onresolve = function onresolve() {
                  if (error) {
                    reject(error);
                  } else {
                    resolve();
                  }
                };
              }
            });
          };
          writable.on('drain', resume);
          cleanup = eos(writable, {
            readable: false
          }, resume);
          _context2.prev = 6;
          if (!writable.writableNeedDrain) {
            _context2.next = 10;
            break;
          }
          _context2.next = 10;
          return wait();
        case 10:
          _iteratorAbruptCompletion = false;
          _didIteratorError = false;
          _context2.prev = 12;
          _iterator = _asyncIterator(iterable);
        case 14:
          _context2.next = 16;
          return _iterator.next();
        case 16:
          if (!(_iteratorAbruptCompletion = !(_step = _context2.sent).done)) {
            _context2.next = 24;
            break;
          }
          chunk = _step.value;
          if (writable.write(chunk)) {
            _context2.next = 21;
            break;
          }
          _context2.next = 21;
          return wait();
        case 21:
          _iteratorAbruptCompletion = false;
          _context2.next = 14;
          break;
        case 24:
          _context2.next = 30;
          break;
        case 26:
          _context2.prev = 26;
          _context2.t0 = _context2["catch"](12);
          _didIteratorError = true;
          _iteratorError = _context2.t0;
        case 30:
          _context2.prev = 30;
          _context2.prev = 31;
          if (!(_iteratorAbruptCompletion && _iterator.return != null)) {
            _context2.next = 35;
            break;
          }
          _context2.next = 35;
          return _iterator.return();
        case 35:
          _context2.prev = 35;
          if (!_didIteratorError) {
            _context2.next = 38;
            break;
          }
          throw _iteratorError;
        case 38:
          return _context2.finish(35);
        case 39:
          return _context2.finish(30);
        case 40:
          if (end) {
            writable.end();
          }
          _context2.next = 43;
          return wait();
        case 43:
          finish();
          _context2.next = 49;
          break;
        case 46:
          _context2.prev = 46;
          _context2.t1 = _context2["catch"](6);
          finish(error !== _context2.t1 ? aggregateTwoErrors(error, _context2.t1) : _context2.t1);
        case 49:
          _context2.prev = 49;
          cleanup();
          writable.off('drain', resume);
          return _context2.finish(49);
        case 53:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 46, 49, 53], [12, 26, 30, 40], [31,, 35, 39]]);
  }));
  return _pump.apply(this, arguments);
}
function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }
  return pipelineImpl(streams, once(popCallback(streams)));
}
function pipelineImpl(streams, callback, opts) {
  if (streams.length === 1 && ArrayIsArray(streams[0])) {
    streams = streams[0];
  }
  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }
  var ac = new AbortController();
  var signal = ac.signal;
  var outerSignal = opts === null || opts === undefined ? undefined : opts.signal;

  // Need to cleanup event listeners if last stream is readable
  // https://github.com/nodejs/node/issues/35452
  var lastStreamCleanup = [];
  validateAbortSignal(outerSignal, 'options.signal');
  function abort() {
    finishImpl(new AbortError());
  }
  outerSignal === null || outerSignal === undefined ? undefined : outerSignal.addEventListener('abort', abort);
  var error;
  var value;
  var destroys = [];
  var finishCount = 0;
  function finish(err) {
    finishImpl(err, --finishCount === 0);
  }
  function finishImpl(err, final) {
    if (err && (!error || error.code === 'ERR_STREAM_PREMATURE_CLOSE')) {
      error = err;
    }
    if (!error && !final) {
      return;
    }
    while (destroys.length) {
      destroys.shift()(error);
    }
    outerSignal === null || outerSignal === undefined ? undefined : outerSignal.removeEventListener('abort', abort);
    ac.abort();
    if (final) {
      if (!error) {
        lastStreamCleanup.forEach(function (fn) {
          return fn();
        });
      }
      process.nextTick(callback, error, value);
    }
  }
  var ret;
  var _loop = function _loop() {
    var stream = streams[i];
    var reading = i < streams.length - 1;
    var writing = i > 0;
    var end = reading || (opts === null || opts === undefined ? undefined : opts.end) !== false;
    var isLastStream = i === streams.length - 1;
    if (isNodeStream(stream)) {
      // Catch stream errors that occur after pipe/pump has completed.
      var onError = function onError(err) {
        if (err && err.name !== 'AbortError' && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
          finish(err);
        }
      };
      if (end) {
        var _destroyer = destroyer(stream, reading, writing),
          destroy = _destroyer.destroy,
          cleanup = _destroyer.cleanup;
        destroys.push(destroy);
        if (isReadable(stream) && isLastStream) {
          lastStreamCleanup.push(cleanup);
        }
      }
      stream.on('error', onError);
      if (isReadable(stream) && isLastStream) {
        lastStreamCleanup.push(function () {
          stream.removeListener('error', onError);
        });
      }
    }
    if (i === 0) {
      if (typeof stream === 'function') {
        ret = stream({
          signal: signal
        });
        if (!isIterable(ret)) {
          throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or Stream', 'source', ret);
        }
      } else if (isIterable(stream) || isReadableNodeStream(stream)) {
        ret = stream;
      } else {
        ret = Duplex.from(stream);
      }
    } else if (typeof stream === 'function') {
      ret = makeAsyncIterable(ret);
      ret = stream(ret, {
        signal: signal
      });
      if (reading) {
        if (!isIterable(ret, true)) {
          throw new ERR_INVALID_RETURN_VALUE('AsyncIterable', "transform[".concat(i - 1, "]"), ret);
        }
      } else {
        if (!PassThrough) {
          PassThrough = __webpack_require__(5329);
        }

        // If the last argument to pipeline is not a stream
        // we must create a proxy stream so that pipeline(...)
        // always returns a stream which can be further
        // composed through `.pipe(stream)`.

        var pt = new PassThrough({
          objectMode: true
        });

        // Handle Promises/A+ spec, `then` could be a getter that throws on
        // second use.
        var then = (_ret = ret) === null || _ret === undefined ? undefined : _ret.then;
        if (typeof then === 'function') {
          finishCount++;
          then.call(ret, function (val) {
            value = val;
            if (val != null) {
              pt.write(val);
            }
            if (end) {
              pt.end();
            }
            process.nextTick(finish);
          }, function (err) {
            pt.destroy(err);
            process.nextTick(finish, err);
          });
        } else if (isIterable(ret, true)) {
          finishCount++;
          pump(ret, pt, finish, {
            end: end
          });
        } else {
          throw new ERR_INVALID_RETURN_VALUE('AsyncIterable or Promise', 'destination', ret);
        }
        ret = pt;
        var _destroyer2 = destroyer(ret, false, true),
          _destroy = _destroyer2.destroy,
          _cleanup = _destroyer2.cleanup;
        destroys.push(_destroy);
        if (isLastStream) {
          lastStreamCleanup.push(_cleanup);
        }
      }
    } else if (isNodeStream(stream)) {
      if (isReadableNodeStream(ret)) {
        finishCount += 2;
        var _cleanup2 = pipe(ret, stream, finish, {
          end: end
        });
        if (isReadable(stream) && isLastStream) {
          lastStreamCleanup.push(_cleanup2);
        }
      } else if (isIterable(ret)) {
        finishCount++;
        pump(ret, stream, finish, {
          end: end
        });
      } else {
        throw new ERR_INVALID_ARG_TYPE('val', ['Readable', 'Iterable', 'AsyncIterable'], ret);
      }
      ret = stream;
    } else {
      ret = Duplex.from(stream);
    }
  };
  for (var i = 0; i < streams.length; i++) {
    var _ret;
    _loop();
  }
  if (signal !== null && signal !== undefined && signal.aborted || outerSignal !== null && outerSignal !== undefined && outerSignal.aborted) {
    process.nextTick(abort);
  }
  return ret;
}
function pipe(src, dst, finish, _ref2) {
  var end = _ref2.end;
  var ended = false;
  dst.on('close', function () {
    if (!ended) {
      // Finish if the destination closes before the source has completed.
      finish(new ERR_STREAM_PREMATURE_CLOSE());
    }
  });
  src.pipe(dst, {
    end: end
  });
  if (end) {
    // Compat. Before node v10.12.0 stdio used to throw an error so
    // pipe() did/does not end() stdio destinations.
    // Now they allow it but "secretly" don't close the underlying fd.
    src.once('end', function () {
      ended = true;
      dst.end();
    });
  } else {
    finish();
  }
  eos(src, {
    readable: true,
    writable: false
  }, function (err) {
    var rState = src._readableState;
    if (err && err.code === 'ERR_STREAM_PREMATURE_CLOSE' && rState && rState.ended && !rState.errored && !rState.errorEmitted) {
      // Some readable streams will emit 'close' before 'end'. However, since
      // this is on the readable side 'end' should still be emitted if the
      // stream has been ended and no error emitted. This should be allowed in
      // favor of backwards compatibility. Since the stream is piped to a
      // destination this should not result in any observable difference.
      // We don't need to check if this is a writable premature close since
      // eos will only fail with premature close on the reading side for
      // duplex streams.
      src.once('end', finish).once('error', finish);
    } else {
      finish(err);
    }
  });
  return eos(dst, {
    readable: false,
    writable: true
  }, finish);
}
module.exports = {
  pipelineImpl: pipelineImpl,
  pipeline: pipeline
};

/***/ }),

/***/ 8581:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _objectSpread = (__webpack_require__(2122)["default"]);
var _regeneratorRuntime = (__webpack_require__(7061)["default"]);
var _createForOfIteratorHelper = (__webpack_require__(4704)["default"]);
var _awaitAsyncGenerator = (__webpack_require__(6737)["default"]);
var _wrapAsyncGenerator = (__webpack_require__(8186)["default"]);
/* replacement start */

var process = __webpack_require__(7490)

/* replacement end */
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
;

'use strict';
var _require = __webpack_require__(1070),
  ArrayPrototypeIndexOf = _require.ArrayPrototypeIndexOf,
  NumberIsInteger = _require.NumberIsInteger,
  NumberIsNaN = _require.NumberIsNaN,
  NumberParseInt = _require.NumberParseInt,
  ObjectDefineProperties = _require.ObjectDefineProperties,
  ObjectKeys = _require.ObjectKeys,
  ObjectSetPrototypeOf = _require.ObjectSetPrototypeOf,
  Promise = _require.Promise,
  SafeSet = _require.SafeSet,
  SymbolAsyncIterator = _require.SymbolAsyncIterator,
  Symbol = _require.Symbol;
module.exports = Readable;
Readable.ReadableState = ReadableState;
var _require2 = __webpack_require__(8041),
  EE = _require2.EventEmitter;
var _require3 = __webpack_require__(4647),
  Stream = _require3.Stream,
  prependListener = _require3.prependListener;
var _require4 = __webpack_require__(918),
  Buffer = _require4.Buffer;
var _require5 = __webpack_require__(1580),
  addAbortSignal = _require5.addAbortSignal;
var eos = __webpack_require__(4297);
var debug = (__webpack_require__(7067).debuglog)('stream', function (fn) {
  debug = fn;
});
var BufferList = __webpack_require__(5489);
var destroyImpl = __webpack_require__(6617);
var _require6 = __webpack_require__(5999),
  getHighWaterMark = _require6.getHighWaterMark,
  getDefaultHighWaterMark = _require6.getDefaultHighWaterMark;
var _require7 = __webpack_require__(4706),
  aggregateTwoErrors = _require7.aggregateTwoErrors,
  _require7$codes = _require7.codes,
  ERR_INVALID_ARG_TYPE = _require7$codes.ERR_INVALID_ARG_TYPE,
  ERR_METHOD_NOT_IMPLEMENTED = _require7$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_OUT_OF_RANGE = _require7$codes.ERR_OUT_OF_RANGE,
  ERR_STREAM_PUSH_AFTER_EOF = _require7$codes.ERR_STREAM_PUSH_AFTER_EOF,
  ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require7$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
var _require8 = __webpack_require__(1066),
  validateObject = _require8.validateObject;
var kPaused = Symbol('kPaused');
var _require9 = __webpack_require__(8570),
  StringDecoder = _require9.StringDecoder;
var from = __webpack_require__(6129);
ObjectSetPrototypeOf(Readable.prototype, Stream.prototype);
ObjectSetPrototypeOf(Readable, Stream);
var nop = function nop() {};
var errorOrDestroy = destroyImpl.errorOrDestroy;
function ReadableState(options, stream, isDuplex) {
  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof __webpack_require__(6637);

  // Object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away.
  this.objectMode = !!(options && options.objectMode);
  if (isDuplex) this.objectMode = this.objectMode || !!(options && options.readableObjectMode);

  // The point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  this.highWaterMark = options ? getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex) : getDefaultHighWaterMark(false);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift().
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = [];
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // Stream is still being constructed and cannot be
  // destroyed until construction finished or failed.
  // Async construction is opt in, therefore we start as
  // constructed.
  this.constructed = true;

  // A flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // Whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this[kPaused] = null;

  // True if the error was already emitted and should not be thrown again.
  this.errorEmitted = false;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = !options || options.emitClose !== false;

  // Should .destroy() be called after 'end' (and potentially 'finish').
  this.autoDestroy = !options || options.autoDestroy !== false;

  // Has it been destroyed.
  this.destroyed = false;

  // Indicates whether the stream has errored. When true no further
  // _read calls, 'data' or 'readable' events should occur. This is needed
  // since when autoDestroy is disabled we need a way to tell whether the
  // stream has failed.
  this.errored = null;

  // Indicates whether the stream has finished destroying.
  this.closed = false;

  // True if close has been emitted or would have been emitted
  // depending on emitClose.
  this.closeEmitted = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options && options.defaultEncoding || 'utf8';

  // Ref the piped dest which we need a drain event on it
  // type: null | Writable | Set<Writable>.
  this.awaitDrainWriters = null;
  this.multiAwaitDrain = false;

  // If true, a maybeReadMore has been scheduled.
  this.readingMore = false;
  this.dataEmitted = false;
  this.decoder = null;
  this.encoding = null;
  if (options && options.encoding) {
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}
function Readable(options) {
  var _this = this;
  if (!(this instanceof Readable)) return new Readable(options);

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5.
  var isDuplex = this instanceof __webpack_require__(6637);
  this._readableState = new ReadableState(options, this, isDuplex);
  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.construct === 'function') this._construct = options.construct;
    if (options.signal && !isDuplex) addAbortSignal(options.signal, this);
  }
  Stream.call(this, options);
  destroyImpl.construct(this, function () {
    if (_this._readableState.needReadable) {
      maybeReadMore(_this, _this._readableState);
    }
  });
}
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  cb(err);
};
Readable.prototype[EE.captureRejectionSymbol] = function (err) {
  this.destroy(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  return readableAddChunk(this, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read().
Readable.prototype.unshift = function (chunk, encoding) {
  return readableAddChunk(this, chunk, encoding, true);
};
function readableAddChunk(stream, chunk, encoding, addToFront) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;
  var err;
  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (state.encoding !== encoding) {
        if (addToFront && state.encoding) {
          // When unshifting, if state.encoding is set, we have to save
          // the string in the BufferList with the state encoding.
          chunk = Buffer.from(chunk, encoding).toString(state.encoding);
        } else {
          chunk = Buffer.from(chunk, encoding);
          encoding = '';
        }
      }
    } else if (chunk instanceof Buffer) {
      encoding = '';
    } else if (Stream._isUint8Array(chunk)) {
      chunk = Stream._uint8ArrayToBuffer(chunk);
      encoding = '';
    } else if (chunk != null) {
      err = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
    }
  }
  if (err) {
    errorOrDestroy(stream, err);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (addToFront) {
      if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else if (state.destroyed || state.errored) return false;else addChunk(stream, state, chunk, true);
    } else if (state.ended) {
      errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
    } else if (state.destroyed || state.errored) {
      return false;
    } else {
      state.reading = false;
      if (state.decoder && !encoding) {
        chunk = state.decoder.write(chunk);
        if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
      } else {
        addChunk(stream, state, chunk, false);
      }
    }
  } else if (!addToFront) {
    state.reading = false;
    maybeReadMore(stream, state);
  }

  // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.
  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}
function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync && stream.listenerCount('data') > 0) {
    // Use the guard to avoid creating `Set()` repeatedly
    // when we have multiple pipes.
    if (state.multiAwaitDrain) {
      state.awaitDrainWriters.clear();
    } else {
      state.awaitDrainWriters = null;
    }
    state.dataEmitted = true;
    stream.emit('data', chunk);
  } else {
    // Update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}
Readable.prototype.isPaused = function () {
  var state = this._readableState;
  return state[kPaused] === true || state.flowing === false;
};

// Backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder;
  // If setEncoding(null), decoder.encoding equals utf8.
  this._readableState.encoding = this._readableState.decoder.encoding;
  var buffer = this._readableState.buffer;
  // Iterate over current buffer to convert already stored Buffers:
  var content = '';
  var _iterator = _createForOfIteratorHelper(buffer),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var data = _step.value;
      content += decoder.write(data);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  buffer.clear();
  if (content !== '') buffer.push(content);
  this._readableState.length = content.length;
  return this;
};

// Don't raise the hwm > 1GB.
var MAX_HWM = 0x40000000;
function computeNewHighWaterMark(n) {
  if (n > MAX_HWM) {
    throw new ERR_OUT_OF_RANGE('size', '<= 1GiB', n);
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts.
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (NumberIsNaN(n)) {
    // Only flow one buffer at a time.
    if (state.flowing && state.length) return state.buffer.first().length;
    return state.length;
  }
  if (n <= state.length) return n;
  return state.ended ? state.length : 0;
}

// You can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  // Same as parseInt(undefined, 10), however V8 7.3 performance regressed
  // in this scenario, so we are doing it manually.
  if (n === undefined) {
    n = NaN;
  } else if (!NumberIsInteger(n)) {
    n = NumberParseInt(n, 10);
  }
  var state = this._readableState;
  var nOrig = n;

  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n !== 0) state.emittedReadable = false;

  // If we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }
  n = howMuchToRead(n, state);

  // If we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // If we currently have less than the highWaterMark, then also read some.
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // However, if we've ended, then there's no point, if we're already
  // reading, then it's unnecessary, if we're constructing we have to wait,
  // and if we're destroyed or errored, then it's not allowed,
  if (state.ended || state.reading || state.destroyed || state.errored || !state.constructed) {
    doRead = false;
    debug('reading, ended or constructing', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // If the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;

    // Call internal read method
    try {
      this._read(state.highWaterMark);
    } catch (err) {
      errorOrDestroy(this, err);
    }
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }
  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;
  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    if (state.multiAwaitDrain) {
      state.awaitDrainWriters.clear();
    } else {
      state.awaitDrainWriters = null;
    }
  }
  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }
  if (ret !== null && !state.errorEmitted && !state.closeEmitted) {
    state.dataEmitted = true;
    this.emit('data', ret);
  }
  return ret;
};
function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;
  if (state.sync) {
    // If we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call.
    emitReadable(stream);
  } else {
    // Emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;
    state.emittedReadable = true;
    // We have to emit readable now that we are EOF. Modules
    // in the ecosystem (e.g. dicer) rely on this event being sync.
    emitReadable_(stream);
  }
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}
function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);
  if (!state.destroyed && !state.errored && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  }

  // The stream needs another readable event if:
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.
  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
}

// At this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore && state.constructed) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}
function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // Didn't get any data, stop spinning.
      break;
  }
  state.readingMore = false;
}

// Abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  throw new ERR_METHOD_NOT_IMPLEMENTED('_read()');
};
Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;
  if (state.pipes.length === 1) {
    if (!state.multiAwaitDrain) {
      state.multiAwaitDrain = true;
      state.awaitDrainWriters = new SafeSet(state.awaitDrainWriters ? [state.awaitDrainWriters] : []);
    }
  }
  state.pipes.push(dest);
  debug('pipe count=%d opts=%j', state.pipes.length, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }
  function onend() {
    debug('onend');
    dest.end();
  }
  var ondrain;
  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // Cleanup event handlers once the pipe is broken.
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    if (ondrain) {
      dest.removeListener('drain', ondrain);
    }
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true;

    // If the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (ondrain && state.awaitDrainWriters && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }
  function pause() {
    // If the user unpiped during `dest.write()`, it is possible
    // to get stuck in a permanently paused state if that write
    // also returned false.
    // => Check whether `dest` is still a piping destination.
    if (!cleanedUp) {
      if (state.pipes.length === 1 && state.pipes[0] === dest) {
        debug('false write response, pause', 0);
        state.awaitDrainWriters = dest;
        state.multiAwaitDrain = false;
      } else if (state.pipes.length > 1 && state.pipes.includes(dest)) {
        debug('false write response, pause', state.awaitDrainWriters.size);
        state.awaitDrainWriters.add(dest);
      }
      src.pause();
    }
    if (!ondrain) {
      // When the dest drains, it reduces the awaitDrain counter
      // on the source.  This would be more elegant with a .once()
      // handler in flow(), but adding and removing repeatedly is
      // too slow.
      ondrain = pipeOnDrain(src, dest);
      dest.on('drain', ondrain);
    }
  }
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);
    if (ret === false) {
      pause();
    }
  }

  // If the dest has an error, then stop piping into it.
  // However, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (dest.listenerCount('error') === 0) {
      var s = dest._writableState || dest._readableState;
      if (s && !s.errorEmitted) {
        // User incorrectly emitted 'error' directly on the stream.
        errorOrDestroy(dest, er);
      } else {
        dest.emit('error', er);
      }
    }
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);
  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // Tell the dest that it's being piped to.
  dest.emit('pipe', src);

  // Start the flow if it hasn't been started already.

  if (dest.writableNeedDrain === true) {
    if (state.flowing) {
      pause();
    }
  } else if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }
  return dest;
};
function pipeOnDrain(src, dest) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;

    // `ondrain` will call directly,
    // `this` maybe not a reference to dest,
    // so we use the real dest here.
    if (state.awaitDrainWriters === dest) {
      debug('pipeOnDrain', 1);
      state.awaitDrainWriters = null;
    } else if (state.multiAwaitDrain) {
      debug('pipeOnDrain', state.awaitDrainWriters.size);
      state.awaitDrainWriters.delete(dest);
    }
    if ((!state.awaitDrainWriters || state.awaitDrainWriters.size === 0) && src.listenerCount('data')) {
      src.resume();
    }
  };
}
Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  };

  // If we're not piping anywhere, then do nothing.
  if (state.pipes.length === 0) return this;
  if (!dest) {
    // remove all.
    var dests = state.pipes;
    state.pipes = [];
    this.pause();
    for (var i = 0; i < dests.length; i++) dests[i].emit('unpipe', this, {
      hasUnpiped: false
    });
    return this;
  }

  // Try to find the right one.
  var index = ArrayPrototypeIndexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  if (state.pipes.length === 0) this.pause();
  dest.emit('unpipe', this, unpipeInfo);
  return this;
};

// Set up data events if they are asked for
// Ensure readable listeners eventually get something.
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;
  if (ev === 'data') {
    // Update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0;

    // Try start flowing on next tick if stream isn't explicitly paused.
    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);
      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }
  return res;
};
Readable.prototype.addListener = Readable.prototype.on;
Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);
  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
Readable.prototype.off = Readable.prototype.removeListener;
Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);
  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;
  if (state.resumeScheduled && state[kPaused] === false) {
    // Flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true;

    // Crude way to check if we should resume.
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  } else if (!state.readableListening) {
    state.flowing = null;
  }
}
function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    // We flow only if there is no one listening
    // for readable, but we still have to call
    // resume().
    state.flowing = !state.readableListening;
    resume(this, state);
  }
  state[kPaused] = false;
  return this;
};
function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}
function resume_(stream, state) {
  debug('resume', state.reading);
  if (!state.reading) {
    stream.read(0);
  }
  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}
Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  this._readableState[kPaused] = true;
  return this;
};
function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null);
}

// Wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this2 = this;
  var paused = false;

  // TODO (ronag): Should this.destroy(err) emit
  // 'error' on the wrapped stream? Would require
  // a static factory method, e.g. Readable.wrap(stream).

  stream.on('data', function (chunk) {
    if (!_this2.push(chunk) && stream.pause) {
      paused = true;
      stream.pause();
    }
  });
  stream.on('end', function () {
    _this2.push(null);
  });
  stream.on('error', function (err) {
    errorOrDestroy(_this2, err);
  });
  stream.on('close', function () {
    _this2.destroy();
  });
  stream.on('destroy', function () {
    _this2.destroy();
  });
  this._read = function () {
    if (paused && stream.resume) {
      paused = false;
      stream.resume();
    }
  };

  // Proxy all the other methods. Important when wrapping filters and duplexes.
  var streamKeys = ObjectKeys(stream);
  for (var j = 1; j < streamKeys.length; j++) {
    var i = streamKeys[j];
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = stream[i].bind(stream);
    }
  }
  return this;
};
Readable.prototype[SymbolAsyncIterator] = function () {
  return streamToAsyncIterator(this);
};
Readable.prototype.iterator = function (options) {
  if (options !== undefined) {
    validateObject(options, 'options');
  }
  return streamToAsyncIterator(this, options);
};
function streamToAsyncIterator(stream, options) {
  if (typeof stream.read !== 'function') {
    stream = Readable.wrap(stream, {
      objectMode: true
    });
  }
  var iter = createAsyncIterator(stream, options);
  iter.stream = stream;
  return iter;
}
function createAsyncIterator(_x, _x2) {
  return _createAsyncIterator.apply(this, arguments);
} // Making it explicit these properties are not enumerable
// because otherwise some prototype manipulation in
// userland will fail.
function _createAsyncIterator() {
  _createAsyncIterator = _wrapAsyncGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(stream, options) {
    var callback, next, error, cleanup, chunk;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          next = function _next(resolve) {
            if (this === stream) {
              callback();
              callback = nop;
            } else {
              callback = resolve;
            }
          };
          callback = nop;
          stream.on('readable', next);
          cleanup = eos(stream, {
            writable: false
          }, function (err) {
            error = err ? aggregateTwoErrors(error, err) : null;
            callback();
            callback = nop;
          });
          _context.prev = 4;
        case 5:
          if (false) {}
          chunk = stream.destroyed ? null : stream.read();
          if (!(chunk !== null)) {
            _context.next = 12;
            break;
          }
          _context.next = 10;
          return chunk;
        case 10:
          _context.next = 22;
          break;
        case 12:
          if (!error) {
            _context.next = 16;
            break;
          }
          throw error;
        case 16:
          if (!(error === null)) {
            _context.next = 20;
            break;
          }
          return _context.abrupt("return");
        case 20:
          _context.next = 22;
          return _awaitAsyncGenerator(new Promise(next));
        case 22:
          _context.next = 5;
          break;
        case 24:
          _context.next = 30;
          break;
        case 26:
          _context.prev = 26;
          _context.t0 = _context["catch"](4);
          error = aggregateTwoErrors(error, _context.t0);
          throw error;
        case 30:
          _context.prev = 30;
          if ((error || (options === null || options === undefined ? undefined : options.destroyOnReturn) !== false) && (error === undefined || stream._readableState.autoDestroy)) {
            destroyImpl.destroyer(stream, null);
          } else {
            stream.off('readable', next);
            cleanup();
          }
          return _context.finish(30);
        case 33:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[4, 26, 30, 33]]);
  }));
  return _createAsyncIterator.apply(this, arguments);
}
ObjectDefineProperties(Readable.prototype, {
  readable: {
    __proto__: null,
    get: function get() {
      var r = this._readableState;
      // r.readable === false means that this is part of a Duplex stream
      // where the readable side was disabled upon construction.
      // Compat. The user might manually disable readable side through
      // deprecated setter.
      return !!r && r.readable !== false && !r.destroyed && !r.errorEmitted && !r.endEmitted;
    },
    set: function set(val) {
      // Backwards compat.
      if (this._readableState) {
        this._readableState.readable = !!val;
      }
    }
  },
  readableDidRead: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return this._readableState.dataEmitted;
    }
  },
  readableAborted: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return !!(this._readableState.readable !== false && (this._readableState.destroyed || this._readableState.errored) && !this._readableState.endEmitted);
    }
  },
  readableHighWaterMark: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return this._readableState.highWaterMark;
    }
  },
  readableBuffer: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return this._readableState && this._readableState.buffer;
    }
  },
  readableFlowing: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return this._readableState.flowing;
    },
    set: function set(state) {
      if (this._readableState) {
        this._readableState.flowing = state;
      }
    }
  },
  readableLength: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return this._readableState.length;
    }
  },
  readableObjectMode: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return this._readableState ? this._readableState.objectMode : false;
    }
  },
  readableEncoding: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return this._readableState ? this._readableState.encoding : null;
    }
  },
  errored: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return this._readableState ? this._readableState.errored : null;
    }
  },
  closed: {
    __proto__: null,
    get: function get() {
      return this._readableState ? this._readableState.closed : false;
    }
  },
  destroyed: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return this._readableState ? this._readableState.destroyed : false;
    },
    set: function set(value) {
      // We ignore the value if the stream
      // has not been initialized yet.
      if (!this._readableState) {
        return;
      }

      // Backward compatibility, the user is explicitly
      // managing destroyed.
      this._readableState.destroyed = value;
    }
  },
  readableEnded: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return this._readableState ? this._readableState.endEmitted : false;
    }
  }
});
ObjectDefineProperties(ReadableState.prototype, {
  // Legacy getter for `pipesCount`.
  pipesCount: {
    __proto__: null,
    get: function get() {
      return this.pipes.length;
    }
  },
  // Legacy property for `paused`.
  paused: {
    __proto__: null,
    get: function get() {
      return this[kPaused] !== false;
    },
    set: function set(value) {
      this[kPaused] = !!value;
    }
  }
});

// Exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered.
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // Read it all, truncate the list.
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list.
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}
function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);
  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}
function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length);

  // Check that we didn't get one last unshift.
  if (!state.errored && !state.closeEmitted && !state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.emit('end');
    if (stream.writable && stream.allowHalfOpen === false) {
      process.nextTick(endWritableNT, stream);
    } else if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well.
      var wState = stream._writableState;
      var autoDestroy = !wState || wState.autoDestroy && (
      // We don't expect the writable to ever 'finish'
      // if writable is explicitly set to false.
      wState.finished || wState.writable === false);
      if (autoDestroy) {
        stream.destroy();
      }
    }
  }
}
function endWritableNT(stream) {
  var writable = stream.writable && !stream.writableEnded && !stream.destroyed;
  if (writable) {
    stream.end();
  }
}
Readable.from = function (iterable, opts) {
  return from(Readable, iterable, opts);
};
var webStreamsAdapters;

// Lazy to avoid circular references
function lazyWebStreams() {
  if (webStreamsAdapters === undefined) webStreamsAdapters = {};
  return webStreamsAdapters;
}
Readable.fromWeb = function (readableStream, options) {
  return lazyWebStreams().newStreamReadableFromReadableStream(readableStream, options);
};
Readable.toWeb = function (streamReadable, options) {
  return lazyWebStreams().newReadableStreamFromStreamReadable(streamReadable, options);
};
Readable.wrap = function (src, options) {
  var _ref, _src$readableObjectMo;
  return new Readable(_objectSpread(_objectSpread({
    objectMode: (_ref = (_src$readableObjectMo = src.readableObjectMode) !== null && _src$readableObjectMo !== undefined ? _src$readableObjectMo : src.objectMode) !== null && _ref !== undefined ? _ref : true
  }, options), {}, {
    destroy: function destroy(err, callback) {
      destroyImpl.destroyer(src, err);
      callback(err);
    }
  })).wrap(src);
};

/***/ }),

/***/ 5999:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(1070),
  MathFloor = _require.MathFloor,
  NumberIsInteger = _require.NumberIsInteger;
var ERR_INVALID_ARG_VALUE = (__webpack_require__(4706).codes.ERR_INVALID_ARG_VALUE);
function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}
function getDefaultHighWaterMark(objectMode) {
  return objectMode ? 16 : 16 * 1024;
}
function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
  if (hwm != null) {
    if (!NumberIsInteger(hwm) || hwm < 0) {
      var name = isDuplex ? "options.".concat(duplexKey) : 'options.highWaterMark';
      throw new ERR_INVALID_ARG_VALUE(name, hwm);
    }
    return MathFloor(hwm);
  }

  // Default value
  return getDefaultHighWaterMark(state.objectMode);
}
module.exports = {
  getHighWaterMark: getHighWaterMark,
  getDefaultHighWaterMark: getDefaultHighWaterMark
};

/***/ }),

/***/ 3575:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.



var _objectSpread = (__webpack_require__(2122)["default"]);
var _require = __webpack_require__(1070),
  ObjectSetPrototypeOf = _require.ObjectSetPrototypeOf,
  Symbol = _require.Symbol;
module.exports = Transform;
var ERR_METHOD_NOT_IMPLEMENTED = (__webpack_require__(4706).codes.ERR_METHOD_NOT_IMPLEMENTED);
var Duplex = __webpack_require__(6637);
var _require2 = __webpack_require__(5999),
  getHighWaterMark = _require2.getHighWaterMark;
ObjectSetPrototypeOf(Transform.prototype, Duplex.prototype);
ObjectSetPrototypeOf(Transform, Duplex);
var kCallback = Symbol('kCallback');
function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  // TODO (ronag): This should preferably always be
  // applied but would be semver-major. Or even better;
  // make Transform a Readable with the Writable interface.
  var readableHighWaterMark = options ? getHighWaterMark(this, options, 'readableHighWaterMark', true) : null;
  if (readableHighWaterMark === 0) {
    // A Duplex will buffer both on the writable and readable side while
    // a Transform just wants to buffer hwm number of elements. To avoid
    // buffering twice we disable buffering on the writable side.
    options = _objectSpread(_objectSpread({}, options), {}, {
      highWaterMark: null,
      readableHighWaterMark: readableHighWaterMark,
      // TODO (ronag): 0 is not optimal since we have
      // a "bug" where we check needDrain before calling _write and not after.
      // Refs: https://github.com/nodejs/node/pull/32887
      // Refs: https://github.com/nodejs/node/pull/35941
      writableHighWaterMark: options.writableHighWaterMark || 0
    });
  }
  Duplex.call(this, options);

  // We have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;
  this[kCallback] = null;
  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  // Backwards compat. Some Transform streams incorrectly implement _final
  // instead of or in addition to _flush. By using 'prefinish' instead of
  // implementing _final we continue supporting this unfortunate use case.
  this.on('prefinish', prefinish);
}
function final(cb) {
  var _this = this;
  if (typeof this._flush === 'function' && !this.destroyed) {
    this._flush(function (er, data) {
      if (er) {
        if (cb) {
          cb(er);
        } else {
          _this.destroy(er);
        }
        return;
      }
      if (data != null) {
        _this.push(data);
      }
      _this.push(null);
      if (cb) {
        cb();
      }
    });
  } else {
    this.push(null);
    if (cb) {
      cb();
    }
  }
}
function prefinish() {
  if (this._final !== final) {
    final.call(this);
  }
}
Transform.prototype._final = final;
Transform.prototype._transform = function (chunk, encoding, callback) {
  throw new ERR_METHOD_NOT_IMPLEMENTED('_transform()');
};
Transform.prototype._write = function (chunk, encoding, callback) {
  var _this2 = this;
  var rState = this._readableState;
  var wState = this._writableState;
  var length = rState.length;
  this._transform(chunk, encoding, function (err, val) {
    if (err) {
      callback(err);
      return;
    }
    if (val != null) {
      _this2.push(val);
    }
    if (wState.ended ||
    // Backwards compat.
    length === rState.length ||
    // Backwards compat.
    rState.length < rState.highWaterMark) {
      callback();
    } else {
      _this2[kCallback] = callback;
    }
  });
};
Transform.prototype._read = function () {
  if (this[kCallback]) {
    var callback = this[kCallback];
    this[kCallback] = null;
    callback();
  }
};

/***/ }),

/***/ 6767:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(1070),
  Symbol = _require.Symbol,
  SymbolAsyncIterator = _require.SymbolAsyncIterator,
  SymbolIterator = _require.SymbolIterator;
var kDestroyed = Symbol('kDestroyed');
var kIsErrored = Symbol('kIsErrored');
var kIsReadable = Symbol('kIsReadable');
var kIsDisturbed = Symbol('kIsDisturbed');
function isReadableNodeStream(obj) {
  var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var _obj$_readableState;
  return !!(obj && typeof obj.pipe === 'function' && typeof obj.on === 'function' && (!strict || typeof obj.pause === 'function' && typeof obj.resume === 'function') && (!obj._writableState || ((_obj$_readableState = obj._readableState) === null || _obj$_readableState === undefined ? undefined : _obj$_readableState.readable) !== false) && (
  // Duplex
  !obj._writableState || obj._readableState)
  // Writable has .pipe.
  );
}

function isWritableNodeStream(obj) {
  var _obj$_writableState;
  return !!(obj && typeof obj.write === 'function' && typeof obj.on === 'function' && (!obj._readableState || ((_obj$_writableState = obj._writableState) === null || _obj$_writableState === undefined ? undefined : _obj$_writableState.writable) !== false)
  // Duplex
  );
}

function isDuplexNodeStream(obj) {
  return !!(obj && typeof obj.pipe === 'function' && obj._readableState && typeof obj.on === 'function' && typeof obj.write === 'function');
}
function isNodeStream(obj) {
  return obj && (obj._readableState || obj._writableState || typeof obj.write === 'function' && typeof obj.on === 'function' || typeof obj.pipe === 'function' && typeof obj.on === 'function');
}
function isIterable(obj, isAsync) {
  if (obj == null) return false;
  if (isAsync === true) return typeof obj[SymbolAsyncIterator] === 'function';
  if (isAsync === false) return typeof obj[SymbolIterator] === 'function';
  return typeof obj[SymbolAsyncIterator] === 'function' || typeof obj[SymbolIterator] === 'function';
}
function isDestroyed(stream) {
  if (!isNodeStream(stream)) return null;
  var wState = stream._writableState;
  var rState = stream._readableState;
  var state = wState || rState;
  return !!(stream.destroyed || stream[kDestroyed] || state !== null && state !== undefined && state.destroyed);
}

// Have been end():d.
function isWritableEnded(stream) {
  if (!isWritableNodeStream(stream)) return null;
  if (stream.writableEnded === true) return true;
  var wState = stream._writableState;
  if (wState !== null && wState !== undefined && wState.errored) return false;
  if (typeof (wState === null || wState === undefined ? undefined : wState.ended) !== 'boolean') return null;
  return wState.ended;
}

// Have emitted 'finish'.
function isWritableFinished(stream, strict) {
  if (!isWritableNodeStream(stream)) return null;
  if (stream.writableFinished === true) return true;
  var wState = stream._writableState;
  if (wState !== null && wState !== undefined && wState.errored) return false;
  if (typeof (wState === null || wState === undefined ? undefined : wState.finished) !== 'boolean') return null;
  return !!(wState.finished || strict === false && wState.ended === true && wState.length === 0);
}

// Have been push(null):d.
function isReadableEnded(stream) {
  if (!isReadableNodeStream(stream)) return null;
  if (stream.readableEnded === true) return true;
  var rState = stream._readableState;
  if (!rState || rState.errored) return false;
  if (typeof (rState === null || rState === undefined ? undefined : rState.ended) !== 'boolean') return null;
  return rState.ended;
}

// Have emitted 'end'.
function isReadableFinished(stream, strict) {
  if (!isReadableNodeStream(stream)) return null;
  var rState = stream._readableState;
  if (rState !== null && rState !== undefined && rState.errored) return false;
  if (typeof (rState === null || rState === undefined ? undefined : rState.endEmitted) !== 'boolean') return null;
  return !!(rState.endEmitted || strict === false && rState.ended === true && rState.length === 0);
}
function isReadable(stream) {
  if (stream && stream[kIsReadable] != null) return stream[kIsReadable];
  if (typeof (stream === null || stream === undefined ? undefined : stream.readable) !== 'boolean') return null;
  if (isDestroyed(stream)) return false;
  return isReadableNodeStream(stream) && stream.readable && !isReadableFinished(stream);
}
function isWritable(stream) {
  if (typeof (stream === null || stream === undefined ? undefined : stream.writable) !== 'boolean') return null;
  if (isDestroyed(stream)) return false;
  return isWritableNodeStream(stream) && stream.writable && !isWritableEnded(stream);
}
function isFinished(stream, opts) {
  if (!isNodeStream(stream)) {
    return null;
  }
  if (isDestroyed(stream)) {
    return true;
  }
  if ((opts === null || opts === undefined ? undefined : opts.readable) !== false && isReadable(stream)) {
    return false;
  }
  if ((opts === null || opts === undefined ? undefined : opts.writable) !== false && isWritable(stream)) {
    return false;
  }
  return true;
}
function isWritableErrored(stream) {
  var _stream$_writableStat, _stream$_writableStat2;
  if (!isNodeStream(stream)) {
    return null;
  }
  if (stream.writableErrored) {
    return stream.writableErrored;
  }
  return (_stream$_writableStat = (_stream$_writableStat2 = stream._writableState) === null || _stream$_writableStat2 === undefined ? undefined : _stream$_writableStat2.errored) !== null && _stream$_writableStat !== undefined ? _stream$_writableStat : null;
}
function isReadableErrored(stream) {
  var _stream$_readableStat, _stream$_readableStat2;
  if (!isNodeStream(stream)) {
    return null;
  }
  if (stream.readableErrored) {
    return stream.readableErrored;
  }
  return (_stream$_readableStat = (_stream$_readableStat2 = stream._readableState) === null || _stream$_readableStat2 === undefined ? undefined : _stream$_readableStat2.errored) !== null && _stream$_readableStat !== undefined ? _stream$_readableStat : null;
}
function isClosed(stream) {
  if (!isNodeStream(stream)) {
    return null;
  }
  if (typeof stream.closed === 'boolean') {
    return stream.closed;
  }
  var wState = stream._writableState;
  var rState = stream._readableState;
  if (typeof (wState === null || wState === undefined ? undefined : wState.closed) === 'boolean' || typeof (rState === null || rState === undefined ? undefined : rState.closed) === 'boolean') {
    return (wState === null || wState === undefined ? undefined : wState.closed) || (rState === null || rState === undefined ? undefined : rState.closed);
  }
  if (typeof stream._closed === 'boolean' && isOutgoingMessage(stream)) {
    return stream._closed;
  }
  return null;
}
function isOutgoingMessage(stream) {
  return typeof stream._closed === 'boolean' && typeof stream._defaultKeepAlive === 'boolean' && typeof stream._removedConnection === 'boolean' && typeof stream._removedContLen === 'boolean';
}
function isServerResponse(stream) {
  return typeof stream._sent100 === 'boolean' && isOutgoingMessage(stream);
}
function isServerRequest(stream) {
  var _stream$req;
  return typeof stream._consuming === 'boolean' && typeof stream._dumped === 'boolean' && ((_stream$req = stream.req) === null || _stream$req === undefined ? undefined : _stream$req.upgradeOrConnect) === undefined;
}
function willEmitClose(stream) {
  if (!isNodeStream(stream)) return null;
  var wState = stream._writableState;
  var rState = stream._readableState;
  var state = wState || rState;
  return !state && isServerResponse(stream) || !!(state && state.autoDestroy && state.emitClose && state.closed === false);
}
function isDisturbed(stream) {
  var _stream$kIsDisturbed;
  return !!(stream && ((_stream$kIsDisturbed = stream[kIsDisturbed]) !== null && _stream$kIsDisturbed !== undefined ? _stream$kIsDisturbed : stream.readableDidRead || stream.readableAborted));
}
function isErrored(stream) {
  var _ref, _ref2, _ref3, _ref4, _ref5, _stream$kIsErrored, _stream$_readableStat3, _stream$_writableStat3, _stream$_readableStat4, _stream$_writableStat4;
  return !!(stream && ((_ref = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_stream$kIsErrored = stream[kIsErrored]) !== null && _stream$kIsErrored !== undefined ? _stream$kIsErrored : stream.readableErrored) !== null && _ref5 !== undefined ? _ref5 : stream.writableErrored) !== null && _ref4 !== undefined ? _ref4 : (_stream$_readableStat3 = stream._readableState) === null || _stream$_readableStat3 === undefined ? undefined : _stream$_readableStat3.errorEmitted) !== null && _ref3 !== undefined ? _ref3 : (_stream$_writableStat3 = stream._writableState) === null || _stream$_writableStat3 === undefined ? undefined : _stream$_writableStat3.errorEmitted) !== null && _ref2 !== undefined ? _ref2 : (_stream$_readableStat4 = stream._readableState) === null || _stream$_readableStat4 === undefined ? undefined : _stream$_readableStat4.errored) !== null && _ref !== undefined ? _ref : (_stream$_writableStat4 = stream._writableState) === null || _stream$_writableStat4 === undefined ? undefined : _stream$_writableStat4.errored));
}
module.exports = {
  kDestroyed: kDestroyed,
  isDisturbed: isDisturbed,
  kIsDisturbed: kIsDisturbed,
  isErrored: isErrored,
  kIsErrored: kIsErrored,
  isReadable: isReadable,
  kIsReadable: kIsReadable,
  isClosed: isClosed,
  isDestroyed: isDestroyed,
  isDuplexNodeStream: isDuplexNodeStream,
  isFinished: isFinished,
  isIterable: isIterable,
  isReadableNodeStream: isReadableNodeStream,
  isReadableEnded: isReadableEnded,
  isReadableFinished: isReadableFinished,
  isReadableErrored: isReadableErrored,
  isNodeStream: isNodeStream,
  isWritable: isWritable,
  isWritableNodeStream: isWritableNodeStream,
  isWritableEnded: isWritableEnded,
  isWritableFinished: isWritableFinished,
  isWritableErrored: isWritableErrored,
  isServerRequest: isServerRequest,
  isServerResponse: isServerResponse,
  willEmitClose: willEmitClose
};

/***/ }),

/***/ 3613:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/* replacement start */

var process = __webpack_require__(7490)

/* replacement end */
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.
;

'use strict';
var _require = __webpack_require__(1070),
  ArrayPrototypeSlice = _require.ArrayPrototypeSlice,
  Error = _require.Error,
  FunctionPrototypeSymbolHasInstance = _require.FunctionPrototypeSymbolHasInstance,
  ObjectDefineProperty = _require.ObjectDefineProperty,
  ObjectDefineProperties = _require.ObjectDefineProperties,
  ObjectSetPrototypeOf = _require.ObjectSetPrototypeOf,
  StringPrototypeToLowerCase = _require.StringPrototypeToLowerCase,
  Symbol = _require.Symbol,
  SymbolHasInstance = _require.SymbolHasInstance;
module.exports = Writable;
Writable.WritableState = WritableState;
var _require2 = __webpack_require__(8041),
  EE = _require2.EventEmitter;
var Stream = (__webpack_require__(4647).Stream);
var _require3 = __webpack_require__(918),
  Buffer = _require3.Buffer;
var destroyImpl = __webpack_require__(6617);
var _require4 = __webpack_require__(1580),
  addAbortSignal = _require4.addAbortSignal;
var _require5 = __webpack_require__(5999),
  getHighWaterMark = _require5.getHighWaterMark,
  getDefaultHighWaterMark = _require5.getDefaultHighWaterMark;
var _require$codes = (__webpack_require__(4706).codes),
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
  ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
  ERR_STREAM_ALREADY_FINISHED = _require$codes.ERR_STREAM_ALREADY_FINISHED,
  ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
  ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
  ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
var errorOrDestroy = destroyImpl.errorOrDestroy;
ObjectSetPrototypeOf(Writable.prototype, Stream.prototype);
ObjectSetPrototypeOf(Writable, Stream);
function nop() {}
var kOnFinished = Symbol('kOnFinished');
function WritableState(options, stream, isDuplex) {
  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof __webpack_require__(6637);

  // Object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!(options && options.objectMode);
  if (isDuplex) this.objectMode = this.objectMode || !!(options && options.writableObjectMode);

  // The point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write().
  this.highWaterMark = options ? getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex) : getDefaultHighWaterMark(false);

  // if _final has been called.
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // At the start of calling end()
  this.ending = false;
  // When end() has been called, and returned.
  this.ended = false;
  // When 'finish' is emitted.
  this.finished = false;

  // Has it been destroyed
  this.destroyed = false;

  // Should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = !!(options && options.decodeStrings === false);
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options && options.defaultEncoding || 'utf8';

  // Not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // A flag to see when we're in the middle of a write.
  this.writing = false;

  // When true all writes will be buffered until .uncork() call.
  this.corked = 0;

  // A flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // A flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // The callback that's passed to _write(chunk, cb).
  this.onwrite = onwrite.bind(undefined, stream);

  // The callback that the user supplies to write(chunk, encoding, cb).
  this.writecb = null;

  // The amount that is being written when _write is called.
  this.writelen = 0;

  // Storage for data passed to the afterWrite() callback in case of
  // synchronous _write() completion.
  this.afterWriteTickInfo = null;
  resetBuffer(this);

  // Number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted.
  this.pendingcb = 0;

  // Stream is still being constructed and cannot be
  // destroyed until construction finished or failed.
  // Async construction is opt in, therefore we start as
  // constructed.
  this.constructed = true;

  // Emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams.
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again.
  this.errorEmitted = false;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = !options || options.emitClose !== false;

  // Should .destroy() be called after 'finish' (and potentially 'end').
  this.autoDestroy = !options || options.autoDestroy !== false;

  // Indicates whether the stream has errored. When true all write() calls
  // should return false. This is needed since when autoDestroy
  // is disabled we need a way to tell whether the stream has failed.
  this.errored = null;

  // Indicates whether the stream has finished destroying.
  this.closed = false;

  // True if close has been emitted or would have been emitted
  // depending on emitClose.
  this.closeEmitted = false;
  this[kOnFinished] = [];
}
function resetBuffer(state) {
  state.buffered = [];
  state.bufferedIndex = 0;
  state.allBuffers = true;
  state.allNoop = true;
}
WritableState.prototype.getBuffer = function getBuffer() {
  return ArrayPrototypeSlice(this.buffered, this.bufferedIndex);
};
ObjectDefineProperty(WritableState.prototype, 'bufferedRequestCount', {
  __proto__: null,
  get: function get() {
    return this.buffered.length - this.bufferedIndex;
  }
});
function Writable(options) {
  var _this = this;
  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5.
  var isDuplex = this instanceof __webpack_require__(6637);
  if (!isDuplex && !FunctionPrototypeSymbolHasInstance(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex);
  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
    if (typeof options.construct === 'function') this._construct = options.construct;
    if (options.signal) addAbortSignal(options.signal, this);
  }
  Stream.call(this, options);
  destroyImpl.construct(this, function () {
    var state = _this._writableState;
    if (!state.writing) {
      clearBuffer(_this, state);
    }
    finishMaybe(_this, state);
  });
}
ObjectDefineProperty(Writable, SymbolHasInstance, {
  __proto__: null,
  value: function value(object) {
    if (FunctionPrototypeSymbolHasInstance(this, object)) return true;
    if (this !== Writable) return false;
    return object && object._writableState instanceof WritableState;
  }
});

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};
function _write(stream, chunk, encoding, cb) {
  var state = stream._writableState;
  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = state.defaultEncoding;
  } else {
    if (!encoding) encoding = state.defaultEncoding;else if (encoding !== 'buffer' && !Buffer.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
    if (typeof cb !== 'function') cb = nop;
  }
  if (chunk === null) {
    throw new ERR_STREAM_NULL_VALUES();
  } else if (!state.objectMode) {
    if (typeof chunk === 'string') {
      if (state.decodeStrings !== false) {
        chunk = Buffer.from(chunk, encoding);
        encoding = 'buffer';
      }
    } else if (chunk instanceof Buffer) {
      encoding = 'buffer';
    } else if (Stream._isUint8Array(chunk)) {
      chunk = Stream._uint8ArrayToBuffer(chunk);
      encoding = 'buffer';
    } else {
      throw new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
    }
  }
  var err;
  if (state.ending) {
    err = new ERR_STREAM_WRITE_AFTER_END();
  } else if (state.destroyed) {
    err = new ERR_STREAM_DESTROYED('write');
  }
  if (err) {
    process.nextTick(cb, err);
    errorOrDestroy(stream, err, true);
    return err;
  }
  state.pendingcb++;
  return writeOrBuffer(stream, state, chunk, encoding, cb);
}
Writable.prototype.write = function (chunk, encoding, cb) {
  return _write(this, chunk, encoding, cb) === true;
};
Writable.prototype.cork = function () {
  this._writableState.corked++;
};
Writable.prototype.uncork = function () {
  var state = this._writableState;
  if (state.corked) {
    state.corked--;
    if (!state.writing) clearBuffer(this, state);
  }
};
Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = StringPrototypeToLowerCase(encoding);
  if (!Buffer.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

// If we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, callback) {
  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;

  // stream._write resets state.length
  var ret = state.length < state.highWaterMark;
  // We must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;
  if (state.writing || state.corked || state.errored || !state.constructed) {
    state.buffered.push({
      chunk: chunk,
      encoding: encoding,
      callback: callback
    });
    if (state.allBuffers && encoding !== 'buffer') {
      state.allBuffers = false;
    }
    if (state.allNoop && callback !== nop) {
      state.allNoop = false;
    }
  } else {
    state.writelen = len;
    state.writecb = callback;
    state.writing = true;
    state.sync = true;
    stream._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }

  // Return false if errored or destroyed in order to break
  // any synchronous while(stream.write(data)) loops.
  return ret && !state.errored && !state.destroyed;
}
function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}
function onwriteError(stream, state, er, cb) {
  --state.pendingcb;
  cb(er);
  // Ensure callbacks are invoked even when autoDestroy is
  // not enabled. Passing `er` here doesn't make sense since
  // it's related to one specific write, not to the buffered
  // writes.
  errorBuffer(state);
  // This can emit error, but error must always follow cb.
  errorOrDestroy(stream, er);
}
function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') {
    errorOrDestroy(stream, new ERR_MULTIPLE_CALLBACK());
    return;
  }
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
  if (er) {
    // Avoid V8 leak, https://github.com/nodejs/node/pull/34103#issuecomment-652002364
    er.stack; // eslint-disable-line no-unused-expressions

    if (!state.errored) {
      state.errored = er;
    }

    // In case of duplex streams we need to notify the readable side of the
    // error.
    if (stream._readableState && !stream._readableState.errored) {
      stream._readableState.errored = er;
    }
    if (sync) {
      process.nextTick(onwriteError, stream, state, er, cb);
    } else {
      onwriteError(stream, state, er, cb);
    }
  } else {
    if (state.buffered.length > state.bufferedIndex) {
      clearBuffer(stream, state);
    }
    if (sync) {
      // It is a common case that the callback passed to .write() is always
      // the same. In that case, we do not schedule a new nextTick(), but
      // rather just increase a counter, to improve performance and avoid
      // memory allocations.
      if (state.afterWriteTickInfo !== null && state.afterWriteTickInfo.cb === cb) {
        state.afterWriteTickInfo.count++;
      } else {
        state.afterWriteTickInfo = {
          count: 1,
          cb: cb,
          stream: stream,
          state: state
        };
        process.nextTick(afterWriteTick, state.afterWriteTickInfo);
      }
    } else {
      afterWrite(stream, state, 1, cb);
    }
  }
}
function afterWriteTick(_ref) {
  var stream = _ref.stream,
    state = _ref.state,
    count = _ref.count,
    cb = _ref.cb;
  state.afterWriteTickInfo = null;
  return afterWrite(stream, state, count, cb);
}
function afterWrite(stream, state, count, cb) {
  var needDrain = !state.ending && !stream.destroyed && state.length === 0 && state.needDrain;
  if (needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
  while (count-- > 0) {
    state.pendingcb--;
    cb();
  }
  if (state.destroyed) {
    errorBuffer(state);
  }
  finishMaybe(stream, state);
}

// If there's something in the buffer waiting, then invoke callbacks.
function errorBuffer(state) {
  if (state.writing) {
    return;
  }
  for (var n = state.bufferedIndex; n < state.buffered.length; ++n) {
    var _state$errored;
    var _state$buffered$n = state.buffered[n],
      chunk = _state$buffered$n.chunk,
      callback = _state$buffered$n.callback;
    var len = state.objectMode ? 1 : chunk.length;
    state.length -= len;
    callback((_state$errored = state.errored) !== null && _state$errored !== undefined ? _state$errored : new ERR_STREAM_DESTROYED('write'));
  }
  var onfinishCallbacks = state[kOnFinished].splice(0);
  for (var i = 0; i < onfinishCallbacks.length; i++) {
    var _state$errored2;
    onfinishCallbacks[i]((_state$errored2 = state.errored) !== null && _state$errored2 !== undefined ? _state$errored2 : new ERR_STREAM_DESTROYED('end'));
  }
  resetBuffer(state);
}

// If there's something in the buffer waiting, then process it.
function clearBuffer(stream, state) {
  if (state.corked || state.bufferProcessing || state.destroyed || !state.constructed) {
    return;
  }
  var buffered = state.buffered,
    bufferedIndex = state.bufferedIndex,
    objectMode = state.objectMode;
  var bufferedLength = buffered.length - bufferedIndex;
  if (!bufferedLength) {
    return;
  }
  var i = bufferedIndex;
  state.bufferProcessing = true;
  if (bufferedLength > 1 && stream._writev) {
    state.pendingcb -= bufferedLength - 1;
    var callback = state.allNoop ? nop : function (err) {
      for (var n = i; n < buffered.length; ++n) {
        buffered[n].callback(err);
      }
    };
    // Make a copy of `buffered` if it's going to be used by `callback` above,
    // since `doWrite` will mutate the array.
    var chunks = state.allNoop && i === 0 ? buffered : ArrayPrototypeSlice(buffered, i);
    chunks.allBuffers = state.allBuffers;
    doWrite(stream, state, true, state.length, chunks, '', callback);
    resetBuffer(state);
  } else {
    do {
      var _buffered$i = buffered[i],
        chunk = _buffered$i.chunk,
        encoding = _buffered$i.encoding,
        _callback = _buffered$i.callback;
      buffered[i++] = null;
      var len = objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, _callback);
    } while (i < buffered.length && !state.writing);
    if (i === buffered.length) {
      resetBuffer(state);
    } else if (i > 256) {
      buffered.splice(0, i);
      state.bufferedIndex = 0;
    } else {
      state.bufferedIndex = i;
    }
  }
  state.bufferProcessing = false;
}
Writable.prototype._write = function (chunk, encoding, cb) {
  if (this._writev) {
    this._writev([{
      chunk: chunk,
      encoding: encoding
    }], cb);
  } else {
    throw new ERR_METHOD_NOT_IMPLEMENTED('_write()');
  }
};
Writable.prototype._writev = null;
Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;
  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }
  var err;
  if (chunk !== null && chunk !== undefined) {
    var ret = _write(this, chunk, encoding);
    if (ret instanceof Error) {
      err = ret;
    }
  }

  // .end() fully uncorks.
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }
  if (err) {
    // Do nothing...
  } else if (!state.errored && !state.ending) {
    // This is forgiving in terms of unnecessary calls to end() and can hide
    // logic errors. However, usually such errors are harmless and causing a
    // hard error can be disproportionately destructive. It is not always
    // trivial for the user to determine whether end() needs to be called
    // or not.

    state.ending = true;
    finishMaybe(this, state, true);
    state.ended = true;
  } else if (state.finished) {
    err = new ERR_STREAM_ALREADY_FINISHED('end');
  } else if (state.destroyed) {
    err = new ERR_STREAM_DESTROYED('end');
  }
  if (typeof cb === 'function') {
    if (err || state.finished) {
      process.nextTick(cb, err);
    } else {
      state[kOnFinished].push(cb);
    }
  }
  return this;
};
function needFinish(state) {
  return state.ending && !state.destroyed && state.constructed && state.length === 0 && !state.errored && state.buffered.length === 0 && !state.finished && !state.writing && !state.errorEmitted && !state.closeEmitted;
}
function callFinal(stream, state) {
  var called = false;
  function onFinish(err) {
    if (called) {
      errorOrDestroy(stream, err !== null && err !== undefined ? err : ERR_MULTIPLE_CALLBACK());
      return;
    }
    called = true;
    state.pendingcb--;
    if (err) {
      var onfinishCallbacks = state[kOnFinished].splice(0);
      for (var i = 0; i < onfinishCallbacks.length; i++) {
        onfinishCallbacks[i](err);
      }
      errorOrDestroy(stream, err, state.sync);
    } else if (needFinish(state)) {
      state.prefinished = true;
      stream.emit('prefinish');
      // Backwards compat. Don't check state.sync here.
      // Some streams assume 'finish' will be emitted
      // asynchronously relative to _final callback.
      state.pendingcb++;
      process.nextTick(finish, stream, state);
    }
  }
  state.sync = true;
  state.pendingcb++;
  try {
    stream._final(onFinish);
  } catch (err) {
    onFinish(err);
  }
  state.sync = false;
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.finalCalled = true;
      callFinal(stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}
function finishMaybe(stream, state, sync) {
  if (needFinish(state)) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      if (sync) {
        state.pendingcb++;
        process.nextTick(function (stream, state) {
          if (needFinish(state)) {
            finish(stream, state);
          } else {
            state.pendingcb--;
          }
        }, stream, state);
      } else if (needFinish(state)) {
        state.pendingcb++;
        finish(stream, state);
      }
    }
  }
}
function finish(stream, state) {
  state.pendingcb--;
  state.finished = true;
  var onfinishCallbacks = state[kOnFinished].splice(0);
  for (var i = 0; i < onfinishCallbacks.length; i++) {
    onfinishCallbacks[i]();
  }
  stream.emit('finish');
  if (state.autoDestroy) {
    // In case of duplex streams we need a way to detect
    // if the readable side is ready for autoDestroy as well.
    var rState = stream._readableState;
    var autoDestroy = !rState || rState.autoDestroy && (
    // We don't expect the readable to ever 'end'
    // if readable is explicitly set to false.
    rState.endEmitted || rState.readable === false);
    if (autoDestroy) {
      stream.destroy();
    }
  }
}
ObjectDefineProperties(Writable.prototype, {
  closed: {
    __proto__: null,
    get: function get() {
      return this._writableState ? this._writableState.closed : false;
    }
  },
  destroyed: {
    __proto__: null,
    get: function get() {
      return this._writableState ? this._writableState.destroyed : false;
    },
    set: function set(value) {
      // Backward compatibility, the user is explicitly managing destroyed.
      if (this._writableState) {
        this._writableState.destroyed = value;
      }
    }
  },
  writable: {
    __proto__: null,
    get: function get() {
      var w = this._writableState;
      // w.writable === false means that this is part of a Duplex stream
      // where the writable side was disabled upon construction.
      // Compat. The user might manually disable writable side through
      // deprecated setter.
      return !!w && w.writable !== false && !w.destroyed && !w.errored && !w.ending && !w.ended;
    },
    set: function set(val) {
      // Backwards compatible.
      if (this._writableState) {
        this._writableState.writable = !!val;
      }
    }
  },
  writableFinished: {
    __proto__: null,
    get: function get() {
      return this._writableState ? this._writableState.finished : false;
    }
  },
  writableObjectMode: {
    __proto__: null,
    get: function get() {
      return this._writableState ? this._writableState.objectMode : false;
    }
  },
  writableBuffer: {
    __proto__: null,
    get: function get() {
      return this._writableState && this._writableState.getBuffer();
    }
  },
  writableEnded: {
    __proto__: null,
    get: function get() {
      return this._writableState ? this._writableState.ending : false;
    }
  },
  writableNeedDrain: {
    __proto__: null,
    get: function get() {
      var wState = this._writableState;
      if (!wState) return false;
      return !wState.destroyed && !wState.ending && wState.needDrain;
    }
  },
  writableHighWaterMark: {
    __proto__: null,
    get: function get() {
      return this._writableState && this._writableState.highWaterMark;
    }
  },
  writableCorked: {
    __proto__: null,
    get: function get() {
      return this._writableState ? this._writableState.corked : 0;
    }
  },
  writableLength: {
    __proto__: null,
    get: function get() {
      return this._writableState && this._writableState.length;
    }
  },
  errored: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return this._writableState ? this._writableState.errored : null;
    }
  },
  writableAborted: {
    __proto__: null,
    enumerable: false,
    get: function get() {
      return !!(this._writableState.writable !== false && (this._writableState.destroyed || this._writableState.errored) && !this._writableState.finished);
    }
  }
});
var destroy = destroyImpl.destroy;
Writable.prototype.destroy = function (err, cb) {
  var state = this._writableState;

  // Invoke pending callbacks.
  if (!state.destroyed && (state.bufferedIndex < state.buffered.length || state[kOnFinished].length)) {
    process.nextTick(errorBuffer, state);
  }
  destroy.call(this, err, cb);
  return this;
};
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  cb(err);
};
Writable.prototype[EE.captureRejectionSymbol] = function (err) {
  this.destroy(err);
};
var webStreamsAdapters;

// Lazy to avoid circular references
function lazyWebStreams() {
  if (webStreamsAdapters === undefined) webStreamsAdapters = {};
  return webStreamsAdapters;
}
Writable.fromWeb = function (writableStream, options) {
  return lazyWebStreams().newStreamWritableFromWritableStream(writableStream, options);
};
Writable.toWeb = function (streamWritable) {
  return lazyWebStreams().newWritableStreamFromStreamWritable(streamWritable);
};

/***/ }),

/***/ 1066:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(1070),
  ArrayIsArray = _require.ArrayIsArray,
  ArrayPrototypeIncludes = _require.ArrayPrototypeIncludes,
  ArrayPrototypeJoin = _require.ArrayPrototypeJoin,
  ArrayPrototypeMap = _require.ArrayPrototypeMap,
  NumberIsInteger = _require.NumberIsInteger,
  NumberIsNaN = _require.NumberIsNaN,
  NumberMAX_SAFE_INTEGER = _require.NumberMAX_SAFE_INTEGER,
  NumberMIN_SAFE_INTEGER = _require.NumberMIN_SAFE_INTEGER,
  NumberParseInt = _require.NumberParseInt,
  ObjectPrototypeHasOwnProperty = _require.ObjectPrototypeHasOwnProperty,
  RegExpPrototypeExec = _require.RegExpPrototypeExec,
  String = _require.String,
  StringPrototypeToUpperCase = _require.StringPrototypeToUpperCase,
  StringPrototypeTrim = _require.StringPrototypeTrim;
var _require2 = __webpack_require__(4706),
  hideStackFrames = _require2.hideStackFrames,
  _require2$codes = _require2.codes,
  ERR_SOCKET_BAD_PORT = _require2$codes.ERR_SOCKET_BAD_PORT,
  ERR_INVALID_ARG_TYPE = _require2$codes.ERR_INVALID_ARG_TYPE,
  ERR_INVALID_ARG_VALUE = _require2$codes.ERR_INVALID_ARG_VALUE,
  ERR_OUT_OF_RANGE = _require2$codes.ERR_OUT_OF_RANGE,
  ERR_UNKNOWN_SIGNAL = _require2$codes.ERR_UNKNOWN_SIGNAL;
var _require3 = __webpack_require__(7067),
  normalizeEncoding = _require3.normalizeEncoding;
var _require$types = (__webpack_require__(7067).types),
  isAsyncFunction = _require$types.isAsyncFunction,
  isArrayBufferView = _require$types.isArrayBufferView;
var signals = {};

/**
 * @param {*} value
 * @returns {boolean}
 */
function isInt32(value) {
  return value === (value | 0);
}

/**
 * @param {*} value
 * @returns {boolean}
 */
function isUint32(value) {
  return value === value >>> 0;
}
var octalReg = /^[0-7]+$/;
var modeDesc = 'must be a 32-bit unsigned integer or an octal string';

/**
 * Parse and validate values that will be converted into mode_t (the S_*
 * constants). Only valid numbers and octal strings are allowed. They could be
 * converted to 32-bit unsigned integers or non-negative signed integers in the
 * C++ land, but any value higher than 0o777 will result in platform-specific
 * behaviors.
 *
 * @param {*} value Values to be validated
 * @param {string} name Name of the argument
 * @param {number} [def] If specified, will be returned for invalid values
 * @returns {number}
 */
function parseFileMode(value, name, def) {
  if (typeof value === 'undefined') {
    value = def;
  }
  if (typeof value === 'string') {
    if (RegExpPrototypeExec(octalReg, value) === null) {
      throw new ERR_INVALID_ARG_VALUE(name, value, modeDesc);
    }
    value = NumberParseInt(value, 8);
  }
  validateUint32(value, name);
  return value;
}

/**
 * @callback validateInteger
 * @param {*} value
 * @param {string} name
 * @param {number} [min]
 * @param {number} [max]
 * @returns {asserts value is number}
 */

/** @type {validateInteger} */
var validateInteger = hideStackFrames(function (value, name) {
  var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : NumberMIN_SAFE_INTEGER;
  var max = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : NumberMAX_SAFE_INTEGER;
  if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
  if (!NumberIsInteger(value)) throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
  if (value < min || value > max) throw new ERR_OUT_OF_RANGE(name, ">= ".concat(min, " && <= ").concat(max), value);
});

/**
 * @callback validateInt32
 * @param {*} value
 * @param {string} name
 * @param {number} [min]
 * @param {number} [max]
 * @returns {asserts value is number}
 */

/** @type {validateInt32} */
var validateInt32 = hideStackFrames(function (value, name) {
  var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -2147483648;
  var max = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2147483647;
  // The defaults for min and max correspond to the limits of 32-bit integers.
  if (typeof value !== 'number') {
    throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
  }
  if (!NumberIsInteger(value)) {
    throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
  }
  if (value < min || value > max) {
    throw new ERR_OUT_OF_RANGE(name, ">= ".concat(min, " && <= ").concat(max), value);
  }
});

/**
 * @callback validateUint32
 * @param {*} value
 * @param {string} name
 * @param {number|boolean} [positive=false]
 * @returns {asserts value is number}
 */

/** @type {validateUint32} */
var validateUint32 = hideStackFrames(function (value, name) {
  var positive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (typeof value !== 'number') {
    throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
  }
  if (!NumberIsInteger(value)) {
    throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
  }
  var min = positive ? 1 : 0;
  // 2 ** 32 === 4294967296
  var max = 4294967295;
  if (value < min || value > max) {
    throw new ERR_OUT_OF_RANGE(name, ">= ".concat(min, " && <= ").concat(max), value);
  }
});

/**
 * @callback validateString
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is string}
 */

/** @type {validateString} */
function validateString(value, name) {
  if (typeof value !== 'string') throw new ERR_INVALID_ARG_TYPE(name, 'string', value);
}

/**
 * @callback validateNumber
 * @param {*} value
 * @param {string} name
 * @param {number} [min]
 * @param {number} [max]
 * @returns {asserts value is number}
 */

/** @type {validateNumber} */
function validateNumber(value, name) {
  var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  var max = arguments.length > 3 ? arguments[3] : undefined;
  if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
  if (min != null && value < min || max != null && value > max || (min != null || max != null) && NumberIsNaN(value)) {
    throw new ERR_OUT_OF_RANGE(name, "".concat(min != null ? ">= ".concat(min) : '').concat(min != null && max != null ? ' && ' : '').concat(max != null ? "<= ".concat(max) : ''), value);
  }
}

/**
 * @callback validateOneOf
 * @template T
 * @param {T} value
 * @param {string} name
 * @param {T[]} oneOf
 */

/** @type {validateOneOf} */
var validateOneOf = hideStackFrames(function (value, name, oneOf) {
  if (!ArrayPrototypeIncludes(oneOf, value)) {
    var allowed = ArrayPrototypeJoin(ArrayPrototypeMap(oneOf, function (v) {
      return typeof v === 'string' ? "'".concat(v, "'") : String(v);
    }), ', ');
    var reason = 'must be one of: ' + allowed;
    throw new ERR_INVALID_ARG_VALUE(name, value, reason);
  }
});

/**
 * @callback validateBoolean
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is boolean}
 */

/** @type {validateBoolean} */
function validateBoolean(value, name) {
  if (typeof value !== 'boolean') throw new ERR_INVALID_ARG_TYPE(name, 'boolean', value);
}
function getOwnPropertyValueOrDefault(options, key, defaultValue) {
  return options == null || !ObjectPrototypeHasOwnProperty(options, key) ? defaultValue : options[key];
}

/**
 * @callback validateObject
 * @param {*} value
 * @param {string} name
 * @param {{
 *   allowArray?: boolean,
 *   allowFunction?: boolean,
 *   nullable?: boolean
 * }} [options]
 */

/** @type {validateObject} */
var validateObject = hideStackFrames(function (value, name) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var allowArray = getOwnPropertyValueOrDefault(options, 'allowArray', false);
  var allowFunction = getOwnPropertyValueOrDefault(options, 'allowFunction', false);
  var nullable = getOwnPropertyValueOrDefault(options, 'nullable', false);
  if (!nullable && value === null || !allowArray && ArrayIsArray(value) || typeof value !== 'object' && (!allowFunction || typeof value !== 'function')) {
    throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
  }
});

/**
 * @callback validateArray
 * @param {*} value
 * @param {string} name
 * @param {number} [minLength]
 * @returns {asserts value is any[]}
 */

/** @type {validateArray} */
var validateArray = hideStackFrames(function (value, name) {
  var minLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  if (!ArrayIsArray(value)) {
    throw new ERR_INVALID_ARG_TYPE(name, 'Array', value);
  }
  if (value.length < minLength) {
    var reason = "must be longer than ".concat(minLength);
    throw new ERR_INVALID_ARG_VALUE(name, value, reason);
  }
});

// eslint-disable-next-line jsdoc/require-returns-check
/**
 * @param {*} signal
 * @param {string} [name='signal']
 * @returns {asserts signal is keyof signals}
 */
function validateSignalName(signal) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'signal';
  validateString(signal, name);
  if (signals[signal] === undefined) {
    if (signals[StringPrototypeToUpperCase(signal)] !== undefined) {
      throw new ERR_UNKNOWN_SIGNAL(signal + ' (signals must use all capital letters)');
    }
    throw new ERR_UNKNOWN_SIGNAL(signal);
  }
}

/**
 * @callback validateBuffer
 * @param {*} buffer
 * @param {string} [name='buffer']
 * @returns {asserts buffer is ArrayBufferView}
 */

/** @type {validateBuffer} */
var validateBuffer = hideStackFrames(function (buffer) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'buffer';
  if (!isArrayBufferView(buffer)) {
    throw new ERR_INVALID_ARG_TYPE(name, ['Buffer', 'TypedArray', 'DataView'], buffer);
  }
});

/**
 * @param {string} data
 * @param {string} encoding
 */
function validateEncoding(data, encoding) {
  var normalizedEncoding = normalizeEncoding(encoding);
  var length = data.length;
  if (normalizedEncoding === 'hex' && length % 2 !== 0) {
    throw new ERR_INVALID_ARG_VALUE('encoding', encoding, "is invalid for data of length ".concat(length));
  }
}

/**
 * Check that the port number is not NaN when coerced to a number,
 * is an integer and that it falls within the legal range of port numbers.
 * @param {*} port
 * @param {string} [name='Port']
 * @param {boolean} [allowZero=true]
 * @returns {number}
 */
function validatePort(port) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Port';
  var allowZero = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  if (typeof port !== 'number' && typeof port !== 'string' || typeof port === 'string' && StringPrototypeTrim(port).length === 0 || +port !== +port >>> 0 || port > 0xffff || port === 0 && !allowZero) {
    throw new ERR_SOCKET_BAD_PORT(name, port, allowZero);
  }
  return port | 0;
}

/**
 * @callback validateAbortSignal
 * @param {*} signal
 * @param {string} name
 */

/** @type {validateAbortSignal} */
var validateAbortSignal = hideStackFrames(function (signal, name) {
  if (signal !== undefined && (signal === null || typeof signal !== 'object' || !('aborted' in signal))) {
    throw new ERR_INVALID_ARG_TYPE(name, 'AbortSignal', signal);
  }
});

/**
 * @callback validateFunction
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is Function}
 */

/** @type {validateFunction} */
var validateFunction = hideStackFrames(function (value, name) {
  if (typeof value !== 'function') throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
});

/**
 * @callback validatePlainFunction
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is Function}
 */

/** @type {validatePlainFunction} */
var validatePlainFunction = hideStackFrames(function (value, name) {
  if (typeof value !== 'function' || isAsyncFunction(value)) throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
});

/**
 * @callback validateUndefined
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is undefined}
 */

/** @type {validateUndefined} */
var validateUndefined = hideStackFrames(function (value, name) {
  if (value !== undefined) throw new ERR_INVALID_ARG_TYPE(name, 'undefined', value);
});

/**
 * @template T
 * @param {T} value
 * @param {string} name
 * @param {T[]} union
 */
function validateUnion(value, name, union) {
  if (!ArrayPrototypeIncludes(union, value)) {
    throw new ERR_INVALID_ARG_TYPE(name, "('".concat(ArrayPrototypeJoin(union, '|'), "')"), value);
  }
}
module.exports = {
  isInt32: isInt32,
  isUint32: isUint32,
  parseFileMode: parseFileMode,
  validateArray: validateArray,
  validateBoolean: validateBoolean,
  validateBuffer: validateBuffer,
  validateEncoding: validateEncoding,
  validateFunction: validateFunction,
  validateInt32: validateInt32,
  validateInteger: validateInteger,
  validateNumber: validateNumber,
  validateObject: validateObject,
  validateOneOf: validateOneOf,
  validatePlainFunction: validatePlainFunction,
  validatePort: validatePort,
  validateSignalName: validateSignalName,
  validateString: validateString,
  validateUint32: validateUint32,
  validateUndefined: validateUndefined,
  validateUnion: validateUnion,
  validateAbortSignal: validateAbortSignal
};

/***/ }),

/***/ 3284:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var CustomStream = __webpack_require__(8943);
var promises = __webpack_require__(7511);
var originalDestroy = CustomStream.Readable.destroy;
module.exports = CustomStream.Readable;

// Explicit export naming is needed for ESM
module.exports._uint8ArrayToBuffer = CustomStream._uint8ArrayToBuffer;
module.exports._isUint8Array = CustomStream._isUint8Array;
module.exports.isDisturbed = CustomStream.isDisturbed;
module.exports.isErrored = CustomStream.isErrored;
module.exports.isReadable = CustomStream.isReadable;
module.exports.Readable = CustomStream.Readable;
module.exports.Writable = CustomStream.Writable;
module.exports.Duplex = CustomStream.Duplex;
module.exports.Transform = CustomStream.Transform;
module.exports.PassThrough = CustomStream.PassThrough;
module.exports.addAbortSignal = CustomStream.addAbortSignal;
module.exports.finished = CustomStream.finished;
module.exports.destroy = CustomStream.destroy;
module.exports.destroy = originalDestroy;
module.exports.pipeline = CustomStream.pipeline;
module.exports.compose = CustomStream.compose;
Object.defineProperty(CustomStream, 'promises', {
  configurable: true,
  enumerable: true,
  get: function get() {
    return promises;
  }
});
module.exports.Stream = CustomStream.Stream;

// Allow default importing
module.exports["default"] = module.exports;

/***/ }),

/***/ 4706:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _createForOfIteratorHelper = (__webpack_require__(4704)["default"]);
var _wrapNativeSuper = (__webpack_require__(3496)["default"]);
var _classCallCheck = (__webpack_require__(6690)["default"]);
var _createClass = (__webpack_require__(9728)["default"]);
var _inherits = (__webpack_require__(1655)["default"]);
var _createSuper = (__webpack_require__(6389)["default"]);
var _toConsumableArray = (__webpack_require__(861)["default"]);
var _require = __webpack_require__(7067),
  format = _require.format,
  inspect = _require.inspect,
  CustomAggregateError = _require.AggregateError;

/*
  This file is a reduced and adapted version of the main lib/internal/errors.js file defined at

  https://github.com/nodejs/node/blob/master/lib/internal/errors.js

  Don't try to replace with the original file and keep it up to date (starting from E(...) definitions)
  with the upstream file.
*/

var AggregateError = globalThis.AggregateError || CustomAggregateError;
var kIsNodeError = Symbol('kIsNodeError');
var kTypes = ['string', 'function', 'number', 'object',
// Accept 'Function' and 'Object' as alternative to the lower cased version.
'Function', 'Object', 'boolean', 'bigint', 'symbol'];
var classRegExp = /^([A-Z][a-z0-9]*)+$/;
var nodeInternalPrefix = '__node_internal_';
var codes = {};
function assert(value, message) {
  if (!value) {
    throw new codes.ERR_INTERNAL_ASSERTION(message);
  }
}

// Only use this for integers! Decimal numbers do not work with this function.
function addNumericalSeparator(val) {
  var res = '';
  var i = val.length;
  var start = val[0] === '-' ? 1 : 0;
  for (; i >= start + 4; i -= 3) {
    res = "_".concat(val.slice(i - 3, i)).concat(res);
  }
  return "".concat(val.slice(0, i)).concat(res);
}
function getMessage(key, msg, args) {
  if (typeof msg === 'function') {
    assert(msg.length <= args.length, // Default options do not count.
    "Code: ".concat(key, "; The provided arguments length (").concat(args.length, ") does not match the required ones (").concat(msg.length, ")."));
    return msg.apply(void 0, _toConsumableArray(args));
  }
  var expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
  assert(expectedLength === args.length, "Code: ".concat(key, "; The provided arguments length (").concat(args.length, ") does not match the required ones (").concat(expectedLength, ")."));
  if (args.length === 0) {
    return msg;
  }
  return format.apply(void 0, [msg].concat(_toConsumableArray(args)));
}
function E(code, message, Base) {
  if (!Base) {
    Base = Error;
  }
  var NodeError = /*#__PURE__*/function (_Base) {
    _inherits(NodeError, _Base);
    var _super = _createSuper(NodeError);
    function NodeError() {
      _classCallCheck(this, NodeError);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _super.call(this, getMessage(code, message, args));
    }
    _createClass(NodeError, [{
      key: "toString",
      value: function toString() {
        return "".concat(this.name, " [").concat(code, "]: ").concat(this.message);
      }
    }]);
    return NodeError;
  }(Base);
  Object.defineProperties(NodeError.prototype, {
    name: {
      value: Base.name,
      writable: true,
      enumerable: false,
      configurable: true
    },
    toString: {
      value: function value() {
        return "".concat(this.name, " [").concat(code, "]: ").concat(this.message);
      },
      writable: true,
      enumerable: false,
      configurable: true
    }
  });
  NodeError.prototype.code = code;
  NodeError.prototype[kIsNodeError] = true;
  codes[code] = NodeError;
}
function hideStackFrames(fn) {
  // We rename the functions that will be hidden to cut off the stacktrace
  // at the outermost one
  var hidden = nodeInternalPrefix + fn.name;
  Object.defineProperty(fn, 'name', {
    value: hidden
  });
  return fn;
}
function aggregateTwoErrors(innerError, outerError) {
  if (innerError && outerError && innerError !== outerError) {
    if (Array.isArray(outerError.errors)) {
      // If `outerError` is already an `AggregateError`.
      outerError.errors.push(innerError);
      return outerError;
    }
    var err = new AggregateError([outerError, innerError], outerError.message);
    err.code = outerError.code;
    return err;
  }
  return innerError || outerError;
}
var AbortError = /*#__PURE__*/function (_Error) {
  _inherits(AbortError, _Error);
  var _super2 = _createSuper(AbortError);
  function AbortError() {
    var _this;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'The operation was aborted';
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    _classCallCheck(this, AbortError);
    if (options !== undefined && typeof options !== 'object') {
      throw new codes.ERR_INVALID_ARG_TYPE('options', 'Object', options);
    }
    _this = _super2.call(this, message, options);
    _this.code = 'ABORT_ERR';
    _this.name = 'AbortError';
    return _this;
  }
  return _createClass(AbortError);
}( /*#__PURE__*/_wrapNativeSuper(Error));
E('ERR_ASSERTION', '%s', Error);
E('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  assert(typeof name === 'string', "'name' must be a string");
  if (!Array.isArray(expected)) {
    expected = [expected];
  }
  var msg = 'The ';
  if (name.endsWith(' argument')) {
    // For cases like 'first argument'
    msg += "".concat(name, " ");
  } else {
    msg += "\"".concat(name, "\" ").concat(name.includes('.') ? 'property' : 'argument', " ");
  }
  msg += 'must be ';
  var types = [];
  var instances = [];
  var other = [];
  var _iterator = _createForOfIteratorHelper(expected),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var value = _step.value;
      assert(typeof value === 'string', 'All expected entries have to be of type string');
      if (kTypes.includes(value)) {
        types.push(value.toLowerCase());
      } else if (classRegExp.test(value)) {
        instances.push(value);
      } else {
        assert(value !== 'object', 'The value "object" should be written as "Object"');
        other.push(value);
      }
    }

    // Special handle `object` in case other instances are allowed to outline
    // the differences between each other.
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  if (instances.length > 0) {
    var pos = types.indexOf('object');
    if (pos !== -1) {
      types.splice(types, pos, 1);
      instances.push('Object');
    }
  }
  if (types.length > 0) {
    switch (types.length) {
      case 1:
        msg += "of type ".concat(types[0]);
        break;
      case 2:
        msg += "one of type ".concat(types[0], " or ").concat(types[1]);
        break;
      default:
        {
          var last = types.pop();
          msg += "one of type ".concat(types.join(', '), ", or ").concat(last);
        }
    }
    if (instances.length > 0 || other.length > 0) {
      msg += ' or ';
    }
  }
  if (instances.length > 0) {
    switch (instances.length) {
      case 1:
        msg += "an instance of ".concat(instances[0]);
        break;
      case 2:
        msg += "an instance of ".concat(instances[0], " or ").concat(instances[1]);
        break;
      default:
        {
          var _last = instances.pop();
          msg += "an instance of ".concat(instances.join(', '), ", or ").concat(_last);
        }
    }
    if (other.length > 0) {
      msg += ' or ';
    }
  }
  switch (other.length) {
    case 0:
      break;
    case 1:
      if (other[0].toLowerCase() !== other[0]) {
        msg += 'an ';
      }
      msg += "".concat(other[0]);
      break;
    case 2:
      msg += "one of ".concat(other[0], " or ").concat(other[1]);
      break;
    default:
      {
        var _last2 = other.pop();
        msg += "one of ".concat(other.join(', '), ", or ").concat(_last2);
      }
  }
  if (actual == null) {
    msg += ". Received ".concat(actual);
  } else if (typeof actual === 'function' && actual.name) {
    msg += ". Received function ".concat(actual.name);
  } else if (typeof actual === 'object') {
    var _actual$constructor;
    if ((_actual$constructor = actual.constructor) !== null && _actual$constructor !== undefined && _actual$constructor.name) {
      msg += ". Received an instance of ".concat(actual.constructor.name);
    } else {
      var inspected = inspect(actual, {
        depth: -1
      });
      msg += ". Received ".concat(inspected);
    }
  } else {
    var _inspected = inspect(actual, {
      colors: false
    });
    if (_inspected.length > 25) {
      _inspected = "".concat(_inspected.slice(0, 25), "...");
    }
    msg += ". Received type ".concat(typeof actual, " (").concat(_inspected, ")");
  }
  return msg;
}, TypeError);
E('ERR_INVALID_ARG_VALUE', function (name, value) {
  var reason = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'is invalid';
  var inspected = inspect(value);
  if (inspected.length > 128) {
    inspected = inspected.slice(0, 128) + '...';
  }
  var type = name.includes('.') ? 'property' : 'argument';
  return "The ".concat(type, " '").concat(name, "' ").concat(reason, ". Received ").concat(inspected);
}, TypeError);
E('ERR_INVALID_RETURN_VALUE', function (input, name, value) {
  var _value$constructor;
  var type = value !== null && value !== undefined && (_value$constructor = value.constructor) !== null && _value$constructor !== undefined && _value$constructor.name ? "instance of ".concat(value.constructor.name) : "type ".concat(typeof value);
  return "Expected ".concat(input, " to be returned from the \"").concat(name, "\"") + " function but got ".concat(type, ".");
}, TypeError);
E('ERR_MISSING_ARGS', function () {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  assert(args.length > 0, 'At least one arg needs to be specified');
  var msg;
  var len = args.length;
  args = (Array.isArray(args) ? args : [args]).map(function (a) {
    return "\"".concat(a, "\"");
  }).join(' or ');
  switch (len) {
    case 1:
      msg += "The ".concat(args[0], " argument");
      break;
    case 2:
      msg += "The ".concat(args[0], " and ").concat(args[1], " arguments");
      break;
    default:
      {
        var last = args.pop();
        msg += "The ".concat(args.join(', '), ", and ").concat(last, " arguments");
      }
      break;
  }
  return "".concat(msg, " must be specified");
}, TypeError);
E('ERR_OUT_OF_RANGE', function (str, range, input) {
  assert(range, 'Missing "range" argument');
  var received;
  if (Number.isInteger(input) && Math.abs(input) > Math.pow(2, 32)) {
    received = addNumericalSeparator(String(input));
  } else if (typeof input === 'bigint') {
    received = String(input);
    if (input > Math.pow(2n, 32n) || input < -Math.pow(2n, 32n)) {
      received = addNumericalSeparator(received);
    }
    received += 'n';
  } else {
    received = inspect(input);
  }
  return "The value of \"".concat(str, "\" is out of range. It must be ").concat(range, ". Received ").concat(received);
}, RangeError);
E('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
E('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
E('ERR_STREAM_ALREADY_FINISHED', 'Cannot call %s after a stream was finished', Error);
E('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
E('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
E('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
E('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
E('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
E('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event', Error);
E('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
E('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', TypeError);
module.exports = {
  AbortError: AbortError,
  aggregateTwoErrors: hideStackFrames(aggregateTwoErrors),
  hideStackFrames: hideStackFrames,
  codes: codes
};

/***/ }),

/***/ 1070:
/***/ (function(module) {

"use strict";


/*
  This file is a reduced and adapted version of the main lib/internal/per_context/primordials.js file defined at

  https://github.com/nodejs/node/blob/master/lib/internal/per_context/primordials.js

  Don't try to replace with the original file and keep it up to date with the upstream file.
*/
module.exports = {
  ArrayIsArray: function ArrayIsArray(self) {
    return Array.isArray(self);
  },
  ArrayPrototypeIncludes: function ArrayPrototypeIncludes(self, el) {
    return self.includes(el);
  },
  ArrayPrototypeIndexOf: function ArrayPrototypeIndexOf(self, el) {
    return self.indexOf(el);
  },
  ArrayPrototypeJoin: function ArrayPrototypeJoin(self, sep) {
    return self.join(sep);
  },
  ArrayPrototypeMap: function ArrayPrototypeMap(self, fn) {
    return self.map(fn);
  },
  ArrayPrototypePop: function ArrayPrototypePop(self, el) {
    return self.pop(el);
  },
  ArrayPrototypePush: function ArrayPrototypePush(self, el) {
    return self.push(el);
  },
  ArrayPrototypeSlice: function ArrayPrototypeSlice(self, start, end) {
    return self.slice(start, end);
  },
  Error: Error,
  FunctionPrototypeCall: function FunctionPrototypeCall(fn, thisArgs) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    return fn.call.apply(fn, [thisArgs].concat(args));
  },
  FunctionPrototypeSymbolHasInstance: function FunctionPrototypeSymbolHasInstance(self, instance) {
    return Function.prototype[Symbol.hasInstance].call(self, instance);
  },
  MathFloor: Math.floor,
  Number: Number,
  NumberIsInteger: Number.isInteger,
  NumberIsNaN: Number.isNaN,
  NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
  NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
  NumberParseInt: Number.parseInt,
  ObjectDefineProperties: function ObjectDefineProperties(self, props) {
    return Object.defineProperties(self, props);
  },
  ObjectDefineProperty: function ObjectDefineProperty(self, name, prop) {
    return Object.defineProperty(self, name, prop);
  },
  ObjectGetOwnPropertyDescriptor: function ObjectGetOwnPropertyDescriptor(self, name) {
    return Object.getOwnPropertyDescriptor(self, name);
  },
  ObjectKeys: function ObjectKeys(obj) {
    return Object.keys(obj);
  },
  ObjectSetPrototypeOf: function ObjectSetPrototypeOf(target, proto) {
    return Object.setPrototypeOf(target, proto);
  },
  Promise: Promise,
  PromisePrototypeCatch: function PromisePrototypeCatch(self, fn) {
    return self.catch(fn);
  },
  PromisePrototypeThen: function PromisePrototypeThen(self, thenFn, catchFn) {
    return self.then(thenFn, catchFn);
  },
  PromiseReject: function PromiseReject(err) {
    return Promise.reject(err);
  },
  ReflectApply: Reflect.apply,
  RegExpPrototypeTest: function RegExpPrototypeTest(self, value) {
    return self.test(value);
  },
  SafeSet: Set,
  String: String,
  StringPrototypeSlice: function StringPrototypeSlice(self, start, end) {
    return self.slice(start, end);
  },
  StringPrototypeToLowerCase: function StringPrototypeToLowerCase(self) {
    return self.toLowerCase();
  },
  StringPrototypeToUpperCase: function StringPrototypeToUpperCase(self) {
    return self.toUpperCase();
  },
  StringPrototypeTrim: function StringPrototypeTrim(self) {
    return self.trim();
  },
  Symbol: Symbol,
  SymbolAsyncIterator: Symbol.asyncIterator,
  SymbolHasInstance: Symbol.hasInstance,
  SymbolIterator: Symbol.iterator,
  TypedArrayPrototypeSet: function TypedArrayPrototypeSet(self, buf, len) {
    return self.set(buf, len);
  },
  Uint8Array: Uint8Array
};

/***/ }),

/***/ 7067:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _createClass = (__webpack_require__(9728)["default"]);
var _classCallCheck = (__webpack_require__(6690)["default"]);
var _inherits = (__webpack_require__(1655)["default"]);
var _createSuper = (__webpack_require__(6389)["default"]);
var _wrapNativeSuper = (__webpack_require__(3496)["default"]);
var _regeneratorRuntime = (__webpack_require__(7061)["default"]);
var _asyncToGenerator = (__webpack_require__(7156)["default"]);
var bufferModule = __webpack_require__(918);
var AsyncFunction = Object.getPrototypeOf( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
  return _regeneratorRuntime().wrap(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
      case "end":
        return _context.stop();
    }
  }, _callee);
}))).constructor;
var Blob = globalThis.Blob || bufferModule.Blob;
/* eslint-disable indent */
var isBlob = typeof Blob !== 'undefined' ? function isBlob(b) {
  // eslint-disable-next-line indent
  return b instanceof Blob;
} : function isBlob(b) {
  return false;
};
/* eslint-enable indent */

// This is a simplified version of AggregateError
var AggregateError = /*#__PURE__*/function (_Error) {
  _inherits(AggregateError, _Error);
  var _super = _createSuper(AggregateError);
  function AggregateError(errors) {
    var _this;
    _classCallCheck(this, AggregateError);
    if (!Array.isArray(errors)) {
      throw new TypeError("Expected input to be an Array, got ".concat(typeof errors));
    }
    var message = '';
    for (var i = 0; i < errors.length; i++) {
      message += "    ".concat(errors[i].stack, "\n");
    }
    _this = _super.call(this, message);
    _this.name = 'AggregateError';
    _this.errors = errors;
    return _this;
  }
  return _createClass(AggregateError);
}( /*#__PURE__*/_wrapNativeSuper(Error));
module.exports = {
  AggregateError: AggregateError,
  kEmptyObject: Object.freeze({}),
  once: function once(callback) {
    var called = false;
    return function () {
      if (called) {
        return;
      }
      called = true;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      callback.apply(this, args);
    };
  },
  createDeferredPromise: function createDeferredPromise() {
    var resolve;
    var reject;

    // eslint-disable-next-line promise/param-names
    var promise = new Promise(function (res, rej) {
      resolve = res;
      reject = rej;
    });
    return {
      promise: promise,
      resolve: resolve,
      reject: reject
    };
  },
  promisify: function promisify(fn) {
    return new Promise(function (resolve, reject) {
      fn(function (err) {
        if (err) {
          return reject(err);
        }
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        return resolve.apply(void 0, args);
      });
    });
  },
  debuglog: function debuglog() {
    return function () {};
  },
  format: function format(_format) {
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }
    // Simplified version of https://nodejs.org/api/util.html#utilformatformat-args
    return _format.replace(/%([sdifj])/g, function () {
      for (var _len4 = arguments.length, _ref2 = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        _ref2[_key4] = arguments[_key4];
      }
      var _unused = _ref2[0],
        type = _ref2[1];
      var replacement = args.shift();
      if (type === 'f') {
        return replacement.toFixed(6);
      } else if (type === 'j') {
        return JSON.stringify(replacement);
      } else if (type === 's' && typeof replacement === 'object') {
        var ctor = replacement.constructor !== Object ? replacement.constructor.name : '';
        return "".concat(ctor, " {}").trim();
      } else {
        return replacement.toString();
      }
    });
  },
  inspect: function inspect(value) {
    // Vastly simplified version of https://nodejs.org/api/util.html#utilinspectobject-options
    switch (typeof value) {
      case 'string':
        if (value.includes("'")) {
          if (!value.includes('"')) {
            return "\"".concat(value, "\"");
          } else if (!value.includes('`') && !value.includes('${')) {
            return "`".concat(value, "`");
          }
        }
        return "'".concat(value, "'");
      case 'number':
        if (isNaN(value)) {
          return 'NaN';
        } else if (Object.is(value, -0)) {
          return String(value);
        }
        return value;
      case 'bigint':
        return "".concat(String(value), "n");
      case 'boolean':
      case 'undefined':
        return String(value);
      case 'object':
        return '{}';
    }
  },
  types: {
    isAsyncFunction: function isAsyncFunction(fn) {
      return fn instanceof AsyncFunction;
    },
    isArrayBufferView: function isArrayBufferView(arr) {
      return ArrayBuffer.isView(arr);
    }
  },
  isBlob: isBlob
};
module.exports.promisify.custom = Symbol.for('nodejs.util.promisify.custom');

/***/ }),

/***/ 8943:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _createForOfIteratorHelper = (__webpack_require__(4704)["default"]);
/* replacement start */

var _require = __webpack_require__(918),
  Buffer = _require.Buffer;
'use strict';
var _require2 = __webpack_require__(1070),
  ObjectDefineProperty = _require2.ObjectDefineProperty,
  ObjectKeys = _require2.ObjectKeys,
  ReflectApply = _require2.ReflectApply;
var _require3 = __webpack_require__(7067),
  customPromisify = _require3.promisify.custom;
var _require4 = __webpack_require__(3668),
  streamReturningOperators = _require4.streamReturningOperators,
  promiseReturningOperators = _require4.promiseReturningOperators;
var _require5 = __webpack_require__(4706),
  ERR_ILLEGAL_CONSTRUCTOR = _require5.codes.ERR_ILLEGAL_CONSTRUCTOR;
var compose = __webpack_require__(8457);
var _require6 = __webpack_require__(6545),
  pipeline = _require6.pipeline;
var _require7 = __webpack_require__(6617),
  destroyer = _require7.destroyer;
var eos = __webpack_require__(4297);
var internalBuffer = {};
var promises = __webpack_require__(7511);
var utils = __webpack_require__(6767);
var Stream = module.exports = __webpack_require__(4647).Stream;
Stream.isDisturbed = utils.isDisturbed;
Stream.isErrored = utils.isErrored;
Stream.isReadable = utils.isReadable;
Stream.Readable = __webpack_require__(8581);
var _iterator = _createForOfIteratorHelper(ObjectKeys(streamReturningOperators)),
  _step;
try {
  var _loop = function _loop() {
    var key = _step.value;
    var op = streamReturningOperators[key];
    function fn() {
      if (this instanceof fn ? this.constructor : void 0) {
        throw ERR_ILLEGAL_CONSTRUCTOR();
      }
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return Stream.Readable.from(ReflectApply(op, this, args));
    }
    ObjectDefineProperty(fn, 'name', {
      __proto__: null,
      value: op.name
    });
    ObjectDefineProperty(fn, 'length', {
      __proto__: null,
      value: op.length
    });
    ObjectDefineProperty(Stream.Readable.prototype, key, {
      __proto__: null,
      value: fn,
      enumerable: false,
      configurable: true,
      writable: true
    });
  };
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    _loop();
  }
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}
var _iterator2 = _createForOfIteratorHelper(ObjectKeys(promiseReturningOperators)),
  _step2;
try {
  var _loop2 = function _loop2() {
    var key = _step2.value;
    var op = promiseReturningOperators[key];
    function fn() {
      if (this instanceof fn ? this.constructor : void 0) {
        throw ERR_ILLEGAL_CONSTRUCTOR();
      }
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return ReflectApply(op, this, args);
    }
    ObjectDefineProperty(fn, 'name', {
      __proto__: null,
      value: op.name
    });
    ObjectDefineProperty(fn, 'length', {
      __proto__: null,
      value: op.length
    });
    ObjectDefineProperty(Stream.Readable.prototype, key, {
      __proto__: null,
      value: fn,
      enumerable: false,
      configurable: true,
      writable: true
    });
  };
  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
    _loop2();
  }
} catch (err) {
  _iterator2.e(err);
} finally {
  _iterator2.f();
}
Stream.Writable = __webpack_require__(3613);
Stream.Duplex = __webpack_require__(6637);
Stream.Transform = __webpack_require__(3575);
Stream.PassThrough = __webpack_require__(5329);
Stream.pipeline = pipeline;
var _require8 = __webpack_require__(1580),
  addAbortSignal = _require8.addAbortSignal;
Stream.addAbortSignal = addAbortSignal;
Stream.finished = eos;
Stream.destroy = destroyer;
Stream.compose = compose;
ObjectDefineProperty(Stream, 'promises', {
  __proto__: null,
  configurable: true,
  enumerable: true,
  get: function get() {
    return promises;
  }
});
ObjectDefineProperty(pipeline, customPromisify, {
  __proto__: null,
  enumerable: true,
  get: function get() {
    return promises.pipeline;
  }
});
ObjectDefineProperty(eos, customPromisify, {
  __proto__: null,
  enumerable: true,
  get: function get() {
    return promises.finished;
  }
});

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;
Stream._isUint8Array = function isUint8Array(value) {
  return value instanceof Uint8Array;
};
Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
};

/***/ }),

/***/ 7511:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(1070),
  ArrayPrototypePop = _require.ArrayPrototypePop,
  Promise = _require.Promise;
var _require2 = __webpack_require__(6767),
  isIterable = _require2.isIterable,
  isNodeStream = _require2.isNodeStream;
var _require3 = __webpack_require__(6545),
  pl = _require3.pipelineImpl;
var _require4 = __webpack_require__(4297),
  finished = _require4.finished;
function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }
  return new Promise(function (resolve, reject) {
    var signal;
    var end;
    var lastArg = streams[streams.length - 1];
    if (lastArg && typeof lastArg === 'object' && !isNodeStream(lastArg) && !isIterable(lastArg)) {
      var options = ArrayPrototypePop(streams);
      signal = options.signal;
      end = options.end;
    }
    pl(streams, function (err, value) {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    }, {
      signal: signal,
      end: end
    });
  });
}
module.exports = {
  finished: finished,
  pipeline: pipeline
};

/***/ }),

/***/ 5734:
/***/ (function(module, exports, __webpack_require__) {

/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = __webpack_require__(918);
var Buffer = buffer.Buffer;

// alternative to using Object.keys for old browsers
function copyProps(src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer;
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports);
  exports.Buffer = SafeBuffer;
}
function SafeBuffer(arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length);
}
SafeBuffer.prototype = Object.create(Buffer.prototype);

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer);
SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number');
  }
  return Buffer(arg, encodingOrOffset, length);
};
SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  var buf = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }
  return buf;
};
SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  return Buffer(size);
};
SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  return buffer.SlowBuffer(size);
};

/***/ }),

/***/ 8570:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



/*<replacement>*/
var Buffer = (__webpack_require__(5734).Buffer);
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
    case 'raw':
      return true;
    default:
      return false;
  }
};
function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
}
;

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}
StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};
StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return "\uFFFD";
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return "\uFFFD";
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return "\uFFFD";
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + "\uFFFD";
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}
function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}
function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}
function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}

/***/ }),

/***/ 4642:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var OverloadYield = __webpack_require__(3801);
function AsyncGenerator(gen) {
  var front, back;
  function resume(key, arg) {
    try {
      var result = gen[key](arg),
        value = result.value,
        overloaded = value instanceof OverloadYield;
      Promise.resolve(overloaded ? value.v : value).then(function (arg) {
        if (overloaded) {
          var nextKey = "return" === key ? "return" : "next";
          if (!value.k || arg.done) return resume(nextKey, arg);
          arg = gen[nextKey](arg).value;
        }
        settle(result.done ? "return" : "normal", arg);
      }, function (err) {
        resume("throw", err);
      });
    } catch (err) {
      settle("throw", err);
    }
  }
  function settle(type, value) {
    switch (type) {
      case "return":
        front.resolve({
          value: value,
          done: !0
        });
        break;
      case "throw":
        front.reject(value);
        break;
      default:
        front.resolve({
          value: value,
          done: !1
        });
    }
    (front = front.next) ? resume(front.key, front.arg) : back = null;
  }
  this._invoke = function (key, arg) {
    return new Promise(function (resolve, reject) {
      var request = {
        key: key,
        arg: arg,
        resolve: resolve,
        reject: reject,
        next: null
      };
      back ? back = back.next = request : (front = back = request, resume(key, arg));
    });
  }, "function" != typeof gen["return"] && (this["return"] = void 0);
}
AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function () {
  return this;
}, AsyncGenerator.prototype.next = function (arg) {
  return this._invoke("next", arg);
}, AsyncGenerator.prototype["throw"] = function (arg) {
  return this._invoke("throw", arg);
}, AsyncGenerator.prototype["return"] = function (arg) {
  return this._invoke("return", arg);
};
module.exports = AsyncGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 3801:
/***/ (function(module) {

function _OverloadYield(value, kind) {
  this.v = value, this.k = kind;
}
module.exports = _OverloadYield, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 3897:
/***/ (function(module) {

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
module.exports = _arrayLikeToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 3405:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var arrayLikeToArray = __webpack_require__(3897);
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
}
module.exports = _arrayWithoutHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 6115:
/***/ (function(module) {

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 8131:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var OverloadYield = __webpack_require__(3801);
function _asyncGeneratorDelegate(inner) {
  var iter = {},
    waiting = !1;
  function pump(key, value) {
    return waiting = !0, value = new Promise(function (resolve) {
      resolve(inner[key](value));
    }), {
      done: !1,
      value: new OverloadYield(value, 1)
    };
  }
  return iter["undefined" != typeof Symbol && Symbol.iterator || "@@iterator"] = function () {
    return this;
  }, iter.next = function (value) {
    return waiting ? (waiting = !1, value) : pump("next", value);
  }, "function" == typeof inner["throw"] && (iter["throw"] = function (value) {
    if (waiting) throw waiting = !1, value;
    return pump("throw", value);
  }), "function" == typeof inner["return"] && (iter["return"] = function (value) {
    return waiting ? (waiting = !1, value) : pump("return", value);
  }), iter;
}
module.exports = _asyncGeneratorDelegate, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 8237:
/***/ (function(module) {

function _asyncIterator(iterable) {
  var method,
    async,
    sync,
    retry = 2;
  for ("undefined" != typeof Symbol && (async = Symbol.asyncIterator, sync = Symbol.iterator); retry--;) {
    if (async && null != (method = iterable[async])) return method.call(iterable);
    if (sync && null != (method = iterable[sync])) return new AsyncFromSyncIterator(method.call(iterable));
    async = "@@asyncIterator", sync = "@@iterator";
  }
  throw new TypeError("Object is not async iterable");
}
function AsyncFromSyncIterator(s) {
  function AsyncFromSyncIteratorContinuation(r) {
    if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object."));
    var done = r.done;
    return Promise.resolve(r.value).then(function (value) {
      return {
        value: value,
        done: done
      };
    });
  }
  return AsyncFromSyncIterator = function AsyncFromSyncIterator(s) {
    this.s = s, this.n = s.next;
  }, AsyncFromSyncIterator.prototype = {
    s: null,
    n: null,
    next: function next() {
      return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments));
    },
    "return": function _return(value) {
      var ret = this.s["return"];
      return void 0 === ret ? Promise.resolve({
        value: value,
        done: !0
      }) : AsyncFromSyncIteratorContinuation(ret.apply(this.s, arguments));
    },
    "throw": function _throw(value) {
      var thr = this.s["return"];
      return void 0 === thr ? Promise.reject(value) : AsyncFromSyncIteratorContinuation(thr.apply(this.s, arguments));
    }
  }, new AsyncFromSyncIterator(s);
}
module.exports = _asyncIterator, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 7156:
/***/ (function(module) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
module.exports = _asyncToGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 6737:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var OverloadYield = __webpack_require__(3801);
function _awaitAsyncGenerator(value) {
  return new OverloadYield(value, 0);
}
module.exports = _awaitAsyncGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 6690:
/***/ (function(module) {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 3515:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var setPrototypeOf = __webpack_require__(6015);
var isNativeReflectConstruct = __webpack_require__(9617);
function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    module.exports = _construct = Reflect.construct.bind(), module.exports.__esModule = true, module.exports["default"] = module.exports;
  } else {
    module.exports = _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) setPrototypeOf(instance, Class.prototype);
      return instance;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
  return _construct.apply(null, arguments);
}
module.exports = _construct, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 9728:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var toPropertyKey = __webpack_require__(4062);
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 4704:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var unsupportedIterableToArray = __webpack_require__(6116);
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      var F = function F() {};
      return {
        s: F,
        n: function n() {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function e(_e) {
          throw _e;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true,
    didErr = false,
    err;
  return {
    s: function s() {
      it = it.call(o);
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e2) {
      didErr = true;
      err = _e2;
    },
    f: function f() {
      try {
        if (!normalCompletion && it["return"] != null) it["return"]();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}
module.exports = _createForOfIteratorHelper, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 6389:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var getPrototypeOf = __webpack_require__(3808);
var isNativeReflectConstruct = __webpack_require__(9617);
var possibleConstructorReturn = __webpack_require__(4993);
function _createSuper(Derived) {
  var hasNativeReflectConstruct = isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = getPrototypeOf(Derived),
      result;
    if (hasNativeReflectConstruct) {
      var NewTarget = getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return possibleConstructorReturn(this, result);
  };
}
module.exports = _createSuper, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 8416:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var toPropertyKey = __webpack_require__(4062);
function _defineProperty(obj, key, value) {
  key = toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 3808:
/***/ (function(module) {

function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _getPrototypeOf(o);
}
module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 1655:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var setPrototypeOf = __webpack_require__(6015);
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}
module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 6035:
/***/ (function(module) {

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
module.exports = _isNativeFunction, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 9617:
/***/ (function(module) {

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}
module.exports = _isNativeReflectConstruct, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 9498:
/***/ (function(module) {

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
module.exports = _iterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 2281:
/***/ (function(module) {

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
module.exports = _nonIterableSpread, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 2122:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var defineProperty = __webpack_require__(8416);
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
module.exports = _objectSpread2, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 4993:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _typeof = (__webpack_require__(8698)["default"]);
var assertThisInitialized = __webpack_require__(6115);
function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return assertThisInitialized(self);
}
module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 7061:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _typeof = (__webpack_require__(8698)["default"]);
function _regeneratorRuntime() {
  "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
    return exports;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  var exports = {},
    Op = Object.prototype,
    hasOwn = Op.hasOwnProperty,
    defineProperty = Object.defineProperty || function (obj, key, desc) {
      obj[key] = desc.value;
    },
    $Symbol = "function" == typeof Symbol ? Symbol : {},
    iteratorSymbol = $Symbol.iterator || "@@iterator",
    asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
    toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value: value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function define(obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
      generator = Object.create(protoGenerator.prototype),
      context = new Context(tryLocsList || []);
    return defineProperty(generator, "_invoke", {
      value: makeInvokeMethod(innerFn, self, context)
    }), generator;
  }
  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf,
    NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if ("throw" !== record.type) {
        var result = record.arg,
          value = result.value;
        return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function (error) {
          return invoke("throw", error, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    defineProperty(this, "_invoke", {
      value: function value(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(innerFn, self, context) {
    var state = "suspendedStart";
    return function (method, arg) {
      if ("executing" === state) throw new Error("Generator is already running");
      if ("completed" === state) {
        if ("throw" === method) throw arg;
        return doneResult();
      }
      for (context.method = method, context.arg = arg;;) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
          if ("suspendedStart" === state) throw state = "completed", context.arg;
          context.dispatchException(context.arg);
        } else "return" === context.method && context.abrupt("return", context.arg);
        state = "executing";
        var record = tryCatch(innerFn, self, context);
        if ("normal" === record.type) {
          if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
          return {
            value: record.arg,
            done: context.done
          };
        }
        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method,
      method = delegate.iterator[methodName];
    if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) return iteratorMethod.call(iterable);
      if ("function" == typeof iterable.next) return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1,
          next = function next() {
            for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
            return next.value = undefined, next.done = !0, next;
          };
        return next.next = next;
      }
    }
    return {
      next: doneResult
    };
  }
  function doneResult() {
    return {
      value: undefined,
      done: !0
    };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), defineProperty(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function (genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function (arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
    return this;
  }), define(Gp, "toString", function () {
    return "[object Generator]";
  }), exports.keys = function (val) {
    var object = Object(val),
      keys = [];
    for (var key in object) keys.push(key);
    return keys.reverse(), function next() {
      for (; keys.length;) {
        var key = keys.pop();
        if (key in object) return next.value = key, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
    },
    stop: function stop() {
      this.done = !0;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type) throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(exception) {
      if (this.done) throw exception;
      var context = this;
      function handle(loc, caught) {
        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
      }
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i],
          record = entry.completion;
        if ("root" === entry.tryLoc) return handle("end");
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc"),
            hasFinally = hasOwn.call(entry, "finallyLoc");
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
          } else {
            if (!hasFinally) throw new Error("try statement without catch or finally");
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
      var record = finallyEntry ? finallyEntry.completion : {};
      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
    },
    complete: function complete(record, afterLoc) {
      if ("throw" === record.type) throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if ("throw" === record.type) {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
    }
  }, exports;
}
module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 6015:
/***/ (function(module) {

function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _setPrototypeOf(o, p);
}
module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 861:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var arrayWithoutHoles = __webpack_require__(3405);
var iterableToArray = __webpack_require__(9498);
var unsupportedIterableToArray = __webpack_require__(6116);
var nonIterableSpread = __webpack_require__(2281);
function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}
module.exports = _toConsumableArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 5036:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _typeof = (__webpack_require__(8698)["default"]);
function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
module.exports = _toPrimitive, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 4062:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _typeof = (__webpack_require__(8698)["default"]);
var toPrimitive = __webpack_require__(5036);
function _toPropertyKey(arg) {
  var key = toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}
module.exports = _toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 8698:
/***/ (function(module) {

function _typeof(obj) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(obj);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 6116:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var arrayLikeToArray = __webpack_require__(3897);
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}
module.exports = _unsupportedIterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 8186:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var AsyncGenerator = __webpack_require__(4642);
function _wrapAsyncGenerator(fn) {
  return function () {
    return new AsyncGenerator(fn.apply(this, arguments));
  };
}
module.exports = _wrapAsyncGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 3496:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var getPrototypeOf = __webpack_require__(3808);
var setPrototypeOf = __webpack_require__(6015);
var isNativeFunction = __webpack_require__(6035);
var construct = __webpack_require__(3515);
function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;
  module.exports = _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !isNativeFunction(Class)) return Class;
    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);
      _cache.set(Class, Wrapper);
    }
    function Wrapper() {
      return construct(Class, arguments, getPrototypeOf(this).constructor);
    }
    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return setPrototypeOf(Wrapper, Class);
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _wrapNativeSuper(Class);
}
module.exports = _wrapNativeSuper, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/typeof.js
function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/toPrimitive.js

function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js


function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/createClass.js

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/inherits.js

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js


function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/createSuper.js



function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
      result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}
// EXTERNAL MODULE: ./node_modules/readable-stream/lib/ours/browser.js
var browser = __webpack_require__(3284);
;// CONCATENATED MODULE: ./src/Scripts/stream.js
function isValidStreamMessage(message){return Object.entries(message).length>0&&Boolean(message.data)&&(typeof message.data==="number"||typeof message.data==="object"||typeof message.data==="string");}var noop=function noop(){return undefined;};var SYN="SYN";var ACK="ACK";/**
 * Abstract base class for postMessage streams.
 */var BasePostMessageStream=/*#__PURE__*/function(_Duplex){_inherits(BasePostMessageStream,_Duplex);var _super=_createSuper(BasePostMessageStream);function BasePostMessageStream(){var _this;_classCallCheck(this,BasePostMessageStream);_this=_super.call(this,{objectMode:true});// Initialization flags
_this._init=false;_this._haveSyn=false;return _this;}/**
   * Must be called at end of child constructor to initiate
   * communication with other end.
   */_createClass(BasePostMessageStream,[{key:"_handshake",value:function _handshake(){// Send synchronization message
this._write(SYN,null,noop);this.cork();}},{key:"_onData",value:function _onData(data){if(this._init){// Forward message
try{this.push(data);}catch(err){this.emit("error",err);}}else if(data===SYN){// Listen for handshake
this._haveSyn=true;this._write(ACK,null,noop);}else if(data===ACK){this._init=true;if(!this._haveSyn){this._write(ACK,null,noop);}this.uncork();}}/**
   * Child classes must implement this function.
   */},{key:"_read",value:function _read(){return undefined;}},{key:"_write",value:function _write(data,_encoding,cb){this._postMessage(data);cb();}}]);return BasePostMessageStream;}(browser.Duplex);var WindowPostMessageStream=/*#__PURE__*/function(_BasePostMessageStrea){_inherits(WindowPostMessageStream,_BasePostMessageStrea);var _super2=_createSuper(WindowPostMessageStream);/**
   * Creates a stream for communicating with other streams across the same or
   * different `window` objects.
   *
   * @param args - Options bag.
   * @param args.name - The name of the stream. Used to differentiate between
   * multiple streams sharing the same window object.
   * @param args.target - The name of the stream to exchange messages with.
   * @param args.targetOrigin - The origin of the target. Defaults to
   * `location.origin`, '*' is permitted.
   * @param args.targetWindow - The window object of the target stream. Defaults
   * to `window`.
   */function WindowPostMessageStream(_ref){var _this2;var name=_ref.name,target=_ref.target,_ref$targetOrigin=_ref.targetOrigin,targetOrigin=_ref$targetOrigin===void 0?window.location.origin:_ref$targetOrigin,_ref$targetWindow=_ref.targetWindow,targetWindow=_ref$targetWindow===void 0?window:_ref$targetWindow;_classCallCheck(this,WindowPostMessageStream);_this2=_super2.call(this);if(typeof window==="undefined"||typeof window.postMessage!=="function"){throw new Error("window.postMessage is not a function. This class should only be instantiated in a Window.");}_this2._name=name;_this2._target=target;_this2._targetOrigin=targetOrigin;_this2._targetWindow=targetWindow;_this2._onMessage=_this2._onMessage.bind(_assertThisInitialized(_this2));window.addEventListener("message",_this2._onMessage,false);_this2._handshake();return _this2;}_createClass(WindowPostMessageStream,[{key:"_postMessage",value:function _postMessage(data){this._targetWindow.postMessage({target:this._target,data:data},this._targetOrigin);}},{key:"_onMessage",value:function _onMessage(event){var message=event.data;if(this._targetOrigin!=="*"&&event.origin!==this._targetOrigin||event.source!==this._targetWindow||!isValidStreamMessage(message)||message.target!==this._name){return;}this._onData(message.data);}},{key:"_destroy",value:function _destroy(){window.removeEventListener("message",this._onMessage,false);}}]);return WindowPostMessageStream;}(BasePostMessageStream);
;// CONCATENATED MODULE: ./src/Scripts/constants.js
var CONTENT_SCRIPT="fire-contentscript";var INPAGE="fire-inpage";var BACKGROUND="fire-background";var counter=0;function getId(){return"5IRE.".concat(Date.now(),".").concat(++counter);}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/regeneratorRuntime.js

function _regeneratorRuntime() {
  "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
  _regeneratorRuntime = function _regeneratorRuntime() {
    return exports;
  };
  var exports = {},
    Op = Object.prototype,
    hasOwn = Op.hasOwnProperty,
    defineProperty = Object.defineProperty || function (obj, key, desc) {
      obj[key] = desc.value;
    },
    $Symbol = "function" == typeof Symbol ? Symbol : {},
    iteratorSymbol = $Symbol.iterator || "@@iterator",
    asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
    toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value: value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function define(obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
      generator = Object.create(protoGenerator.prototype),
      context = new Context(tryLocsList || []);
    return defineProperty(generator, "_invoke", {
      value: makeInvokeMethod(innerFn, self, context)
    }), generator;
  }
  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf,
    NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if ("throw" !== record.type) {
        var result = record.arg,
          value = result.value;
        return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function (error) {
          return invoke("throw", error, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    defineProperty(this, "_invoke", {
      value: function value(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(innerFn, self, context) {
    var state = "suspendedStart";
    return function (method, arg) {
      if ("executing" === state) throw new Error("Generator is already running");
      if ("completed" === state) {
        if ("throw" === method) throw arg;
        return doneResult();
      }
      for (context.method = method, context.arg = arg;;) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
          if ("suspendedStart" === state) throw state = "completed", context.arg;
          context.dispatchException(context.arg);
        } else "return" === context.method && context.abrupt("return", context.arg);
        state = "executing";
        var record = tryCatch(innerFn, self, context);
        if ("normal" === record.type) {
          if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
          return {
            value: record.arg,
            done: context.done
          };
        }
        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method,
      method = delegate.iterator[methodName];
    if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) return iteratorMethod.call(iterable);
      if ("function" == typeof iterable.next) return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1,
          next = function next() {
            for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
            return next.value = undefined, next.done = !0, next;
          };
        return next.next = next;
      }
    }
    return {
      next: doneResult
    };
  }
  function doneResult() {
    return {
      value: undefined,
      done: !0
    };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), defineProperty(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function (genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function (arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
    return this;
  }), define(Gp, "toString", function () {
    return "[object Generator]";
  }), exports.keys = function (val) {
    var object = Object(val),
      keys = [];
    for (var key in object) keys.push(key);
    return keys.reverse(), function next() {
      for (; keys.length;) {
        var key = keys.pop();
        if (key in object) return next.value = key, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
    },
    stop: function stop() {
      this.done = !0;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type) throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(exception) {
      if (this.done) throw exception;
      var context = this;
      function handle(loc, caught) {
        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
      }
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i],
          record = entry.completion;
        if ("root" === entry.tryLoc) return handle("end");
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc"),
            hasFinally = hasOwn.call(entry, "finallyLoc");
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
          } else {
            if (!hasFinally) throw new Error("try statement without catch or finally");
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
      var record = finallyEntry ? finallyEntry.completion : {};
      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
    },
    complete: function complete(record, afterLoc) {
      if ("throw" === record.type) throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if ("throw" === record.type) {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
    }
  }, exports;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js




function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
;// CONCATENATED MODULE: ./src/Scripts/5ire-Provider.js
//stream for in-window communication
var injectedStream=new WindowPostMessageStream({name:INPAGE,target:CONTENT_SCRIPT});/*
Custom Web3 provider for interacting with the 5ire browser extension and pass to
5ire extension to handle the json-rpc request and send the response back
*/var FireProvider=/*#__PURE__*/function(){function FireProvider(){var httpHost=arguments.length>0&&arguments[0]!==undefined?arguments[0]:"https://rpc-testnet.5ire.network";_classCallCheck(this,FireProvider);this.httpHost=httpHost;this.selectedAddress=null;this.chainId="0x3e5";this.networkVersion=997;this.version="1.0.0";this.is5ire=true;this.connected=true;//for handling the different Promise handlers
this.handlers={};this.isOpen=false;this.conntectMethods=["eth_requestAccounts","eth_accounts","connect"];this.restricted=["get_endPoint","eth_sendTransaction"].concat(_toConsumableArray(this.conntectMethods));//inject the endpoint
this.injectHttpProvider();}_createClass(FireProvider,[{key:"connect",value:function connect(){return this.passReq("connect",null);}//for sending some payload with json rpc request
},{key:"send",value:function(){var _send=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(method,payload){return _regeneratorRuntime().wrap(function _callee$(_context){while(1)switch(_context.prev=_context.next){case 0:return _context.abrupt("return",this.passReq(method,payload));case 1:case"end":return _context.stop();}},_callee,this);}));function send(_x,_x2){return _send.apply(this,arguments);}return send;}()//passing callback for async operations
},{key:"sendAsync",value:function sendAsync(payload,cb){this.passReq(payload).then(function(res){return cb(res,null);}).catch(function(err){return cb(null,err);});}//requesting some data from chain
},{key:"request",value:function(){var _request=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(method,payload){return _regeneratorRuntime().wrap(function _callee2$(_context2){while(1)switch(_context2.prev=_context2.next){case 0:_context2.next=2;return this.passReq(method,payload);case 2:return _context2.abrupt("return",_context2.sent);case 3:case"end":return _context2.stop();}},_callee2,this);}));function request(_x3,_x4){return _request.apply(this,arguments);}return request;}()//for checking JSON-RPC headers
},{key:"passReq",value:function(){var _passReq=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(method,payload){var isObject,res;return _regeneratorRuntime().wrap(function _callee3$(_context3){while(1)switch(_context3.prev=_context3.next){case 0:if(!(method===undefined&&method.trim()==="")){_context3.next=2;break;}return _context3.abrupt("return",Error("invalid method"));case 2://pass the request to extension
isObject=typeof method==="object"&&method!==undefined;_context3.next=5;return this.sendJsonRpc(isObject?method.method:method,!payload&&isObject?method.params:payload);case 5:res=_context3.sent;return _context3.abrupt("return",res);case 7:case"end":return _context3.stop();}},_callee3,this);}));function passReq(_x5,_x6){return _passReq.apply(this,arguments);}return passReq;}()//inject the http endpoint for specfic network
},{key:"injectHttpProvider",value:function(){var _injectHttpProvider=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(){var res;return _regeneratorRuntime().wrap(function _callee4$(_context4){while(1)switch(_context4.prev=_context4.next){case 0:_context4.next=2;return this.passReq("get_endPoint",null);case 2:res=_context4.sent;if(res)this.httpHost=res.result;case 4:case"end":return _context4.stop();}},_callee4,this);}));function injectHttpProvider(){return _injectHttpProvider.apply(this,arguments);}return injectHttpProvider;}()//inject accounts into provider
},{key:"injectSelectedAccount",value:function injectSelectedAccount(res){var _res$result;if(res!==null&&res!==void 0&&res.result&&res!==null&&res!==void 0&&(_res$result=res.result)!==null&&_res$result!==void 0&&_res$result.length)this.selectedAddress=res.result[0];else if(!(res!==null&&res!==void 0&&res.result))this.selectedAddress=null;}//pass request to extension for processing the jsonrpc request
//if request is not related to connection and transaction processing
//then it is processed in inject content script in current webpage
},{key:"sendJsonRpc",value:function sendJsonRpc(method){var _message,_message$,_this=this;var message=arguments.length>1&&arguments[1]!==undefined?arguments[1]:[];var isCb=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;var cb=arguments.length>3&&arguments[3]!==undefined?arguments[3]:null;var isFull=arguments.length>4&&arguments[4]!==undefined?arguments[4]:false;//false the isOpen so we can proceded with requested connection
if((_message=message)!==null&&_message!==void 0&&_message.length&&(_message$=message[0])!==null&&_message$!==void 0&&_message$.isRequested){this.isOpen=false;}return new Promise(/*#__PURE__*/function(){var _ref=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(resolve,reject){var _window,origin,_this$httpHost,_this$httpHost2,rawResponse,content,id,transportRequestMessage;return _regeneratorRuntime().wrap(function _callee5$(_context5){while(1)switch(_context5.prev=_context5.next){case 0:_context5.prev=0;origin=(_window=window)===null||_window===void 0?void 0:_window.location.origin;// console.log("Method and Message: ", method, message);
// if (method === "net_version") {
//   return resolve({ result: 0x3e5, method });
// }
if(!(_this.restricted.indexOf(method)<0)){_context5.next=16;break;}_context5.next=5;return fetch((_this$httpHost=_this.httpHost)!==null&&_this$httpHost!==void 0&&_this$httpHost.includes("http://")||(_this$httpHost2=_this.httpHost)!==null&&_this$httpHost2!==void 0&&_this$httpHost2.includes("https://")?_this.httpHost:"https://rpc-testnet.5ire.network",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:method,params:message})});case 5:rawResponse=_context5.sent;_context5.next=8;return rawResponse.json();case 8:content=_context5.sent;if(!content.error){_context5.next=14;break;}isCb&&cb(content);return _context5.abrupt("return",reject(content));case 14:isCb&&cb(isFull?content:content.result);return _context5.abrupt("return",resolve(isFull?content:content.result));case 16:if(!(method==="eth_requestAccounts"||method==="eth_accounts"||method==='connect')){_context5.next=23;break;}if(!_this.isOpen){_context5.next=21;break;}return _context5.abrupt("return",resolve([]));case 21:message={origin:origin,method:method};_this.isOpen=true;case 23://get a unique if for specfic handler
id=getId();_this.handlers[id]={reject:reject,resolve:resolve,id:id,isCb:isCb,cb:cb,isFull:isFull,method:method,origin:origin};if(method==="eth_requestAccounts"||method==="eth_accounts"){message.origin=origin;}transportRequestMessage={id:id,message:message,origin:INPAGE,method:method};injectedStream.write(transportRequestMessage);_context5.next=33;break;case 30:_context5.prev=30;_context5.t0=_context5["catch"](0);// console.log("error in calling this method: ", method, message);
// console.log("Error in handle json-rpc request handler in injected section: ", err);
reject(_context5.t0);case 33:case"end":return _context5.stop();}},_callee5,null,[[0,30]]);}));return function(_x7,_x8){return _ref.apply(this,arguments);};}());}}]);return FireProvider;}();
;// CONCATENATED MODULE: ./src/Scripts/injected.js
var injected_injectedStream=new WindowPostMessageStream({name:INPAGE,target:CONTENT_SCRIPT});injected_injectedStream.write({method:"keepAlive"});/**
 * inject the fire provider into current active webpage
 */var fireProvider=new FireProvider();window.fire=fireProvider;//data streams from injected script throught the window messaging api
injected_injectedStream.on("data",function(data){if((data===null||data===void 0?void 0:data.method)==="keepAlive"){setTimeout(function(){injected_injectedStream.write({method:"keepAlive"});},1000*30);}//here receive the data from extension
// console.log("Here is response from extension: ", data);
//get specfic handler using id and resolve or reject it
if(data.id){var handler=fireProvider.handlers[data.id];if(fireProvider.conntectMethods.indexOf(handler===null||handler===void 0?void 0:handler.method)>-1){setTimeout(function(){fireProvider.isOpen=false;},2000);}//check if the message is related to error
if(data.error){(handler===null||handler===void 0?void 0:handler.isCb)&&handler.cb(data.error);handler===null||handler===void 0?void 0:handler.reject(data.error);}else{if(handler!==null&&handler!==void 0&&handler.isFull){var res={jsonrpc:"2.0",method:handler.method,result:data.response};(handler===null||handler===void 0?void 0:handler.isCb)&&handler.cb(res);handler===null||handler===void 0?void 0:handler.resolve(res);}else if(fireProvider.conntectMethods.find(function(item){var _data$response;return item===(data===null||data===void 0?void 0:(_data$response=data.response)===null||_data$response===void 0?void 0:_data$response.method);})){fireProvider.injectSelectedAccount(data.response);handler===null||handler===void 0?void 0:handler.resolve(data.response.result);}else{(handler===null||handler===void 0?void 0:handler.isCb)&&handler.cb(data.response);handler===null||handler===void 0?void 0:handler.resolve(data.response);}}delete fireProvider.handlers[data.id];}});
}();
/******/ })()
;