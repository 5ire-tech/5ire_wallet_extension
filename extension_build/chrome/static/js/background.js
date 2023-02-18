/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2737:
/***/ (function(module) {

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
  funcTag = '[object Function]',
  genTag = '[object GeneratorFunction]';

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
    result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];
  var length = result.length,
    skipIndexes = !!length;
  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
    object[key] = value;
  }
}

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
    result = [];
  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function () {
    var args = arguments,
      index = -1,
      length = nativeMax(args.length - start, 0),
      array = Array(length);
    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});
  var index = -1,
    length = props.length;
  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function (object, sources) {
    var index = -1,
      length = sources.length,
      customizer = length > 1 ? sources[length - 1] : undefined,
      guard = length > 2 ? sources[2] : undefined;
    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
    proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;
  return value === proto;
}

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || value !== value && other !== other;
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') && (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * This method is like `_.assign` except that it iterates over own and
 * inherited source properties.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @alias extend
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assign
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assignIn({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }
 */
var assignIn = createAssigner(function (object, source) {
  copyObject(source, keysIn(source), object);
});

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}
module.exports = assignIn;

/***/ }),

/***/ 6748:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

!function (e, t) {
   true ? t(exports) : 0;
}(this, function (e) {
  "use strict";

  function t(e, t) {
    e.super_ = t, e.prototype = Object.create(t.prototype, {
      constructor: {
        value: e,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    });
  }
  function r(e, t) {
    Object.defineProperty(this, "kind", {
      value: e,
      enumerable: !0
    }), t && t.length && Object.defineProperty(this, "path", {
      value: t,
      enumerable: !0
    });
  }
  function n(e, t, r) {
    n.super_.call(this, "E", e), Object.defineProperty(this, "lhs", {
      value: t,
      enumerable: !0
    }), Object.defineProperty(this, "rhs", {
      value: r,
      enumerable: !0
    });
  }
  function o(e, t) {
    o.super_.call(this, "N", e), Object.defineProperty(this, "rhs", {
      value: t,
      enumerable: !0
    });
  }
  function i(e, t) {
    i.super_.call(this, "D", e), Object.defineProperty(this, "lhs", {
      value: t,
      enumerable: !0
    });
  }
  function a(e, t, r) {
    a.super_.call(this, "A", e), Object.defineProperty(this, "index", {
      value: t,
      enumerable: !0
    }), Object.defineProperty(this, "item", {
      value: r,
      enumerable: !0
    });
  }
  function f(e, t, r) {
    var n = e.slice((r || t) + 1 || e.length);
    return e.length = t < 0 ? e.length + t : t, e.push.apply(e, n), e;
  }
  function u(e) {
    var t = "undefined" == typeof e ? "undefined" : N(e);
    return "object" !== t ? t : e === Math ? "math" : null === e ? "null" : Array.isArray(e) ? "array" : "[object Date]" === Object.prototype.toString.call(e) ? "date" : "function" == typeof e.toString && /^\/.*\//.test(e.toString()) ? "regexp" : "object";
  }
  function l(e, t, r, c, s, d, p) {
    s = s || [], p = p || [];
    var g = s.slice(0);
    if ("undefined" != typeof d) {
      if (c) {
        if ("function" == typeof c && c(g, d)) return;
        if ("object" === ("undefined" == typeof c ? "undefined" : N(c))) {
          if (c.prefilter && c.prefilter(g, d)) return;
          if (c.normalize) {
            var h = c.normalize(g, d, e, t);
            h && (e = h[0], t = h[1]);
          }
        }
      }
      g.push(d);
    }
    "regexp" === u(e) && "regexp" === u(t) && (e = e.toString(), t = t.toString());
    var y = "undefined" == typeof e ? "undefined" : N(e),
      v = "undefined" == typeof t ? "undefined" : N(t),
      b = "undefined" !== y || p && p[p.length - 1].lhs && p[p.length - 1].lhs.hasOwnProperty(d),
      m = "undefined" !== v || p && p[p.length - 1].rhs && p[p.length - 1].rhs.hasOwnProperty(d);
    if (!b && m) r(new o(g, t));else if (!m && b) r(new i(g, e));else if (u(e) !== u(t)) r(new n(g, e, t));else if ("date" === u(e) && e - t !== 0) r(new n(g, e, t));else if ("object" === y && null !== e && null !== t) {
      if (p.filter(function (t) {
        return t.lhs === e;
      }).length) e !== t && r(new n(g, e, t));else {
        if (p.push({
          lhs: e,
          rhs: t
        }), Array.isArray(e)) {
          var w;
          e.length;
          for (w = 0; w < e.length; w++) w >= t.length ? r(new a(g, w, new i(void 0, e[w]))) : l(e[w], t[w], r, c, g, w, p);
          for (; w < t.length;) r(new a(g, w, new o(void 0, t[w++])));
        } else {
          var x = Object.keys(e),
            S = Object.keys(t);
          x.forEach(function (n, o) {
            var i = S.indexOf(n);
            i >= 0 ? (l(e[n], t[n], r, c, g, n, p), S = f(S, i)) : l(e[n], void 0, r, c, g, n, p);
          }), S.forEach(function (e) {
            l(void 0, t[e], r, c, g, e, p);
          });
        }
        p.length = p.length - 1;
      }
    } else e !== t && ("number" === y && isNaN(e) && isNaN(t) || r(new n(g, e, t)));
  }
  function c(e, t, r, n) {
    return n = n || [], l(e, t, function (e) {
      e && n.push(e);
    }, r), n.length ? n : void 0;
  }
  function s(e, t, r) {
    if (r.path && r.path.length) {
      var n,
        o = e[t],
        i = r.path.length - 1;
      for (n = 0; n < i; n++) o = o[r.path[n]];
      switch (r.kind) {
        case "A":
          s(o[r.path[n]], r.index, r.item);
          break;
        case "D":
          delete o[r.path[n]];
          break;
        case "E":
        case "N":
          o[r.path[n]] = r.rhs;
      }
    } else switch (r.kind) {
      case "A":
        s(e[t], r.index, r.item);
        break;
      case "D":
        e = f(e, t);
        break;
      case "E":
      case "N":
        e[t] = r.rhs;
    }
    return e;
  }
  function d(e, t, r) {
    if (e && t && r && r.kind) {
      for (var n = e, o = -1, i = r.path ? r.path.length - 1 : 0; ++o < i;) "undefined" == typeof n[r.path[o]] && (n[r.path[o]] = "number" == typeof r.path[o] ? [] : {}), n = n[r.path[o]];
      switch (r.kind) {
        case "A":
          s(r.path ? n[r.path[o]] : n, r.index, r.item);
          break;
        case "D":
          delete n[r.path[o]];
          break;
        case "E":
        case "N":
          n[r.path[o]] = r.rhs;
      }
    }
  }
  function p(e, t, r) {
    if (r.path && r.path.length) {
      var n,
        o = e[t],
        i = r.path.length - 1;
      for (n = 0; n < i; n++) o = o[r.path[n]];
      switch (r.kind) {
        case "A":
          p(o[r.path[n]], r.index, r.item);
          break;
        case "D":
          o[r.path[n]] = r.lhs;
          break;
        case "E":
          o[r.path[n]] = r.lhs;
          break;
        case "N":
          delete o[r.path[n]];
      }
    } else switch (r.kind) {
      case "A":
        p(e[t], r.index, r.item);
        break;
      case "D":
        e[t] = r.lhs;
        break;
      case "E":
        e[t] = r.lhs;
        break;
      case "N":
        e = f(e, t);
    }
    return e;
  }
  function g(e, t, r) {
    if (e && t && r && r.kind) {
      var n,
        o,
        i = e;
      for (o = r.path.length - 1, n = 0; n < o; n++) "undefined" == typeof i[r.path[n]] && (i[r.path[n]] = {}), i = i[r.path[n]];
      switch (r.kind) {
        case "A":
          p(i[r.path[n]], r.index, r.item);
          break;
        case "D":
          i[r.path[n]] = r.lhs;
          break;
        case "E":
          i[r.path[n]] = r.lhs;
          break;
        case "N":
          delete i[r.path[n]];
      }
    }
  }
  function h(e, t, r) {
    if (e && t) {
      var n = function n(_n) {
        r && !r(e, t, _n) || d(e, t, _n);
      };
      l(e, t, n);
    }
  }
  function y(e) {
    return "color: " + F[e].color + "; font-weight: bold";
  }
  function v(e) {
    var t = e.kind,
      r = e.path,
      n = e.lhs,
      o = e.rhs,
      i = e.index,
      a = e.item;
    switch (t) {
      case "E":
        return [r.join("."), n, "→", o];
      case "N":
        return [r.join("."), o];
      case "D":
        return [r.join(".")];
      case "A":
        return [r.join(".") + "[" + i + "]", a];
      default:
        return [];
    }
  }
  function b(e, t, r, n) {
    var o = c(e, t);
    try {
      n ? r.groupCollapsed("diff") : r.group("diff");
    } catch (e) {
      r.log("diff");
    }
    o ? o.forEach(function (e) {
      var t = e.kind,
        n = v(e);
      r.log.apply(r, ["%c " + F[t].text, y(t)].concat(P(n)));
    }) : r.log("—— no diff ——");
    try {
      r.groupEnd();
    } catch (e) {
      r.log("—— diff end —— ");
    }
  }
  function m(e, t, r, n) {
    switch ("undefined" == typeof e ? "undefined" : N(e)) {
      case "object":
        return "function" == typeof e[n] ? e[n].apply(e, P(r)) : e[n];
      case "function":
        return e(t);
      default:
        return e;
    }
  }
  function w(e) {
    var t = e.timestamp,
      r = e.duration;
    return function (e, n, o) {
      var i = ["action"];
      return i.push("%c" + String(e.type)), t && i.push("%c@ " + n), r && i.push("%c(in " + o.toFixed(2) + " ms)"), i.join(" ");
    };
  }
  function x(e, t) {
    var r = t.logger,
      n = t.actionTransformer,
      o = t.titleFormatter,
      i = void 0 === o ? w(t) : o,
      a = t.collapsed,
      f = t.colors,
      u = t.level,
      l = t.diff,
      c = "undefined" == typeof t.titleFormatter;
    e.forEach(function (o, s) {
      var d = o.started,
        p = o.startedTime,
        g = o.action,
        h = o.prevState,
        y = o.error,
        v = o.took,
        w = o.nextState,
        x = e[s + 1];
      x && (w = x.prevState, v = x.started - d);
      var S = n(g),
        k = "function" == typeof a ? a(function () {
          return w;
        }, g, o) : a,
        j = D(p),
        E = f.title ? "color: " + f.title(S) + ";" : "",
        A = ["color: gray; font-weight: lighter;"];
      A.push(E), t.timestamp && A.push("color: gray; font-weight: lighter;"), t.duration && A.push("color: gray; font-weight: lighter;");
      var O = i(S, j, v);
      try {
        k ? f.title && c ? r.groupCollapsed.apply(r, ["%c " + O].concat(A)) : r.groupCollapsed(O) : f.title && c ? r.group.apply(r, ["%c " + O].concat(A)) : r.group(O);
      } catch (e) {
        r.log(O);
      }
      var N = m(u, S, [h], "prevState"),
        P = m(u, S, [S], "action"),
        C = m(u, S, [y, h], "error"),
        F = m(u, S, [w], "nextState");
      if (N) if (f.prevState) {
        var L = "color: " + f.prevState(h) + "; font-weight: bold";
        r[N]("%c prev state", L, h);
      } else r[N]("prev state", h);
      if (P) if (f.action) {
        var T = "color: " + f.action(S) + "; font-weight: bold";
        r[P]("%c action    ", T, S);
      } else r[P]("action    ", S);
      if (y && C) if (f.error) {
        var M = "color: " + f.error(y, h) + "; font-weight: bold;";
        r[C]("%c error     ", M, y);
      } else r[C]("error     ", y);
      if (F) if (f.nextState) {
        var _ = "color: " + f.nextState(w) + "; font-weight: bold";
        r[F]("%c next state", _, w);
      } else r[F]("next state", w);
      l && b(h, w, r, k);
      try {
        r.groupEnd();
      } catch (e) {
        r.log("—— log end ——");
      }
    });
  }
  function S() {
    var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      t = Object.assign({}, L, e),
      r = t.logger,
      n = t.stateTransformer,
      o = t.errorTransformer,
      i = t.predicate,
      a = t.logErrors,
      f = t.diffPredicate;
    if ("undefined" == typeof r) return function () {
      return function (e) {
        return function (t) {
          return e(t);
        };
      };
    };
    if (e.getState && e.dispatch) return console.error("[redux-logger] redux-logger not installed. Make sure to pass logger instance as middleware:\n// Logger with default options\nimport { logger } from 'redux-logger'\nconst store = createStore(\n  reducer,\n  applyMiddleware(logger)\n)\n// Or you can create your own logger with custom options http://bit.ly/redux-logger-options\nimport createLogger from 'redux-logger'\nconst logger = createLogger({\n  // ...options\n});\nconst store = createStore(\n  reducer,\n  applyMiddleware(logger)\n)\n"), function () {
      return function (e) {
        return function (t) {
          return e(t);
        };
      };
    };
    var u = [];
    return function (e) {
      var r = e.getState;
      return function (e) {
        return function (l) {
          if ("function" == typeof i && !i(r, l)) return e(l);
          var c = {};
          u.push(c), c.started = O.now(), c.startedTime = new Date(), c.prevState = n(r()), c.action = l;
          var s = void 0;
          if (a) try {
            s = e(l);
          } catch (e) {
            c.error = o(e);
          } else s = e(l);
          c.took = O.now() - c.started, c.nextState = n(r());
          var d = t.diff && "function" == typeof f ? f(r, l) : t.diff;
          if (x(u, Object.assign({}, t, {
            diff: d
          })), u.length = 0, c.error) throw c.error;
          return s;
        };
      };
    };
  }
  var k,
    j,
    E = function E(e, t) {
      return new Array(t + 1).join(e);
    },
    A = function A(e, t) {
      return E("0", t - e.toString().length) + e;
    },
    D = function D(e) {
      return A(e.getHours(), 2) + ":" + A(e.getMinutes(), 2) + ":" + A(e.getSeconds(), 2) + "." + A(e.getMilliseconds(), 3);
    },
    O = "undefined" != typeof performance && null !== performance && "function" == typeof performance.now ? performance : Date,
    N = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
      return typeof e;
    } : function (e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
    },
    P = function P(e) {
      if (Array.isArray(e)) {
        for (var t = 0, r = Array(e.length); t < e.length; t++) r[t] = e[t];
        return r;
      }
      return Array.from(e);
    },
    C = [];
  k = "object" === ("undefined" == typeof __webpack_require__.g ? "undefined" : N(__webpack_require__.g)) && __webpack_require__.g ? __webpack_require__.g : "undefined" != typeof window ? window : {}, j = k.DeepDiff, j && C.push(function () {
    "undefined" != typeof j && k.DeepDiff === c && (k.DeepDiff = j, j = void 0);
  }), t(n, r), t(o, r), t(i, r), t(a, r), Object.defineProperties(c, {
    diff: {
      value: c,
      enumerable: !0
    },
    observableDiff: {
      value: l,
      enumerable: !0
    },
    applyDiff: {
      value: h,
      enumerable: !0
    },
    applyChange: {
      value: d,
      enumerable: !0
    },
    revertChange: {
      value: g,
      enumerable: !0
    },
    isConflict: {
      value: function value() {
        return "undefined" != typeof j;
      },
      enumerable: !0
    },
    noConflict: {
      value: function value() {
        return C && (C.forEach(function (e) {
          e();
        }), C = null), c;
      },
      enumerable: !0
    }
  });
  var F = {
      E: {
        color: "#2196F3",
        text: "CHANGED:"
      },
      N: {
        color: "#4CAF50",
        text: "ADDED:"
      },
      D: {
        color: "#F44336",
        text: "DELETED:"
      },
      A: {
        color: "#2196F3",
        text: "ARRAY:"
      }
    },
    L = {
      level: "log",
      logger: console,
      logErrors: !0,
      collapsed: void 0,
      predicate: void 0,
      duration: !1,
      timestamp: !0,
      stateTransformer: function stateTransformer(e) {
        return e;
      },
      actionTransformer: function actionTransformer(e) {
        return e;
      },
      errorTransformer: function errorTransformer(e) {
        return e;
      },
      colors: {
        title: function title() {
          return "inherit";
        },
        prevState: function prevState() {
          return "#9E9E9E";
        },
        action: function action() {
          return "#03A9F4";
        },
        nextState: function nextState() {
          return "#4CAF50";
        },
        error: function error() {
          return "#F20404";
        }
      },
      diff: !1,
      diffPredicate: void 0,
      transformer: void 0
    },
    T = function T() {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        t = e.dispatch,
        r = e.getState;
      return "function" == typeof t || "function" == typeof r ? S()({
        dispatch: t,
        getState: r
      }) : void console.error("\n[redux-logger v3] BREAKING CHANGE\n[redux-logger v3] Since 3.0.0 redux-logger exports by default logger with default settings.\n[redux-logger v3] Change\n[redux-logger v3] import createLogger from 'redux-logger'\n[redux-logger v3] to\n[redux-logger v3] import { createLogger } from 'redux-logger'\n");
    };
  e.defaults = L, e.createLogger = S, e.logger = T, e.default = T, Object.defineProperty(e, "__esModule", {
    value: !0
  });
});

/***/ }),

/***/ 1049:
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

/**
 * Simple middleware intercepts actions and replaces with
 * another by calling an alias function with the original action
 * @type {object} aliases an object that maps action types (keys) to alias functions (values) (e.g. { SOME_ACTION: newActionAliasFunc })
 */
var _default = function _default(aliases) {
  return function () {
    return function (next) {
      return function (action) {
        var alias = aliases[action.type];
        if (alias) {
          return next(alias(action));
        }
        return next(action);
      };
    };
  };
};
exports["default"] = _default;

/***/ }),

/***/ 1162:
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.DEFAULT_PORT_NAME = exports.PATCH_STATE_TYPE = exports.STATE_TYPE = exports.DISPATCH_TYPE = void 0;
// Message type used for dispatch events
// from the Proxy Stores to background
var DISPATCH_TYPE = 'chromex.dispatch'; // Message type for state update events from
// background to Proxy Stores

exports.DISPATCH_TYPE = DISPATCH_TYPE;
var STATE_TYPE = 'chromex.state'; // Message type for state patch events from
// background to Proxy Stores

exports.STATE_TYPE = STATE_TYPE;
var PATCH_STATE_TYPE = 'chromex.patch_state'; // The default name for the port communication via
// react-chrome-redux

exports.PATCH_STATE_TYPE = PATCH_STATE_TYPE;
var DEFAULT_PORT_NAME = "chromex.port_name";
exports.DEFAULT_PORT_NAME = DEFAULT_PORT_NAME;

/***/ }),

/***/ 3723:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});
__webpack_unused_export__ = ({
  enumerable: true,
  get: function get() {
    return _Store.default;
  }
});
__webpack_unused_export__ = ({
  enumerable: true,
  get: function get() {
    return _applyMiddleware.default;
  }
});
Object.defineProperty(exports, "IF", ({
  enumerable: true,
  get: function get() {
    return _wrapStore.default;
  }
}));
__webpack_unused_export__ = ({
  enumerable: true,
  get: function get() {
    return _alias.default;
  }
});
var _Store = _interopRequireDefault(__webpack_require__(6262));
var _applyMiddleware = _interopRequireDefault(__webpack_require__(8906));
var _wrapStore = _interopRequireDefault(__webpack_require__(6738));
var _alias = _interopRequireDefault(__webpack_require__(1049));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

/***/ }),

/***/ 7308:
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.withSerializer = exports.withDeserializer = exports.noop = void 0;
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);
    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }
    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }
  return target;
}
function _defineProperty(obj, key, value) {
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
var noop = function noop(payload) {
  return payload;
};
exports.noop = noop;
var transformPayload = function transformPayload(message) {
  var transformer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  return _objectSpread({}, message, message.payload ? {
    payload: transformer(message.payload)
  } : {});
};
var deserializeListener = function deserializeListener(listener) {
  var deserializer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  var shouldDeserialize = arguments.length > 2 ? arguments[2] : undefined;

  // If a shouldDeserialize function is passed, return a function that uses it
  // to check if any given message payload should be deserialized
  if (shouldDeserialize) {
    return function (message) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      if (shouldDeserialize.apply(void 0, [message].concat(args))) {
        return listener.apply(void 0, [transformPayload(message, deserializer)].concat(args));
      }
      return listener.apply(void 0, [message].concat(args));
    };
  } // Otherwise, return a function that tries to deserialize on every message

  return function (message) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }
    return listener.apply(void 0, [transformPayload(message, deserializer)].concat(args));
  };
};
/**
 * A function returned from withDeserializer that, when called, wraps addListenerFn with the
 * deserializer passed to withDeserializer.
 * @name AddListenerDeserializer
 * @function
 * @param {Function} addListenerFn The add listener function to wrap.
 * @returns {DeserializedAddListener}
 */

/**
 * A wrapped add listener function that registers the given listener.
 * @name DeserializedAddListener
 * @function
 * @param {Function} listener The listener function to register. It should expect the (optionally)
 * deserialized message as its first argument.
 * @param {Function} [shouldDeserialize] A function that takes the arguments passed to the listener
 * and returns whether the message payload should be deserialized. Not all messages (notably, messages
 * this listener doesn't care about) should be attempted to be deserialized.
 */

/**
 * Given a deserializer, returns an AddListenerDeserializer function that that takes an add listener
 * function and returns a DeserializedAddListener that automatically deserializes message payloads.
 * Each message listener is expected to take the message as its first argument.
 * @param {Function} deserializer A function that deserializes a message payload.
 * @returns {AddListenerDeserializer}
 * Example Usage:
 *   const withJsonDeserializer = withDeserializer(payload => JSON.parse(payload));
 *   const deserializedChromeListener = withJsonDeserializer(chrome.runtime.onMessage.addListener);
 *   const shouldDeserialize = (message) => message.type === 'DESERIALIZE_ME';
 *   deserializedChromeListener(message => console.log("Payload:", message.payload), shouldDeserialize);
 *   chrome.runtime.sendMessage("{'type:'DESERIALIZE_ME','payload':{'prop':4}}");
 *   //Payload: { prop: 4 };
 *   chrome.runtime.sendMessage("{'payload':{'prop':4}}");
 *   //Payload: "{'prop':4}";
 */

var withDeserializer = function withDeserializer() {
  var deserializer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;
  return function (addListenerFn) {
    return function (listener, shouldDeserialize) {
      return addListenerFn(deserializeListener(listener, deserializer, shouldDeserialize));
    };
  };
};
/**
 * Given a serializer, returns a function that takes a message sending
 * function as its sole argument and returns a wrapped message sender that
 * automaticaly serializes message payloads. The message sender
 * is expected to take the message as its first argument, unless messageArgIndex
 * is nonzero, in which case it is expected in the position specified by messageArgIndex.
 * @param {Function} serializer A function that serializes a message payload
 * Example Usage:
 *   const withJsonSerializer = withSerializer(payload => JSON.stringify(payload))
 *   const serializedChromeSender = withJsonSerializer(chrome.runtime.sendMessage)
 *   chrome.runtime.addListener(message => console.log("Payload:", message.payload))
 *   serializedChromeSender({ payload: { prop: 4 }})
 *   //Payload: "{'prop':4}"
 */

exports.withDeserializer = withDeserializer;
var withSerializer = function withSerializer() {
  var serializer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;
  return function (sendMessageFn) {
    var messageArgIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      if (args.length <= messageArgIndex) {
        throw new Error("Message in request could not be serialized. " + "Expected message in position ".concat(messageArgIndex, " but only received ").concat(args.length, " args."));
      }
      args[messageArgIndex] = transformPayload(args[messageArgIndex], serializer);
      return sendMessageFn.apply(void 0, args);
    };
  };
};
exports.withSerializer = withSerializer;

/***/ }),

/***/ 6262:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _lodash = _interopRequireDefault(__webpack_require__(2737));
var _constants = __webpack_require__(1162);
var _serialization = __webpack_require__(7308);
var _patch = _interopRequireDefault(__webpack_require__(3450));
var _util = __webpack_require__(7609);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
var backgroundErrPrefix = '\nLooks like there is an error in the background page. ' + 'You might want to inspect your background page for more details.\n';
var defaultOpts = {
  portName: _constants.DEFAULT_PORT_NAME,
  state: {},
  extensionId: null,
  serializer: _serialization.noop,
  deserializer: _serialization.noop,
  patchStrategy: _patch.default
};
var Store = /*#__PURE__*/
function () {
  /**
   * Creates a new Proxy store
   * @param  {object} options An object of form {portName, state, extensionId, serializer, deserializer, diffStrategy}, where `portName` is a required string and defines the name of the port for state transition changes, `state` is the initial state of this store (default `{}`) `extensionId` is the extension id as defined by browserAPI when extension is loaded (default `''`), `serializer` is a function to serialize outgoing message payloads (default is passthrough), `deserializer` is a function to deserialize incoming message payloads (default is passthrough), and patchStrategy is one of the included patching strategies (default is shallow diff) or a custom patching function.
   */
  function Store() {
    var _this = this;
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultOpts,
      _ref$portName = _ref.portName,
      portName = _ref$portName === void 0 ? defaultOpts.portName : _ref$portName,
      _ref$state = _ref.state,
      state = _ref$state === void 0 ? defaultOpts.state : _ref$state,
      _ref$extensionId = _ref.extensionId,
      extensionId = _ref$extensionId === void 0 ? defaultOpts.extensionId : _ref$extensionId,
      _ref$serializer = _ref.serializer,
      serializer = _ref$serializer === void 0 ? defaultOpts.serializer : _ref$serializer,
      _ref$deserializer = _ref.deserializer,
      deserializer = _ref$deserializer === void 0 ? defaultOpts.deserializer : _ref$deserializer,
      _ref$patchStrategy = _ref.patchStrategy,
      patchStrategy = _ref$patchStrategy === void 0 ? defaultOpts.patchStrategy : _ref$patchStrategy;
    _classCallCheck(this, Store);
    if (!portName) {
      throw new Error('portName is required in options');
    }
    if (typeof serializer !== 'function') {
      throw new Error('serializer must be a function');
    }
    if (typeof deserializer !== 'function') {
      throw new Error('deserializer must be a function');
    }
    if (typeof patchStrategy !== 'function') {
      throw new Error('patchStrategy must be one of the included patching strategies or a custom patching function');
    }
    this.portName = portName;
    this.readyResolved = false;
    this.readyPromise = new Promise(function (resolve) {
      return _this.readyResolve = resolve;
    });
    this.browserAPI = (0, _util.getBrowserAPI)();
    this.extensionId = extensionId; // keep the extensionId as an instance variable

    this.port = this.browserAPI.runtime.connect(this.extensionId, {
      name: portName
    });
    this.safetyHandler = this.safetyHandler.bind(this);
    if (this.browserAPI.runtime.onMessage) {
      this.safetyMessage = this.browserAPI.runtime.onMessage.addListener(this.safetyHandler);
    }
    this.serializedPortListener = (0, _serialization.withDeserializer)(deserializer)(function () {
      var _this$port$onMessage;
      return (_this$port$onMessage = _this.port.onMessage).addListener.apply(_this$port$onMessage, arguments);
    });
    this.serializedMessageSender = (0, _serialization.withSerializer)(serializer)(function () {
      var _this$browserAPI$runt;
      return (_this$browserAPI$runt = _this.browserAPI.runtime).sendMessage.apply(_this$browserAPI$runt, arguments);
    }, 1);
    this.listeners = [];
    this.state = state;
    this.patchStrategy = patchStrategy; // Don't use shouldDeserialize here, since no one else should be using this port

    this.serializedPortListener(function (message) {
      switch (message.type) {
        case _constants.STATE_TYPE:
          _this.replaceState(message.payload);
          if (!_this.readyResolved) {
            _this.readyResolved = true;
            _this.readyResolve();
          }
          break;
        case _constants.PATCH_STATE_TYPE:
          _this.patchState(message.payload);
          break;
        default: // do nothing
      }
    });

    this.dispatch = this.dispatch.bind(this); // add this context to dispatch
  }
  /**
  * Returns a promise that resolves when the store is ready. Optionally a callback may be passed in instead.
  * @param [function] callback An optional callback that may be passed in and will fire when the store is ready.
  * @return {object} promise A promise that resolves when the store has established a connection with the background page.
  */

  _createClass(Store, [{
    key: "ready",
    value: function ready() {
      var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (cb !== null) {
        return this.readyPromise.then(cb);
      }
      return this.readyPromise;
    }
    /**
     * Subscribes a listener function for all state changes
     * @param  {function} listener A listener function to be called when store state changes
     * @return {function}          An unsubscribe function which can be called to remove the listener from state updates
     */
  }, {
    key: "subscribe",
    value: function subscribe(listener) {
      var _this2 = this;
      this.listeners.push(listener);
      return function () {
        _this2.listeners = _this2.listeners.filter(function (l) {
          return l !== listener;
        });
      };
    }
    /**
     * Replaces the state for only the keys in the updated state. Notifies all listeners of state change.
     * @param {object} state the new (partial) redux state
     */
  }, {
    key: "patchState",
    value: function patchState(difference) {
      this.state = this.patchStrategy(this.state, difference);
      this.listeners.forEach(function (l) {
        return l();
      });
    }
    /**
     * Replace the current state with a new state. Notifies all listeners of state change.
     * @param  {object} state The new state for the store
     */
  }, {
    key: "replaceState",
    value: function replaceState(state) {
      this.state = state;
      this.listeners.forEach(function (l) {
        return l();
      });
    }
    /**
     * Get the current state of the store
     * @return {object} the current store state
     */
  }, {
    key: "getState",
    value: function getState() {
      return this.state;
    }
    /**
     * Stub function to stay consistent with Redux Store API. No-op.
     */
  }, {
    key: "replaceReducer",
    value: function replaceReducer() {
      return;
    }
    /**
     * Dispatch an action to the background using messaging passing
     * @param  {object} data The action data to dispatch
     * @return {Promise}     Promise that will resolve/reject based on the action response from the background
     */
  }, {
    key: "dispatch",
    value: function dispatch(data) {
      var _this3 = this;
      return new Promise(function (resolve, reject) {
        _this3.serializedMessageSender(_this3.extensionId, {
          type: _constants.DISPATCH_TYPE,
          portName: _this3.portName,
          payload: data
        }, null, function (resp) {
          if (!resp) {
            var _error = _this3.browserAPI.runtime.lastError;
            var bgErr = new Error("".concat(backgroundErrPrefix).concat(_error));
            reject((0, _lodash.default)(bgErr, _error));
            return;
          }
          var error = resp.error,
            value = resp.value;
          if (error) {
            var _bgErr = new Error("".concat(backgroundErrPrefix).concat(error));
            reject((0, _lodash.default)(_bgErr, error));
          } else {
            resolve(value && value.payload);
          }
        });
      });
    }
  }, {
    key: "safetyHandler",
    value: function safetyHandler(message) {
      if (message.action === 'storeReady' && message.portName === this.portName) {
        // Remove Saftey Listener
        this.browserAPI.runtime.onMessage.removeListener(this.safetyHandler); // Resolve if readyPromise has not been resolved.

        if (!this.readyResolved) {
          this.readyResolved = true;
          this.readyResolve();
        }
      }
    }
  }]);
  return Store;
}();
var _default = Store;
exports["default"] = _default;

/***/ }),

/***/ 8906:
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = applyMiddleware;
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}
function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
}

// Function taken from redux source
// https://github.com/reactjs/redux/blob/master/src/compose.js
function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }
  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
} // Based on redux implementation of applyMiddleware to support all standard
// redux middlewares

function applyMiddleware(store) {
  for (var _len2 = arguments.length, middlewares = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    middlewares[_key2 - 1] = arguments[_key2];
  }
  var _dispatch = function dispatch() {
    throw new Error('Dispatching while constructing your middleware is not allowed. ' + 'Other middleware would not be applied to this dispatch.');
  };
  var middlewareAPI = {
    getState: store.getState.bind(store),
    dispatch: function dispatch() {
      return _dispatch.apply(void 0, arguments);
    }
  };
  middlewares = (middlewares || []).map(function (middleware) {
    return middleware(middlewareAPI);
  });
  _dispatch = compose.apply(void 0, _toConsumableArray(middlewares))(store.dispatch);
  store.dispatch = _dispatch;
  return store;
}

/***/ }),

/***/ 6942:
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.DIFF_STATUS_ARRAY_UPDATED = exports.DIFF_STATUS_KEYS_UPDATED = exports.DIFF_STATUS_REMOVED = exports.DIFF_STATUS_UPDATED = void 0;
// The `change` value for updated or inserted fields resulting from shallow diff
var DIFF_STATUS_UPDATED = 'updated'; // The `change` value for removed fields resulting from shallow diff

exports.DIFF_STATUS_UPDATED = DIFF_STATUS_UPDATED;
var DIFF_STATUS_REMOVED = 'removed';
exports.DIFF_STATUS_REMOVED = DIFF_STATUS_REMOVED;
var DIFF_STATUS_KEYS_UPDATED = 'updated_keys';
exports.DIFF_STATUS_KEYS_UPDATED = DIFF_STATUS_KEYS_UPDATED;
var DIFF_STATUS_ARRAY_UPDATED = 'updated_array';
exports.DIFF_STATUS_ARRAY_UPDATED = DIFF_STATUS_ARRAY_UPDATED;

/***/ }),

/***/ 403:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = shallowDiff;
var _constants = __webpack_require__(6942);

/**
 * Returns a new Object containing only the fields in `new` that differ from `old`
 *
 * @param {Object} old
 * @param {Object} new
 * @return {Array} An array of changes. The changes have a `key`, `value`, and `change`.
 *   The change is either `updated`, which is if the value has changed or been added,
 *   or `removed`.
 */
function shallowDiff(oldObj, newObj) {
  var difference = [];
  Object.keys(newObj).forEach(function (key) {
    if (oldObj[key] !== newObj[key]) {
      difference.push({
        key: key,
        value: newObj[key],
        change: _constants.DIFF_STATUS_UPDATED
      });
    }
  });
  Object.keys(oldObj).forEach(function (key) {
    if (!newObj.hasOwnProperty(key)) {
      difference.push({
        key: key,
        change: _constants.DIFF_STATUS_REMOVED
      });
    }
  });
  return difference;
}

/***/ }),

/***/ 3450:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;
var _constants = __webpack_require__(6942);
function _default(obj, difference) {
  var newObj = Object.assign({}, obj);
  difference.forEach(function (_ref) {
    var change = _ref.change,
      key = _ref.key,
      value = _ref.value;
    switch (change) {
      case _constants.DIFF_STATUS_UPDATED:
        newObj[key] = value;
        break;
      case _constants.DIFF_STATUS_REMOVED:
        Reflect.deleteProperty(newObj, key);
        break;
      default: // do nothing
    }
  });

  return newObj;
}

/***/ }),

/***/ 7609:
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.getBrowserAPI = getBrowserAPI;

/**
 * Looks for a global browser api, first checking the chrome namespace and then
 * checking the browser namespace. If no appropriate namespace is present, this
 * function will throw an error.
 */
function getBrowserAPI() {
  var api;
  try {
    // eslint-disable-next-line no-undef
    api = self.chrome || self.browser || browser;
  } catch (error) {
    // eslint-disable-next-line no-undef
    api = browser;
  }
  if (!api) {
    throw new Error("Browser API is not present");
  }
  return api;
}

/***/ }),

/***/ 6738:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _constants = __webpack_require__(1162);
var _serialization = __webpack_require__(7308);
var _util = __webpack_require__(7609);
var _diff = _interopRequireDefault(__webpack_require__(403));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

/**
 * Responder for promisified results
 * @param  {object} dispatchResult The result from `store.dispatch()`
 * @param  {function} send         The function used to respond to original message
 * @return {undefined}
 */
var promiseResponder = function promiseResponder(dispatchResult, send) {
  Promise.resolve(dispatchResult).then(function (res) {
    send({
      error: null,
      value: res
    });
  }).catch(function (err) {
    console.error('error dispatching result:', err);
    send({
      error: err.message,
      value: null
    });
  });
};
var defaultOpts = {
  portName: _constants.DEFAULT_PORT_NAME,
  dispatchResponder: promiseResponder,
  serializer: _serialization.noop,
  deserializer: _serialization.noop,
  diffStrategy: _diff.default
};
/**
 * Wraps a Redux store so that proxy stores can connect to it.
 * @param {Object} store A Redux store
 * @param {Object} options An object of form {portName, dispatchResponder, serializer, deserializer}, where `portName` is a required string and defines the name of the port for state transition changes, `dispatchResponder` is a function that takes the result of a store dispatch and optionally implements custom logic for responding to the original dispatch message,`serializer` is a function to serialize outgoing message payloads (default is passthrough), `deserializer` is a function to deserialize incoming message payloads (default is passthrough), and diffStrategy is one of the included diffing strategies (default is shallow diff) or a custom diffing function.
 */

var _default = function _default(store) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultOpts,
    _ref$portName = _ref.portName,
    portName = _ref$portName === void 0 ? defaultOpts.portName : _ref$portName,
    _ref$dispatchResponde = _ref.dispatchResponder,
    dispatchResponder = _ref$dispatchResponde === void 0 ? defaultOpts.dispatchResponder : _ref$dispatchResponde,
    _ref$serializer = _ref.serializer,
    serializer = _ref$serializer === void 0 ? defaultOpts.serializer : _ref$serializer,
    _ref$deserializer = _ref.deserializer,
    deserializer = _ref$deserializer === void 0 ? defaultOpts.deserializer : _ref$deserializer,
    _ref$diffStrategy = _ref.diffStrategy,
    diffStrategy = _ref$diffStrategy === void 0 ? defaultOpts.diffStrategy : _ref$diffStrategy;
  if (!portName) {
    throw new Error('portName is required in options');
  }
  if (typeof serializer !== 'function') {
    throw new Error('serializer must be a function');
  }
  if (typeof deserializer !== 'function') {
    throw new Error('deserializer must be a function');
  }
  if (typeof diffStrategy !== 'function') {
    throw new Error('diffStrategy must be one of the included diffing strategies or a custom diff function');
  }
  var browserAPI = (0, _util.getBrowserAPI)();
  /**
   * Respond to dispatches from UI components
   */

  var dispatchResponse = function dispatchResponse(request, sender, sendResponse) {
    if (request.type === _constants.DISPATCH_TYPE && request.portName === portName) {
      var action = Object.assign({}, request.payload, {
        _sender: sender
      });
      var dispatchResult = null;
      try {
        dispatchResult = store.dispatch(action);
      } catch (e) {
        dispatchResult = Promise.reject(e.message);
        console.error(e);
      }
      dispatchResponder(dispatchResult, sendResponse);
      return true;
    }
  };
  /**
  * Setup for state updates
  */

  var connectState = function connectState(port) {
    if (port.name !== portName) {
      return;
    }
    var serializedMessagePoster = (0, _serialization.withSerializer)(serializer)(function () {
      return port.postMessage.apply(port, arguments);
    });
    var prevState = store.getState();
    var patchState = function patchState() {
      var state = store.getState();
      var diff = diffStrategy(prevState, state);
      if (diff.length) {
        prevState = state;
        serializedMessagePoster({
          type: _constants.PATCH_STATE_TYPE,
          payload: diff
        });
      }
    }; // Send patched state down connected port on every redux store state change

    var unsubscribe = store.subscribe(patchState); // when the port disconnects, unsubscribe the sendState listener

    port.onDisconnect.addListener(unsubscribe); // Send store's initial state through port

    serializedMessagePoster({
      type: _constants.STATE_TYPE,
      payload: prevState
    });
  };
  var withPayloadDeserializer = (0, _serialization.withDeserializer)(deserializer);
  var shouldDeserialize = function shouldDeserialize(request) {
    return request.type === _constants.DISPATCH_TYPE && request.portName === portName;
  };
  /**
   * Setup action handler
   */

  withPayloadDeserializer(function () {
    var _browserAPI$runtime$o;
    return (_browserAPI$runtime$o = browserAPI.runtime.onMessage).addListener.apply(_browserAPI$runtime$o, arguments);
  })(dispatchResponse, shouldDeserialize);
  /**
   * Setup external action handler
   */

  if (browserAPI.runtime.onMessageExternal) {
    withPayloadDeserializer(function () {
      var _browserAPI$runtime$o2;
      return (_browserAPI$runtime$o2 = browserAPI.runtime.onMessageExternal).addListener.apply(_browserAPI$runtime$o2, arguments);
    })(dispatchResponse, shouldDeserialize);
  } else {
    console.warn('runtime.onMessageExternal is not supported');
  }
  /**
   * Setup extended connection
   */

  browserAPI.runtime.onConnect.addListener(connectState);
  /**
   * Setup extended external connection
   */

  if (browserAPI.runtime.onConnectExternal) {
    browserAPI.runtime.onConnectExternal.addListener(connectState);
  } else {
    console.warn('runtime.onConnectExternal is not supported');
  }
  /**
   * Safety message to tabs for content scripts
   */

  browserAPI.tabs.query({}, function (tabs) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;
    try {
      for (var _iterator = tabs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var tab = _step.value;
        browserAPI.tabs.sendMessage(tab.id, {
          action: 'storeReady',
          portName: portName
        }, function () {
          if (chrome.runtime.lastError) {// do nothing - errors can be present
            // if no content script exists on reciever
          }
        });
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }); // For non-tab based
  // TODO: Find use case for this. Ommiting until then.
  // browserAPI.runtime.sendMessage(null, {action: 'storeReady'});
};

exports["default"] = _default;

/***/ }),

/***/ 930:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var _toConsumableArray = (__webpack_require__(861)["default"]);
var _classCallCheck = (__webpack_require__(6690)["default"]);
var _createClass = (__webpack_require__(9728)["default"]);
var _get = (__webpack_require__(1588)["default"]);
var _getPrototypeOf = (__webpack_require__(3808)["default"]);
var _inherits = (__webpack_require__(1655)["default"]);
var _createSuper = (__webpack_require__(6389)["default"]);
var _wrapNativeSuper = (__webpack_require__(3496)["default"]);
(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var mod; }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (module) {
  /* webextension-polyfill - v0.10.0 - Fri Aug 12 2022 19:42:44 */

  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */

  /* vim: set sts=2 sw=2 et tw=80: */

  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  var _globalThis$chrome, _globalThis$chrome$ru;
  if (!((_globalThis$chrome = globalThis.chrome) !== null && _globalThis$chrome !== void 0 && (_globalThis$chrome$ru = _globalThis$chrome.runtime) !== null && _globalThis$chrome$ru !== void 0 && _globalThis$chrome$ru.id)) {
    throw new Error("This script should only be loaded in a browser extension.");
  }
  if (typeof globalThis.browser === "undefined" || Object.getPrototypeOf(globalThis.browser) !== Object.prototype) {
    var CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received."; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.

    var wrapAPIs = function wrapAPIs(extensionAPIs) {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      var apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "disable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "enable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "openPopup": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setBadgeText": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "browsingData": {
          "remove": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "removeCache": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCookies": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeDownloads": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFormData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeHistory": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeLocalStorage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePasswords": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePluginData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "settings": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2,
              "singleCallbackArg": false
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            },
            "elements": {
              "createSidebarPane": {
                "minArgs": 1,
                "maxArgs": 1
              }
            }
          }
        },
        "downloads": {
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "identity": {
          "launchWebAuthFlow": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setEnabled": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "permissions": {
          "contains": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "request": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "sessions": {
          "getDevices": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getRecentlyClosed": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "restore": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "discard": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goBack": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goForward": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "topSites": {
          "get": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };
      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }
      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */
      var DefaultWeakMap = /*#__PURE__*/function (_WeakMap) {
        _inherits(DefaultWeakMap, _WeakMap);
        var _super = _createSuper(DefaultWeakMap);
        function DefaultWeakMap(createItem) {
          var _this;
          var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
          _classCallCheck(this, DefaultWeakMap);
          _this = _super.call(this, items);
          _this.createItem = createItem;
          return _this;
        }
        _createClass(DefaultWeakMap, [{
          key: "get",
          value: function get(key) {
            if (!this.has(key)) {
              this.set(key, this.createItem(key));
            }
            return _get(_getPrototypeOf(DefaultWeakMap.prototype), "get", this).call(this, key);
          }
        }]);
        return DefaultWeakMap;
      }( /*#__PURE__*/_wrapNativeSuper(WeakMap));
      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */
      var isThenable = function isThenable(value) {
        return value && typeof value === "object" && typeof value.then === "function";
      };
      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.reject
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function}
       *        The generated callback function.
       */

      var makeCallback = function makeCallback(promise, metadata) {
        return function () {
          for (var _len = arguments.length, callbackArgs = new Array(_len), _key = 0; _key < _len; _key++) {
            callbackArgs[_key] = arguments[_key];
          }
          if (extensionAPIs.runtime.lastError) {
            promise.reject(new Error(extensionAPIs.runtime.lastError.message));
          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };
      var pluralizeArguments = function pluralizeArguments(numArgs) {
        return numArgs == 1 ? "argument" : "arguments";
      };
      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */

      var wrapAsyncFunction = function wrapAsyncFunction(name, metadata) {
        return function asyncFunctionWrapper(target) {
          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }
          if (args.length < metadata.minArgs) {
            throw new Error("Expected at least ".concat(metadata.minArgs, " ").concat(pluralizeArguments(metadata.minArgs), " for ").concat(name, "(), got ").concat(args.length));
          }
          if (args.length > metadata.maxArgs) {
            throw new Error("Expected at most ".concat(metadata.maxArgs, " ").concat(pluralizeArguments(metadata.maxArgs), " for ").concat(name, "(), got ").concat(args.length));
          }
          return new Promise(function (resolve, reject) {
            if (metadata.fallbackToNoCallback) {
              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
              // and so the polyfill will try to call it with a callback first, and it will fallback
              // to not passing the callback if the first call fails.
              try {
                target[name].apply(target, args.concat([makeCallback({
                  resolve: resolve,
                  reject: reject
                }, metadata)]));
              } catch (cbError) {
                console.warn("".concat(name, " API method doesn't seem to support the callback parameter, ") + "falling back to call it without a callback: ", cbError);
                target[name].apply(target, args); // Update the API method metadata, so that the next API calls will not try to
                // use the unsupported callback anymore.

                metadata.fallbackToNoCallback = false;
                metadata.noCallback = true;
                resolve();
              }
            } else if (metadata.noCallback) {
              target[name].apply(target, args);
              resolve();
            } else {
              target[name].apply(target, args.concat([makeCallback({
                resolve: resolve,
                reject: reject
              }, metadata)]));
            }
          });
        };
      };
      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */

      var wrapMethod = function wrapMethod(target, method, wrapper) {
        return new Proxy(method, {
          apply: function apply(targetMethod, thisObj, args) {
            return wrapper.call.apply(wrapper, [thisObj, target].concat(_toConsumableArray(args)));
          }
        });
      };
      var hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */

      var wrapObject = function wrapObject(target) {
        var wrappers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var cache = Object.create(null);
        var handlers = {
          has: function has(proxyTarget, prop) {
            return prop in target || prop in cache;
          },
          get: function get(proxyTarget, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }
            if (!(prop in target)) {
              return undefined;
            }
            var value = target[prop];
            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.
              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                var wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else if (hasOwnProperty(metadata, "*")) {
              // Wrap all properties in * namespace.
              value = wrapObject(value, wrappers[prop], metadata["*"]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,
                get: function get() {
                  return target[prop];
                },
                set: function set(value) {
                  target[prop] = value;
                }
              });
              return value;
            }
            cache[prop] = value;
            return value;
          },
          set: function set(proxyTarget, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }
            return true;
          },
          defineProperty: function defineProperty(proxyTarget, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },
          deleteProperty: function deleteProperty(proxyTarget, prop) {
            return Reflect.deleteProperty(cache, prop);
          }
        }; // Per contract of the Proxy API, the "get" proxy handler must return the
        // original value of the target if that value is declared read-only and
        // non-configurable. For this reason, we create an object with the
        // prototype set to `target` instead of using `target` directly.
        // Otherwise we cannot return a custom object for APIs that
        // are declared read-only and non-configurable, such as `chrome.devtools`.
        //
        // The proxy handlers themselves will still use the original `target`
        // instead of the `proxyTarget`, so that the methods and properties are
        // dereferenced via the original targets.

        var proxyTarget = Object.create(target);
        return new Proxy(proxyTarget, handlers);
      };
      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */

      var wrapEvent = function wrapEvent(wrapperMap) {
        return {
          addListener: function addListener(target, listener) {
            for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
              args[_key3 - 2] = arguments[_key3];
            }
            target.addListener.apply(target, [wrapperMap.get(listener)].concat(args));
          },
          hasListener: function hasListener(target, listener) {
            return target.hasListener(wrapperMap.get(listener));
          },
          removeListener: function removeListener(target, listener) {
            target.removeListener(wrapperMap.get(listener));
          }
        };
      };
      var onRequestFinishedWrappers = new DefaultWeakMap(function (listener) {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps an onRequestFinished listener function so that it will return a
         * `getContent()` property which returns a `Promise` rather than using a
         * callback API.
         *
         * @param {object} req
         *        The HAR entry object representing the network request.
         */

        return function onRequestFinished(req) {
          var wrappedReq = wrapObject(req, {}
          /* wrappers */, {
            getContent: {
              minArgs: 0,
              maxArgs: 0
            }
          });
          listener(wrappedReq);
        };
      });
      var onMessageWrappers = new DefaultWeakMap(function (listener) {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */

        return function onMessage(message, sender, sendResponse) {
          var didCallSendResponse = false;
          var wrappedSendResponse;
          var sendResponsePromise = new Promise(function (resolve) {
            wrappedSendResponse = function wrappedSendResponse(response) {
              didCallSendResponse = true;
              resolve(response);
            };
          });
          var result;
          try {
            result = listener(message, sender, wrappedSendResponse);
          } catch (err) {
            result = Promise.reject(err);
          }
          var isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
          // wrappedSendResponse synchronously, we can exit earlier
          // because there will be no response sent from this listener.

          if (result !== true && !isResultThenable && !didCallSendResponse) {
            return false;
          } // A small helper to send the message if the promise resolves
          // and an error if the promise rejects (a wrapped sendMessage has
          // to translate the message into a resolved promise or a rejected
          // promise).

          var sendPromisedResult = function sendPromisedResult(promise) {
            promise.then(function (msg) {
              // send the message value.
              sendResponse(msg);
            }, function (error) {
              // Send a JSON representation of the error if the rejected value
              // is an instance of error, or the object itself otherwise.
              var message;
              if (error && (error instanceof Error || typeof error.message === "string")) {
                message = error.message;
              } else {
                message = "An unexpected error occurred";
              }
              sendResponse({
                __mozWebExtensionPolyfillReject__: true,
                message: message
              });
            }).catch(function (err) {
              // Print an error on the console if unable to send the response.
              console.error("Failed to send onMessage rejected reply", err);
            });
          }; // If the listener returned a Promise, send the resolved value as a
          // result, otherwise wait the promise related to the wrappedSendResponse
          // callback to resolve and send it as a response.

          if (isResultThenable) {
            sendPromisedResult(result);
          } else {
            sendPromisedResult(sendResponsePromise);
          } // Let Chrome know that the listener is replying.

          return true;
        };
      });
      var wrappedSendMessageCallback = function wrappedSendMessageCallback(_ref, reply) {
        var reject = _ref.reject,
          resolve = _ref.resolve;
        if (extensionAPIs.runtime.lastError) {
          // Detect when none of the listeners replied to the sendMessage call and resolve
          // the promise to undefined as in Firefox.
          // See https://github.com/mozilla/webextension-polyfill/issues/130
          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
            resolve();
          } else {
            reject(new Error(extensionAPIs.runtime.lastError.message));
          }
        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
          // Convert back the JSON representation of the error into
          // an Error instance.
          reject(new Error(reply.message));
        } else {
          resolve(reply);
        }
      };
      var wrappedSendMessage = function wrappedSendMessage(name, metadata, apiNamespaceObj) {
        for (var _len4 = arguments.length, args = new Array(_len4 > 3 ? _len4 - 3 : 0), _key4 = 3; _key4 < _len4; _key4++) {
          args[_key4 - 3] = arguments[_key4];
        }
        if (args.length < metadata.minArgs) {
          throw new Error("Expected at least ".concat(metadata.minArgs, " ").concat(pluralizeArguments(metadata.minArgs), " for ").concat(name, "(), got ").concat(args.length));
        }
        if (args.length > metadata.maxArgs) {
          throw new Error("Expected at most ".concat(metadata.maxArgs, " ").concat(pluralizeArguments(metadata.maxArgs), " for ").concat(name, "(), got ").concat(args.length));
        }
        return new Promise(function (resolve, reject) {
          var wrappedCb = wrappedSendMessageCallback.bind(null, {
            resolve: resolve,
            reject: reject
          });
          args.push(wrappedCb);
          apiNamespaceObj.sendMessage.apply(apiNamespaceObj, args);
        });
      };
      var staticWrappers = {
        devtools: {
          network: {
            onRequestFinished: wrapEvent(onRequestFinishedWrappers)
          }
        },
        runtime: {
          onMessage: wrapEvent(onMessageWrappers),
          onMessageExternal: wrapEvent(onMessageWrappers),
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 1,
            maxArgs: 3
          })
        },
        tabs: {
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 2,
            maxArgs: 3
          })
        }
      };
      var settingMetadata = {
        clear: {
          minArgs: 1,
          maxArgs: 1
        },
        get: {
          minArgs: 1,
          maxArgs: 1
        },
        set: {
          minArgs: 1,
          maxArgs: 1
        }
      };
      apiMetadata.privacy = {
        network: {
          "*": settingMetadata
        },
        services: {
          "*": settingMetadata
        },
        websites: {
          "*": settingMetadata
        }
      };
      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
    }; // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.

    module.exports = wrapAPIs(chrome);
  } else {
    module.exports = globalThis.browser;
  }
});
//# sourceMappingURL=browser-polyfill.js.map

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

/***/ 1588:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var superPropBase = __webpack_require__(1753);
function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    module.exports = _get = Reflect.get.bind(), module.exports.__esModule = true, module.exports["default"] = module.exports;
  } else {
    module.exports = _get = function _get(target, property, receiver) {
      var base = superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);
      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }
      return desc.value;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
  return _get.apply(this, arguments);
}
module.exports = _get, module.exports.__esModule = true, module.exports["default"] = module.exports;

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

/***/ 1753:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var getPrototypeOf = __webpack_require__(3808);
function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = getPrototypeOf(object);
    if (object === null) break;
  }
  return object;
}
module.exports = _superPropBase, module.exports.__esModule = true, module.exports["default"] = module.exports;

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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";

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
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/defineProperty.js

function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
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
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/objectSpread2.js

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
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
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
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/createForOfIteratorHelper.js

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
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
;// CONCATENATED MODULE: ./src/Constants/index.js
var PORT_NAME="WEBEXT_REDUX_TEST";var CONNECTION_NAME="5IRE_EXT";var UI_CONNECTION_NAME="5IRE_EXT_UI";var NATIVE="native";var EVM="evm";var TEMP1M="temp1m";var TEMP2P="temp2p";var TX_TYPE={SEND:"send",SWAP:"swap"};var NETWORK={QA_NETWORK:"QA",TEST_NETWORK:"Testnet"};var STATUS={PENDING:"Pending",FAILED:"Failed",SUCCESS:"Success"};
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
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
;// CONCATENATED MODULE: ./node_modules/immer/dist/immer.esm.mjs
function n(n) {
  for (var r = arguments.length, t = Array(r > 1 ? r - 1 : 0), e = 1; e < r; e++) t[e - 1] = arguments[e];
  if (false) { var i, o; }
  throw Error("[Immer] minified error nr: " + n + (t.length ? " " + t.map(function (n) {
    return "'" + n + "'";
  }).join(",") : "") + ". Find the full error at: https://bit.ly/3cXEKWf");
}
function r(n) {
  return !!n && !!n[Q];
}
function t(n) {
  var r;
  return !!n && (function (n) {
    if (!n || "object" != typeof n) return !1;
    var r = Object.getPrototypeOf(n);
    if (null === r) return !0;
    var t = Object.hasOwnProperty.call(r, "constructor") && r.constructor;
    return t === Object || "function" == typeof t && Function.toString.call(t) === Z;
  }(n) || Array.isArray(n) || !!n[L] || !!(null === (r = n.constructor) || void 0 === r ? void 0 : r[L]) || s(n) || v(n));
}
function e(t) {
  return r(t) || n(23, t), t[Q].t;
}
function i(n, r, t) {
  void 0 === t && (t = !1), 0 === o(n) ? (t ? Object.keys : nn)(n).forEach(function (e) {
    t && "symbol" == typeof e || r(e, n[e], n);
  }) : n.forEach(function (t, e) {
    return r(e, t, n);
  });
}
function o(n) {
  var r = n[Q];
  return r ? r.i > 3 ? r.i - 4 : r.i : Array.isArray(n) ? 1 : s(n) ? 2 : v(n) ? 3 : 0;
}
function u(n, r) {
  return 2 === o(n) ? n.has(r) : Object.prototype.hasOwnProperty.call(n, r);
}
function a(n, r) {
  return 2 === o(n) ? n.get(r) : n[r];
}
function f(n, r, t) {
  var e = o(n);
  2 === e ? n.set(r, t) : 3 === e ? n.add(t) : n[r] = t;
}
function c(n, r) {
  return n === r ? 0 !== n || 1 / n == 1 / r : n != n && r != r;
}
function s(n) {
  return X && n instanceof Map;
}
function v(n) {
  return q && n instanceof Set;
}
function p(n) {
  return n.o || n.t;
}
function l(n) {
  if (Array.isArray(n)) return Array.prototype.slice.call(n);
  var r = rn(n);
  delete r[Q];
  for (var t = nn(r), e = 0; e < t.length; e++) {
    var i = t[e],
      o = r[i];
    !1 === o.writable && (o.writable = !0, o.configurable = !0), (o.get || o.set) && (r[i] = {
      configurable: !0,
      writable: !0,
      enumerable: o.enumerable,
      value: n[i]
    });
  }
  return Object.create(Object.getPrototypeOf(n), r);
}
function d(n, e) {
  return void 0 === e && (e = !1), y(n) || r(n) || !t(n) || (o(n) > 1 && (n.set = n.add = n.clear = n.delete = h), Object.freeze(n), e && i(n, function (n, r) {
    return d(r, !0);
  }, !0)), n;
}
function h() {
  n(2);
}
function y(n) {
  return null == n || "object" != typeof n || Object.isFrozen(n);
}
function b(r) {
  var t = tn[r];
  return t || n(18, r), t;
}
function m(n, r) {
  tn[n] || (tn[n] = r);
}
function _() {
  return  true || 0, U;
}
function j(n, r) {
  r && (b("Patches"), n.u = [], n.s = [], n.v = r);
}
function O(n) {
  g(n), n.p.forEach(S), n.p = null;
}
function g(n) {
  n === U && (U = n.l);
}
function w(n) {
  return U = {
    p: [],
    l: U,
    h: n,
    m: !0,
    _: 0
  };
}
function S(n) {
  var r = n[Q];
  0 === r.i || 1 === r.i ? r.j() : r.O = !0;
}
function P(r, e) {
  e._ = e.p.length;
  var i = e.p[0],
    o = void 0 !== r && r !== i;
  return e.h.g || b("ES5").S(e, r, o), o ? (i[Q].P && (O(e), n(4)), t(r) && (r = M(e, r), e.l || x(e, r)), e.u && b("Patches").M(i[Q].t, r, e.u, e.s)) : r = M(e, i, []), O(e), e.u && e.v(e.u, e.s), r !== H ? r : void 0;
}
function M(n, r, t) {
  if (y(r)) return r;
  var e = r[Q];
  if (!e) return i(r, function (i, o) {
    return A(n, e, r, i, o, t);
  }, !0), r;
  if (e.A !== n) return r;
  if (!e.P) return x(n, e.t, !0), e.t;
  if (!e.I) {
    e.I = !0, e.A._--;
    var o = 4 === e.i || 5 === e.i ? e.o = l(e.k) : e.o,
      u = o,
      a = !1;
    3 === e.i && (u = new Set(o), o.clear(), a = !0), i(u, function (r, i) {
      return A(n, e, o, r, i, t, a);
    }), x(n, o, !1), t && n.u && b("Patches").N(e, t, n.u, n.s);
  }
  return e.o;
}
function A(e, i, o, a, c, s, v) {
  if ( false && 0, r(c)) {
    var p = M(e, c, s && i && 3 !== i.i && !u(i.R, a) ? s.concat(a) : void 0);
    if (f(o, a, p), !r(p)) return;
    e.m = !1;
  } else v && o.add(c);
  if (t(c) && !y(c)) {
    if (!e.h.D && e._ < 1) return;
    M(e, c), i && i.A.l || x(e, c);
  }
}
function x(n, r, t) {
  void 0 === t && (t = !1), !n.l && n.h.D && n.m && d(r, t);
}
function z(n, r) {
  var t = n[Q];
  return (t ? p(t) : n)[r];
}
function I(n, r) {
  if (r in n) for (var t = Object.getPrototypeOf(n); t;) {
    var e = Object.getOwnPropertyDescriptor(t, r);
    if (e) return e;
    t = Object.getPrototypeOf(t);
  }
}
function k(n) {
  n.P || (n.P = !0, n.l && k(n.l));
}
function E(n) {
  n.o || (n.o = l(n.t));
}
function N(n, r, t) {
  var e = s(r) ? b("MapSet").F(r, t) : v(r) ? b("MapSet").T(r, t) : n.g ? function (n, r) {
    var t = Array.isArray(n),
      e = {
        i: t ? 1 : 0,
        A: r ? r.A : _(),
        P: !1,
        I: !1,
        R: {},
        l: r,
        t: n,
        k: null,
        o: null,
        j: null,
        C: !1
      },
      i = e,
      o = en;
    t && (i = [e], o = on);
    var u = Proxy.revocable(i, o),
      a = u.revoke,
      f = u.proxy;
    return e.k = f, e.j = a, f;
  }(r, t) : b("ES5").J(r, t);
  return (t ? t.A : _()).p.push(e), e;
}
function R(e) {
  return r(e) || n(22, e), function n(r) {
    if (!t(r)) return r;
    var e,
      u = r[Q],
      c = o(r);
    if (u) {
      if (!u.P && (u.i < 4 || !b("ES5").K(u))) return u.t;
      u.I = !0, e = D(r, c), u.I = !1;
    } else e = D(r, c);
    return i(e, function (r, t) {
      u && a(u.t, r) === t || f(e, r, n(t));
    }), 3 === c ? new Set(e) : e;
  }(e);
}
function D(n, r) {
  switch (r) {
    case 2:
      return new Map(n);
    case 3:
      return Array.from(n);
  }
  return l(n);
}
function F() {
  function t(n, r) {
    var t = s[n];
    return t ? t.enumerable = r : s[n] = t = {
      configurable: !0,
      enumerable: r,
      get: function get() {
        var r = this[Q];
        return  false && 0, en.get(r, n);
      },
      set: function set(r) {
        var t = this[Q];
         false && 0, en.set(t, n, r);
      }
    }, t;
  }
  function e(n) {
    for (var r = n.length - 1; r >= 0; r--) {
      var t = n[r][Q];
      if (!t.P) switch (t.i) {
        case 5:
          a(t) && k(t);
          break;
        case 4:
          o(t) && k(t);
      }
    }
  }
  function o(n) {
    for (var r = n.t, t = n.k, e = nn(t), i = e.length - 1; i >= 0; i--) {
      var o = e[i];
      if (o !== Q) {
        var a = r[o];
        if (void 0 === a && !u(r, o)) return !0;
        var f = t[o],
          s = f && f[Q];
        if (s ? s.t !== a : !c(f, a)) return !0;
      }
    }
    var v = !!r[Q];
    return e.length !== nn(r).length + (v ? 0 : 1);
  }
  function a(n) {
    var r = n.k;
    if (r.length !== n.t.length) return !0;
    var t = Object.getOwnPropertyDescriptor(r, r.length - 1);
    if (t && !t.get) return !0;
    for (var e = 0; e < r.length; e++) if (!r.hasOwnProperty(e)) return !0;
    return !1;
  }
  function f(r) {
    r.O && n(3, JSON.stringify(p(r)));
  }
  var s = {};
  m("ES5", {
    J: function J(n, r) {
      var e = Array.isArray(n),
        i = function (n, r) {
          if (n) {
            for (var e = Array(r.length), i = 0; i < r.length; i++) Object.defineProperty(e, "" + i, t(i, !0));
            return e;
          }
          var o = rn(r);
          delete o[Q];
          for (var u = nn(o), a = 0; a < u.length; a++) {
            var f = u[a];
            o[f] = t(f, n || !!o[f].enumerable);
          }
          return Object.create(Object.getPrototypeOf(r), o);
        }(e, n),
        o = {
          i: e ? 5 : 4,
          A: r ? r.A : _(),
          P: !1,
          I: !1,
          R: {},
          l: r,
          t: n,
          k: i,
          o: null,
          O: !1,
          C: !1
        };
      return Object.defineProperty(i, Q, {
        value: o,
        writable: !0
      }), i;
    },
    S: function S(n, t, o) {
      o ? r(t) && t[Q].A === n && e(n.p) : (n.u && function n(r) {
        if (r && "object" == typeof r) {
          var t = r[Q];
          if (t) {
            var e = t.t,
              o = t.k,
              f = t.R,
              c = t.i;
            if (4 === c) i(o, function (r) {
              r !== Q && (void 0 !== e[r] || u(e, r) ? f[r] || n(o[r]) : (f[r] = !0, k(t)));
            }), i(e, function (n) {
              void 0 !== o[n] || u(o, n) || (f[n] = !1, k(t));
            });else if (5 === c) {
              if (a(t) && (k(t), f.length = !0), o.length < e.length) for (var s = o.length; s < e.length; s++) f[s] = !1;else for (var v = e.length; v < o.length; v++) f[v] = !0;
              for (var p = Math.min(o.length, e.length), l = 0; l < p; l++) o.hasOwnProperty(l) || (f[l] = !0), void 0 === f[l] && n(o[l]);
            }
          }
        }
      }(n.p[0]), e(n.p));
    },
    K: function K(n) {
      return 4 === n.i ? o(n) : a(n);
    }
  });
}
function T() {
  function e(n) {
    if (!t(n)) return n;
    if (Array.isArray(n)) return n.map(e);
    if (s(n)) return new Map(Array.from(n.entries()).map(function (n) {
      return [n[0], e(n[1])];
    }));
    if (v(n)) return new Set(Array.from(n).map(e));
    var r = Object.create(Object.getPrototypeOf(n));
    for (var i in n) r[i] = e(n[i]);
    return u(n, L) && (r[L] = n[L]), r;
  }
  function f(n) {
    return r(n) ? e(n) : n;
  }
  var c = "add";
  m("Patches", {
    $: function $(r, t) {
      return t.forEach(function (t) {
        for (var i = t.path, u = t.op, f = r, s = 0; s < i.length - 1; s++) {
          var v = o(f),
            p = "" + i[s];
          0 !== v && 1 !== v || "__proto__" !== p && "constructor" !== p || n(24), "function" == typeof f && "prototype" === p && n(24), "object" != typeof (f = a(f, p)) && n(15, i.join("/"));
        }
        var l = o(f),
          d = e(t.value),
          h = i[i.length - 1];
        switch (u) {
          case "replace":
            switch (l) {
              case 2:
                return f.set(h, d);
              case 3:
                n(16);
              default:
                return f[h] = d;
            }
          case c:
            switch (l) {
              case 1:
                return "-" === h ? f.push(d) : f.splice(h, 0, d);
              case 2:
                return f.set(h, d);
              case 3:
                return f.add(d);
              default:
                return f[h] = d;
            }
          case "remove":
            switch (l) {
              case 1:
                return f.splice(h, 1);
              case 2:
                return f.delete(h);
              case 3:
                return f.delete(t.value);
              default:
                return delete f[h];
            }
          default:
            n(17, u);
        }
      }), r;
    },
    N: function N(n, r, t, e) {
      switch (n.i) {
        case 0:
        case 4:
        case 2:
          return function (n, r, t, e) {
            var o = n.t,
              s = n.o;
            i(n.R, function (n, i) {
              var v = a(o, n),
                p = a(s, n),
                l = i ? u(o, n) ? "replace" : c : "remove";
              if (v !== p || "replace" !== l) {
                var d = r.concat(n);
                t.push("remove" === l ? {
                  op: l,
                  path: d
                } : {
                  op: l,
                  path: d,
                  value: p
                }), e.push(l === c ? {
                  op: "remove",
                  path: d
                } : "remove" === l ? {
                  op: c,
                  path: d,
                  value: f(v)
                } : {
                  op: "replace",
                  path: d,
                  value: f(v)
                });
              }
            });
          }(n, r, t, e);
        case 5:
        case 1:
          return function (n, r, t, e) {
            var i = n.t,
              o = n.R,
              u = n.o;
            if (u.length < i.length) {
              var a = [u, i];
              i = a[0], u = a[1];
              var s = [e, t];
              t = s[0], e = s[1];
            }
            for (var v = 0; v < i.length; v++) if (o[v] && u[v] !== i[v]) {
              var p = r.concat([v]);
              t.push({
                op: "replace",
                path: p,
                value: f(u[v])
              }), e.push({
                op: "replace",
                path: p,
                value: f(i[v])
              });
            }
            for (var l = i.length; l < u.length; l++) {
              var d = r.concat([l]);
              t.push({
                op: c,
                path: d,
                value: f(u[l])
              });
            }
            i.length < u.length && e.push({
              op: "replace",
              path: r.concat(["length"]),
              value: i.length
            });
          }(n, r, t, e);
        case 3:
          return function (n, r, t, e) {
            var i = n.t,
              o = n.o,
              u = 0;
            i.forEach(function (n) {
              if (!o.has(n)) {
                var i = r.concat([u]);
                t.push({
                  op: "remove",
                  path: i,
                  value: n
                }), e.unshift({
                  op: c,
                  path: i,
                  value: n
                });
              }
              u++;
            }), u = 0, o.forEach(function (n) {
              if (!i.has(n)) {
                var o = r.concat([u]);
                t.push({
                  op: c,
                  path: o,
                  value: n
                }), e.unshift({
                  op: "remove",
                  path: o,
                  value: n
                });
              }
              u++;
            });
          }(n, r, t, e);
      }
    },
    M: function M(n, r, t, e) {
      t.push({
        op: "replace",
        path: [],
        value: r === H ? void 0 : r
      }), e.push({
        op: "replace",
        path: [],
        value: n
      });
    }
  });
}
function C() {
  function r(n, r) {
    function t() {
      this.constructor = n;
    }
    _a(n, r), n.prototype = (t.prototype = r.prototype, new t());
  }
  function e(n) {
    n.o || (n.R = new Map(), n.o = new Map(n.t));
  }
  function o(n) {
    n.o || (n.o = new Set(), n.t.forEach(function (r) {
      if (t(r)) {
        var e = N(n.A.h, r, n);
        n.p.set(r, e), n.o.add(e);
      } else n.o.add(r);
    }));
  }
  function u(r) {
    r.O && n(3, JSON.stringify(p(r)));
  }
  var _a = function a(n, r) {
      return (_a = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function (n, r) {
        n.__proto__ = r;
      } || function (n, r) {
        for (var t in r) r.hasOwnProperty(t) && (n[t] = r[t]);
      })(n, r);
    },
    f = function () {
      function n(n, r) {
        return this[Q] = {
          i: 2,
          l: r,
          A: r ? r.A : _(),
          P: !1,
          I: !1,
          o: void 0,
          R: void 0,
          t: n,
          k: this,
          C: !1,
          O: !1
        }, this;
      }
      r(n, Map);
      var o = n.prototype;
      return Object.defineProperty(o, "size", {
        get: function get() {
          return p(this[Q]).size;
        }
      }), o.has = function (n) {
        return p(this[Q]).has(n);
      }, o.set = function (n, r) {
        var t = this[Q];
        return u(t), p(t).has(n) && p(t).get(n) === r || (e(t), k(t), t.R.set(n, !0), t.o.set(n, r), t.R.set(n, !0)), this;
      }, o.delete = function (n) {
        if (!this.has(n)) return !1;
        var r = this[Q];
        return u(r), e(r), k(r), r.t.has(n) ? r.R.set(n, !1) : r.R.delete(n), r.o.delete(n), !0;
      }, o.clear = function () {
        var n = this[Q];
        u(n), p(n).size && (e(n), k(n), n.R = new Map(), i(n.t, function (r) {
          n.R.set(r, !1);
        }), n.o.clear());
      }, o.forEach = function (n, r) {
        var t = this;
        p(this[Q]).forEach(function (e, i) {
          n.call(r, t.get(i), i, t);
        });
      }, o.get = function (n) {
        var r = this[Q];
        u(r);
        var i = p(r).get(n);
        if (r.I || !t(i)) return i;
        if (i !== r.t.get(n)) return i;
        var o = N(r.A.h, i, r);
        return e(r), r.o.set(n, o), o;
      }, o.keys = function () {
        return p(this[Q]).keys();
      }, o.values = function () {
        var n,
          r = this,
          t = this.keys();
        return (n = {})[V] = function () {
          return r.values();
        }, n.next = function () {
          var n = t.next();
          return n.done ? n : {
            done: !1,
            value: r.get(n.value)
          };
        }, n;
      }, o.entries = function () {
        var n,
          r = this,
          t = this.keys();
        return (n = {})[V] = function () {
          return r.entries();
        }, n.next = function () {
          var n = t.next();
          if (n.done) return n;
          var e = r.get(n.value);
          return {
            done: !1,
            value: [n.value, e]
          };
        }, n;
      }, o[V] = function () {
        return this.entries();
      }, n;
    }(),
    c = function () {
      function n(n, r) {
        return this[Q] = {
          i: 3,
          l: r,
          A: r ? r.A : _(),
          P: !1,
          I: !1,
          o: void 0,
          t: n,
          k: this,
          p: new Map(),
          O: !1,
          C: !1
        }, this;
      }
      r(n, Set);
      var t = n.prototype;
      return Object.defineProperty(t, "size", {
        get: function get() {
          return p(this[Q]).size;
        }
      }), t.has = function (n) {
        var r = this[Q];
        return u(r), r.o ? !!r.o.has(n) || !(!r.p.has(n) || !r.o.has(r.p.get(n))) : r.t.has(n);
      }, t.add = function (n) {
        var r = this[Q];
        return u(r), this.has(n) || (o(r), k(r), r.o.add(n)), this;
      }, t.delete = function (n) {
        if (!this.has(n)) return !1;
        var r = this[Q];
        return u(r), o(r), k(r), r.o.delete(n) || !!r.p.has(n) && r.o.delete(r.p.get(n));
      }, t.clear = function () {
        var n = this[Q];
        u(n), p(n).size && (o(n), k(n), n.o.clear());
      }, t.values = function () {
        var n = this[Q];
        return u(n), o(n), n.o.values();
      }, t.entries = function () {
        var n = this[Q];
        return u(n), o(n), n.o.entries();
      }, t.keys = function () {
        return this.values();
      }, t[V] = function () {
        return this.values();
      }, t.forEach = function (n, r) {
        for (var t = this.values(), e = t.next(); !e.done;) n.call(r, e.value, e.value, this), e = t.next();
      }, n;
    }();
  m("MapSet", {
    F: function F(n, r) {
      return new f(n, r);
    },
    T: function T(n, r) {
      return new c(n, r);
    }
  });
}
function J() {
  F(), C(), T();
}
function K(n) {
  return n;
}
function $(n) {
  return n;
}
var G,
  U,
  W = "undefined" != typeof Symbol && "symbol" == typeof Symbol("x"),
  X = "undefined" != typeof Map,
  q = "undefined" != typeof Set,
  B = "undefined" != typeof Proxy && void 0 !== Proxy.revocable && "undefined" != typeof Reflect,
  H = W ? Symbol.for("immer-nothing") : ((G = {})["immer-nothing"] = !0, G),
  L = W ? Symbol.for("immer-draftable") : "__$immer_draftable",
  Q = W ? Symbol.for("immer-state") : "__$immer_state",
  V = "undefined" != typeof Symbol && Symbol.iterator || "@@iterator",
  Y = {
    0: "Illegal state",
    1: "Immer drafts cannot have computed properties",
    2: "This object has been frozen and should not be mutated",
    3: function _(n) {
      return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + n;
    },
    4: "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
    5: "Immer forbids circular references",
    6: "The first or second argument to `produce` must be a function",
    7: "The third argument to `produce` must be a function or undefined",
    8: "First argument to `createDraft` must be a plain object, an array, or an immerable object",
    9: "First argument to `finishDraft` must be a draft returned by `createDraft`",
    10: "The given draft is already finalized",
    11: "Object.defineProperty() cannot be used on an Immer draft",
    12: "Object.setPrototypeOf() cannot be used on an Immer draft",
    13: "Immer only supports deleting array indices",
    14: "Immer only supports setting array indices and the 'length' property",
    15: function _(n) {
      return "Cannot apply patch, path doesn't resolve: " + n;
    },
    16: 'Sets cannot have "replace" patches.',
    17: function _(n) {
      return "Unsupported patch operation: " + n;
    },
    18: function _(n) {
      return "The plugin for '" + n + "' has not been loaded into Immer. To enable the plugin, import and call `enable" + n + "()` when initializing your application.";
    },
    20: "Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available",
    21: function _(n) {
      return "produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '" + n + "'";
    },
    22: function _(n) {
      return "'current' expects a draft, got: " + n;
    },
    23: function _(n) {
      return "'original' expects a draft, got: " + n;
    },
    24: "Patching reserved attributes like __proto__, prototype and constructor is not allowed"
  },
  Z = "" + Object.prototype.constructor,
  nn = "undefined" != typeof Reflect && Reflect.ownKeys ? Reflect.ownKeys : void 0 !== Object.getOwnPropertySymbols ? function (n) {
    return Object.getOwnPropertyNames(n).concat(Object.getOwnPropertySymbols(n));
  } : Object.getOwnPropertyNames,
  rn = Object.getOwnPropertyDescriptors || function (n) {
    var r = {};
    return nn(n).forEach(function (t) {
      r[t] = Object.getOwnPropertyDescriptor(n, t);
    }), r;
  },
  tn = {},
  en = {
    get: function get(n, r) {
      if (r === Q) return n;
      var e = p(n);
      if (!u(e, r)) return function (n, r, t) {
        var e,
          i = I(r, t);
        return i ? "value" in i ? i.value : null === (e = i.get) || void 0 === e ? void 0 : e.call(n.k) : void 0;
      }(n, e, r);
      var i = e[r];
      return n.I || !t(i) ? i : i === z(n.t, r) ? (E(n), n.o[r] = N(n.A.h, i, n)) : i;
    },
    has: function has(n, r) {
      return r in p(n);
    },
    ownKeys: function ownKeys(n) {
      return Reflect.ownKeys(p(n));
    },
    set: function set(n, r, t) {
      var e = I(p(n), r);
      if (null == e ? void 0 : e.set) return e.set.call(n.k, t), !0;
      if (!n.P) {
        var i = z(p(n), r),
          o = null == i ? void 0 : i[Q];
        if (o && o.t === t) return n.o[r] = t, n.R[r] = !1, !0;
        if (c(t, i) && (void 0 !== t || u(n.t, r))) return !0;
        E(n), k(n);
      }
      return n.o[r] === t && (void 0 !== t || r in n.o) || Number.isNaN(t) && Number.isNaN(n.o[r]) || (n.o[r] = t, n.R[r] = !0), !0;
    },
    deleteProperty: function deleteProperty(n, r) {
      return void 0 !== z(n.t, r) || r in n.t ? (n.R[r] = !1, E(n), k(n)) : delete n.R[r], n.o && delete n.o[r], !0;
    },
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(n, r) {
      var t = p(n),
        e = Reflect.getOwnPropertyDescriptor(t, r);
      return e ? {
        writable: !0,
        configurable: 1 !== n.i || "length" !== r,
        enumerable: e.enumerable,
        value: t[r]
      } : e;
    },
    defineProperty: function defineProperty() {
      n(11);
    },
    getPrototypeOf: function getPrototypeOf(n) {
      return Object.getPrototypeOf(n.t);
    },
    setPrototypeOf: function setPrototypeOf() {
      n(12);
    }
  },
  on = {};
i(en, function (n, r) {
  on[n] = function () {
    return arguments[0] = arguments[0][0], r.apply(this, arguments);
  };
}), on.deleteProperty = function (r, t) {
  return  false && 0, on.set.call(this, r, t, void 0);
}, on.set = function (r, t, e) {
  return  false && 0, en.set.call(this, r[0], t, e, r[0]);
};
var un = function () {
    function e(r) {
      var e = this;
      this.g = B, this.D = !0, this.produce = function (r, i, o) {
        if ("function" == typeof r && "function" != typeof i) {
          var u = i;
          i = r;
          var a = e;
          return function (n) {
            var r = this;
            void 0 === n && (n = u);
            for (var t = arguments.length, e = Array(t > 1 ? t - 1 : 0), o = 1; o < t; o++) e[o - 1] = arguments[o];
            return a.produce(n, function (n) {
              var t;
              return (t = i).call.apply(t, [r, n].concat(e));
            });
          };
        }
        var f;
        if ("function" != typeof i && n(6), void 0 !== o && "function" != typeof o && n(7), t(r)) {
          var c = w(e),
            s = N(e, r, void 0),
            v = !0;
          try {
            f = i(s), v = !1;
          } finally {
            v ? O(c) : g(c);
          }
          return "undefined" != typeof Promise && f instanceof Promise ? f.then(function (n) {
            return j(c, o), P(n, c);
          }, function (n) {
            throw O(c), n;
          }) : (j(c, o), P(f, c));
        }
        if (!r || "object" != typeof r) {
          if (void 0 === (f = i(r)) && (f = r), f === H && (f = void 0), e.D && d(f, !0), o) {
            var p = [],
              l = [];
            b("Patches").M(r, f, p, l), o(p, l);
          }
          return f;
        }
        n(21, r);
      }, this.produceWithPatches = function (n, r) {
        if ("function" == typeof n) return function (r) {
          for (var t = arguments.length, i = Array(t > 1 ? t - 1 : 0), o = 1; o < t; o++) i[o - 1] = arguments[o];
          return e.produceWithPatches(r, function (r) {
            return n.apply(void 0, [r].concat(i));
          });
        };
        var t,
          i,
          o = e.produce(n, r, function (n, r) {
            t = n, i = r;
          });
        return "undefined" != typeof Promise && o instanceof Promise ? o.then(function (n) {
          return [n, t, i];
        }) : [o, t, i];
      }, "boolean" == typeof (null == r ? void 0 : r.useProxies) && this.setUseProxies(r.useProxies), "boolean" == typeof (null == r ? void 0 : r.autoFreeze) && this.setAutoFreeze(r.autoFreeze);
    }
    var i = e.prototype;
    return i.createDraft = function (e) {
      t(e) || n(8), r(e) && (e = R(e));
      var i = w(this),
        o = N(this, e, void 0);
      return o[Q].C = !0, g(i), o;
    }, i.finishDraft = function (r, t) {
      var e = r && r[Q];
       false && (0);
      var i = e.A;
      return j(i, t), P(void 0, i);
    }, i.setAutoFreeze = function (n) {
      this.D = n;
    }, i.setUseProxies = function (r) {
      r && !B && n(20), this.g = r;
    }, i.applyPatches = function (n, t) {
      var e;
      for (e = t.length - 1; e >= 0; e--) {
        var i = t[e];
        if (0 === i.path.length && "replace" === i.op) {
          n = i.value;
          break;
        }
      }
      e > -1 && (t = t.slice(e + 1));
      var o = b("Patches").$;
      return r(n) ? o(n, t) : this.produce(n, function (n) {
        return o(n, t);
      });
    }, e;
  }(),
  an = new un(),
  fn = an.produce,
  cn = an.produceWithPatches.bind(an),
  sn = an.setAutoFreeze.bind(an),
  vn = an.setUseProxies.bind(an),
  pn = an.applyPatches.bind(an),
  ln = an.createDraft.bind(an),
  dn = an.finishDraft.bind(an);
/* harmony default export */ var immer_esm = (fn);

//# sourceMappingURL=immer.esm.js.map
;// CONCATENATED MODULE: ./node_modules/redux/es/redux.js


/**
 * Adapted from React: https://github.com/facebook/react/blob/master/packages/shared/formatProdErrorMessage.js
 *
 * Do not require this module directly! Use normal throw error calls. These messages will be replaced with error codes
 * during build.
 * @param {number} code
 */
function formatProdErrorMessage(code) {
  return "Minified Redux error #" + code + "; visit https://redux.js.org/Errors?code=" + code + " for the full message or " + 'use the non-minified dev environment for full errors. ';
}

// Inlined version of the `symbol-observable` polyfill
var $$observable = function () {
  return typeof Symbol === 'function' && Symbol.observable || '@@observable';
}();

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var randomString = function randomString() {
  return Math.random().toString(36).substring(7).split('').join('.');
};
var ActionTypes = {
  INIT: "@@redux/INIT" + randomString(),
  REPLACE: "@@redux/REPLACE" + randomString(),
  PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
    return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
  }
};

/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */
function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  var proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}

// Inlined / shortened version of `kindOf` from https://github.com/jonschlinkert/kind-of
function miniKindOf(val) {
  if (val === void 0) return 'undefined';
  if (val === null) return 'null';
  var type = typeof val;
  switch (type) {
    case 'boolean':
    case 'string':
    case 'number':
    case 'symbol':
    case 'function':
      {
        return type;
      }
  }
  if (Array.isArray(val)) return 'array';
  if (isDate(val)) return 'date';
  if (isError(val)) return 'error';
  var constructorName = ctorName(val);
  switch (constructorName) {
    case 'Symbol':
    case 'Promise':
    case 'WeakMap':
    case 'WeakSet':
    case 'Map':
    case 'Set':
      return constructorName;
  } // other

  return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
}
function ctorName(val) {
  return typeof val.constructor === 'function' ? val.constructor.name : null;
}
function isError(val) {
  return val instanceof Error || typeof val.message === 'string' && val.constructor && typeof val.constructor.stackTraceLimit === 'number';
}
function isDate(val) {
  if (val instanceof Date) return true;
  return typeof val.toDateString === 'function' && typeof val.getDate === 'function' && typeof val.setDate === 'function';
}
function kindOf(val) {
  var typeOfVal = typeof val;
  if (false) {}
  return typeOfVal;
}

/**
 * @deprecated
 *
 * **We recommend using the `configureStore` method
 * of the `@reduxjs/toolkit` package**, which replaces `createStore`.
 *
 * Redux Toolkit is our recommended approach for writing Redux logic today,
 * including store setup, reducers, data fetching, and more.
 *
 * **For more details, please read this Redux docs page:**
 * **https://redux.js.org/introduction/why-rtk-is-redux-today**
 *
 * `configureStore` from Redux Toolkit is an improved version of `createStore` that
 * simplifies setup and helps avoid common bugs.
 *
 * You should not be using the `redux` core package by itself today, except for learning purposes.
 * The `createStore` method from the core `redux` package will not be removed, but we encourage
 * all users to migrate to using Redux Toolkit for all Redux code.
 *
 * If you want to use `createStore` without this visual deprecation warning, use
 * the `legacy_createStore` import instead:
 *
 * `import { legacy_createStore as createStore} from 'redux'`
 *
 */

function createStore(reducer, preloadedState, enhancer) {
  var _ref2;
  if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
    throw new Error( true ? formatProdErrorMessage(0) : 0);
  }
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error( true ? formatProdErrorMessage(1) : 0);
    }
    return enhancer(createStore)(reducer, preloadedState);
  }
  if (typeof reducer !== 'function') {
    throw new Error( true ? formatProdErrorMessage(2) : 0);
  }
  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;
  /**
   * This makes a shallow copy of currentListeners so we can use
   * nextListeners as a temporary list while dispatching.
   *
   * This prevents any bugs around consumers calling
   * subscribe/unsubscribe in the middle of a dispatch.
   */

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }
  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */

  function getState() {
    if (isDispatching) {
      throw new Error( true ? formatProdErrorMessage(3) : 0);
    }
    return currentState;
  }
  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error( true ? formatProdErrorMessage(4) : 0);
    }
    if (isDispatching) {
      throw new Error( true ? formatProdErrorMessage(5) : 0);
    }
    var isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      if (isDispatching) {
        throw new Error( true ? formatProdErrorMessage(6) : 0);
      }
      isSubscribed = false;
      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }
  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */

  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error( true ? formatProdErrorMessage(7) : 0);
    }
    if (typeof action.type === 'undefined') {
      throw new Error( true ? formatProdErrorMessage(8) : 0);
    }
    if (isDispatching) {
      throw new Error( true ? formatProdErrorMessage(9) : 0);
    }
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }
    return action;
  }
  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */

  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error( true ? formatProdErrorMessage(10) : 0);
    }
    currentReducer = nextReducer; // This action has a similiar effect to ActionTypes.INIT.
    // Any reducers that existed in both the new and old rootReducer
    // will receive the previous state. This effectively populates
    // the new state tree with any relevant data from the old one.

    dispatch({
      type: ActionTypes.REPLACE
    });
  }
  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */

  function observable() {
    var _ref;
    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new Error( true ? formatProdErrorMessage(11) : 0);
        }
        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }
        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe: unsubscribe
        };
      }
    }, _ref[$$observable] = function () {
      return this;
    }, _ref;
  } // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.

  dispatch({
    type: ActionTypes.INIT
  });
  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[$$observable] = observable, _ref2;
}
/**
 * Creates a Redux store that holds the state tree.
 *
 * **We recommend using `configureStore` from the
 * `@reduxjs/toolkit` package**, which replaces `createStore`:
 * **https://redux.js.org/introduction/why-rtk-is-redux-today**
 *
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */

var legacy_createStore = (/* unused pure expression or super */ null && (createStore));

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */

  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
  } catch (e) {} // eslint-disable-line no-empty
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';
  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }
  if (!isPlainObject(inputState)) {
    return "The " + argumentName + " has unexpected type of \"" + kindOf(inputState) + "\". Expected argument to be an object with the following " + ("keys: \"" + reducerKeys.join('", "') + "\"");
  }
  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });
  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });
  if (action && action.type === ActionTypes.REPLACE) return;
  if (unexpectedKeys.length > 0) {
    return "Unexpected " + (unexpectedKeys.length > 1 ? 'keys' : 'key') + " " + ("\"" + unexpectedKeys.join('", "') + "\" found in " + argumentName + ". ") + "Expected to find one of the known reducer keys instead: " + ("\"" + reducerKeys.join('", "') + "\". Unexpected keys will be ignored.");
  }
}
function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, {
      type: ActionTypes.INIT
    });
    if (typeof initialState === 'undefined') {
      throw new Error( true ? formatProdErrorMessage(12) : 0);
    }
    if (typeof reducer(undefined, {
      type: ActionTypes.PROBE_UNKNOWN_ACTION()
    }) === 'undefined') {
      throw new Error( true ? formatProdErrorMessage(13) : 0);
    }
  });
}
/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */

function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];
    if (false) {}
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers); // This is used to make sure we don't warn about the same
  // keys multiple times.

  var unexpectedKeyCache;
  if (false) {}
  var shapeAssertionError;
  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }
  return function combination(state, action) {
    if (state === void 0) {
      state = {};
    }
    if (shapeAssertionError) {
      throw shapeAssertionError;
    }
    if (false) { var warningMessage; }
    var hasChanged = false;
    var nextState = {};
    for (var _i = 0; _i < finalReducerKeys.length; _i++) {
      var _key = finalReducerKeys[_i];
      var reducer = finalReducers[_key];
      var previousStateForKey = state[_key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var actionType = action && action.type;
        throw new Error( true ? formatProdErrorMessage(14) : 0);
      }
      nextState[_key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments));
  };
}
/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass an action creator as the first argument,
 * and get a dispatch wrapped function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */

function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error( true ? formatProdErrorMessage(16) : 0);
  }
  var boundActionCreators = {};
  for (var key in actionCreators) {
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }
  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */

function applyMiddleware() {
  for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }
  return function (createStore) {
    return function () {
      var store = createStore.apply(void 0, arguments);
      var _dispatch = function dispatch() {
        throw new Error( true ? formatProdErrorMessage(15) : 0);
      };
      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch() {
          return _dispatch.apply(void 0, arguments);
        }
      };
      var chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = compose.apply(void 0, chain)(store.dispatch);
      return _objectSpread2(_objectSpread2({}, store), {}, {
        dispatch: _dispatch
      });
    };
  };
}

;// CONCATENATED MODULE: ./node_modules/redux-thunk/es/index.js
/** A function that accepts a potential "extra argument" value to be injected later,
 * and returns an instance of the thunk middleware that uses that value
 */
function createThunkMiddleware(extraArgument) {
  // Standard Redux middleware definition pattern:
  // See: https://redux.js.org/tutorials/fundamentals/part-4-store#writing-custom-middleware
  var middleware = function middleware(_ref) {
    var dispatch = _ref.dispatch,
      getState = _ref.getState;
    return function (next) {
      return function (action) {
        // The thunk middleware looks for any functions that were passed to `store.dispatch`.
        // If this "action" is really a function, call it and return the result.
        if (typeof action === 'function') {
          // Inject the store's `dispatch` and `getState` methods, as well as any "extra arg"
          return action(dispatch, getState, extraArgument);
        } // Otherwise, pass the action down the middleware chain as usual

        return next(action);
      };
    };
  };
  return middleware;
}
var thunk = createThunkMiddleware(); // Attach the factory function so users can create a customized version
// with whatever "extra arg" they want to inject into their thunks

thunk.withExtraArgument = createThunkMiddleware;
/* harmony default export */ var es = (thunk);
;// CONCATENATED MODULE: ./node_modules/@reduxjs/toolkit/dist/redux-toolkit.esm.js
var __extends = undefined && undefined.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return _extendStatics(d, b);
  };
  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    _extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var __generator = undefined && undefined.__generator || function (thisArg, body) {
  var _ = {
      label: 0,
      sent: function sent() {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    },
    f,
    y,
    t,
    g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }
          if (t && _.label < t[2]) {
            _.label = t[2];
            _.ops.push(op);
            break;
          }
          if (t[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};
var __spreadArray = undefined && undefined.__spreadArray || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) to[j] = from[i];
  return to;
};
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = function __defNormalProp(obj, key, value) {
  return key in obj ? __defProp(obj, key, {
    enumerable: true,
    configurable: true,
    writable: true,
    value: value
  }) : obj[key] = value;
};
var __spreadValues = function __spreadValues(a, b) {
  for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols) for (var _i = 0, _c = __getOwnPropSymbols(b); _i < _c.length; _i++) {
    var prop = _c[_i];
    if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  }
  return a;
};
var __spreadProps = function __spreadProps(a, b) {
  return __defProps(a, __getOwnPropDescs(b));
};
var __async = function __async(__this, __arguments, generator) {
  return new Promise(function (resolve, reject) {
    var fulfilled = function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = function rejected(value) {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = function step(x) {
      return x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    };
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
// src/index.ts




// src/createDraftSafeSelector.ts


var createDraftSafeSelector = function createDraftSafeSelector() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  var selector = createSelector.apply(void 0, args);
  var wrappedSelector = function wrappedSelector(value) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      rest[_i - 1] = arguments[_i];
    }
    return selector.apply(void 0, __spreadArray([isDraft(value) ? current(value) : value], rest));
  };
  return wrappedSelector;
};
// src/configureStore.ts

// src/devtoolsExtension.ts

var composeWithDevTools = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : function () {
  if (arguments.length === 0) return void 0;
  if (typeof arguments[0] === "object") return compose;
  return compose.apply(null, arguments);
};
var devToolsEnhancer = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__ : function () {
  return function (noop2) {
    return noop2;
  };
};
// src/isPlainObject.ts
function redux_toolkit_esm_isPlainObject(value) {
  if (typeof value !== "object" || value === null) return false;
  var proto = Object.getPrototypeOf(value);
  if (proto === null) return true;
  var baseProto = proto;
  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto);
  }
  return proto === baseProto;
}
// src/getDefaultMiddleware.ts

// src/utils.ts

function getTimeMeasureUtils(maxDelay, fnName) {
  var elapsed = 0;
  return {
    measureTime: function measureTime(fn) {
      var started = Date.now();
      try {
        return fn();
      } finally {
        var finished = Date.now();
        elapsed += finished - started;
      }
    },
    warnIfExceeded: function warnIfExceeded() {
      if (elapsed > maxDelay) {
        console.warn(fnName + " took " + elapsed + "ms, which is more than the warning threshold of " + maxDelay + "ms. \nIf your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.\nIt is disabled in production builds, so you don't need to worry about that.");
      }
    }
  };
}
var MiddlewareArray = /** @class */function (_super) {
  __extends(MiddlewareArray, _super);
  function MiddlewareArray() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var _this = _super.apply(this, args) || this;
    Object.setPrototypeOf(_this, MiddlewareArray.prototype);
    return _this;
  }
  Object.defineProperty(MiddlewareArray, Symbol.species, {
    get: function get() {
      return MiddlewareArray;
    },
    enumerable: false,
    configurable: true
  });
  MiddlewareArray.prototype.concat = function () {
    var arr = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      arr[_i] = arguments[_i];
    }
    return _super.prototype.concat.apply(this, arr);
  };
  MiddlewareArray.prototype.prepend = function () {
    var arr = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      arr[_i] = arguments[_i];
    }
    if (arr.length === 1 && Array.isArray(arr[0])) {
      return new (MiddlewareArray.bind.apply(MiddlewareArray, __spreadArray([void 0], arr[0].concat(this))))();
    }
    return new (MiddlewareArray.bind.apply(MiddlewareArray, __spreadArray([void 0], arr.concat(this))))();
  };
  return MiddlewareArray;
}(Array);
function freezeDraftable(val) {
  return t(val) ? immer_esm(val, function () {}) : val;
}
// src/immutableStateInvariantMiddleware.ts
var isProduction = (/* unused pure expression or super */ null && ("production" === "production"));
var prefix = "Invariant failed";
function invariant(condition, message) {
  if (condition) {
    return;
  }
  if (isProduction) {
    throw new Error(prefix);
  }
  throw new Error(prefix + ": " + (message || ""));
}
function stringify(obj, serializer, indent, decycler) {
  return JSON.stringify(obj, getSerialize(serializer, decycler), indent);
}
function getSerialize(serializer, decycler) {
  var stack = [],
    keys = [];
  if (!decycler) decycler = function decycler(_, value) {
    if (stack[0] === value) return "[Circular ~]";
    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
  };
  return function (key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this);
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
      if (~stack.indexOf(value)) value = decycler.call(this, key, value);
    } else stack.push(value);
    return serializer == null ? value : serializer.call(this, key, value);
  };
}
function isImmutableDefault(value) {
  return typeof value !== "object" || value == null || Object.isFrozen(value);
}
function trackForMutations(isImmutable, ignorePaths, obj) {
  var trackedProperties = trackProperties(isImmutable, ignorePaths, obj);
  return {
    detectMutations: function detectMutations() {
      return _detectMutations(isImmutable, ignorePaths, trackedProperties, obj);
    }
  };
}
function trackProperties(isImmutable, ignorePaths, obj, path) {
  if (ignorePaths === void 0) {
    ignorePaths = [];
  }
  if (path === void 0) {
    path = "";
  }
  var tracked = {
    value: obj
  };
  if (!isImmutable(obj)) {
    tracked.children = {};
    for (var key in obj) {
      var childPath = path ? path + "." + key : key;
      if (ignorePaths.length && ignorePaths.indexOf(childPath) !== -1) {
        continue;
      }
      tracked.children[key] = trackProperties(isImmutable, ignorePaths, obj[key], childPath);
    }
  }
  return tracked;
}
function _detectMutations(isImmutable, ignoredPaths, trackedProperty, obj, sameParentRef, path) {
  if (ignoredPaths === void 0) {
    ignoredPaths = [];
  }
  if (sameParentRef === void 0) {
    sameParentRef = false;
  }
  if (path === void 0) {
    path = "";
  }
  var prevObj = trackedProperty ? trackedProperty.value : void 0;
  var sameRef = prevObj === obj;
  if (sameParentRef && !sameRef && !Number.isNaN(obj)) {
    return {
      wasMutated: true,
      path: path
    };
  }
  if (isImmutable(prevObj) || isImmutable(obj)) {
    return {
      wasMutated: false
    };
  }
  var keysToDetect = {};
  for (var key in trackedProperty.children) {
    keysToDetect[key] = true;
  }
  for (var key in obj) {
    keysToDetect[key] = true;
  }
  var hasIgnoredPaths = ignoredPaths.length > 0;
  var _loop_1 = function _loop_1(key) {
    var nestedPath = path ? path + "." + key : key;
    if (hasIgnoredPaths) {
      var hasMatches = ignoredPaths.some(function (ignored) {
        if (ignored instanceof RegExp) {
          return ignored.test(nestedPath);
        }
        return nestedPath === ignored;
      });
      if (hasMatches) {
        return "continue";
      }
    }
    var result = _detectMutations(isImmutable, ignoredPaths, trackedProperty.children[key], obj[key], sameRef, nestedPath);
    if (result.wasMutated) {
      return {
        value: result
      };
    }
  };
  for (var key in keysToDetect) {
    var state_1 = _loop_1(key);
    if (typeof state_1 === "object") return state_1.value;
  }
  return {
    wasMutated: false
  };
}
function createImmutableStateInvariantMiddleware(options) {
  if (options === void 0) {
    options = {};
  }
  if (true) {
    return function () {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }
  var _c = options.isImmutable,
    isImmutable = _c === void 0 ? isImmutableDefault : _c,
    ignoredPaths = options.ignoredPaths,
    _d = options.warnAfter,
    warnAfter = _d === void 0 ? 32 : _d,
    ignore = options.ignore;
  ignoredPaths = ignoredPaths || ignore;
  var track = trackForMutations.bind(null, isImmutable, ignoredPaths);
  return function (_c) {
    var getState = _c.getState;
    var state = getState();
    var tracker = track(state);
    var result;
    return function (next) {
      return function (action) {
        var measureUtils = getTimeMeasureUtils(warnAfter, "ImmutableStateInvariantMiddleware");
        measureUtils.measureTime(function () {
          state = getState();
          result = tracker.detectMutations();
          tracker = track(state);
          invariant(!result.wasMutated, "A state mutation was detected between dispatches, in the path '" + (result.path || "") + "'.  This may cause incorrect behavior. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)");
        });
        var dispatchedAction = next(action);
        measureUtils.measureTime(function () {
          state = getState();
          result = tracker.detectMutations();
          tracker = track(state);
          result.wasMutated && invariant(!result.wasMutated, "A state mutation was detected inside a dispatch, in the path: " + (result.path || "") + ". Take a look at the reducer(s) handling the action " + stringify(action) + ". (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)");
        });
        measureUtils.warnIfExceeded();
        return dispatchedAction;
      };
    };
  };
}
// src/serializableStateInvariantMiddleware.ts
function isPlain(val) {
  var type = typeof val;
  return val == null || type === "string" || type === "boolean" || type === "number" || Array.isArray(val) || redux_toolkit_esm_isPlainObject(val);
}
function findNonSerializableValue(value, path, isSerializable, getEntries, ignoredPaths, cache) {
  if (path === void 0) {
    path = "";
  }
  if (isSerializable === void 0) {
    isSerializable = isPlain;
  }
  if (ignoredPaths === void 0) {
    ignoredPaths = [];
  }
  var foundNestedSerializable;
  if (!isSerializable(value)) {
    return {
      keyPath: path || "<root>",
      value: value
    };
  }
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (cache == null ? void 0 : cache.has(value)) return false;
  var entries = getEntries != null ? getEntries(value) : Object.entries(value);
  var hasIgnoredPaths = ignoredPaths.length > 0;
  var _loop_2 = function _loop_2(key, nestedValue) {
    var nestedPath = path ? path + "." + key : key;
    if (hasIgnoredPaths) {
      var hasMatches = ignoredPaths.some(function (ignored) {
        if (ignored instanceof RegExp) {
          return ignored.test(nestedPath);
        }
        return nestedPath === ignored;
      });
      if (hasMatches) {
        return "continue";
      }
    }
    if (!isSerializable(nestedValue)) {
      return {
        value: {
          keyPath: nestedPath,
          value: nestedValue
        }
      };
    }
    if (typeof nestedValue === "object") {
      foundNestedSerializable = findNonSerializableValue(nestedValue, nestedPath, isSerializable, getEntries, ignoredPaths, cache);
      if (foundNestedSerializable) {
        return {
          value: foundNestedSerializable
        };
      }
    }
  };
  for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
    var _c = entries_1[_i],
      key = _c[0],
      nestedValue = _c[1];
    var state_2 = _loop_2(key, nestedValue);
    if (typeof state_2 === "object") return state_2.value;
  }
  if (cache && isNestedFrozen(value)) cache.add(value);
  return false;
}
function isNestedFrozen(value) {
  if (!Object.isFrozen(value)) return false;
  for (var _i = 0, _c = Object.values(value); _i < _c.length; _i++) {
    var nestedValue = _c[_i];
    if (typeof nestedValue !== "object" || nestedValue === null) continue;
    if (!isNestedFrozen(nestedValue)) return false;
  }
  return true;
}
function createSerializableStateInvariantMiddleware(options) {
  if (options === void 0) {
    options = {};
  }
  if (true) {
    return function () {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }
  var _c = options.isSerializable,
    isSerializable = _c === void 0 ? isPlain : _c,
    getEntries = options.getEntries,
    _d = options.ignoredActions,
    ignoredActions = _d === void 0 ? [] : _d,
    _e = options.ignoredActionPaths,
    ignoredActionPaths = _e === void 0 ? ["meta.arg", "meta.baseQueryMeta"] : _e,
    _f = options.ignoredPaths,
    ignoredPaths = _f === void 0 ? [] : _f,
    _g = options.warnAfter,
    warnAfter = _g === void 0 ? 32 : _g,
    _h = options.ignoreState,
    ignoreState = _h === void 0 ? false : _h,
    _j = options.ignoreActions,
    ignoreActions = _j === void 0 ? false : _j,
    _k = options.disableCache,
    disableCache = _k === void 0 ? false : _k;
  var cache = !disableCache && WeakSet ? new WeakSet() : void 0;
  return function (storeAPI) {
    return function (next) {
      return function (action) {
        var result = next(action);
        var measureUtils = getTimeMeasureUtils(warnAfter, "SerializableStateInvariantMiddleware");
        if (!ignoreActions && !(ignoredActions.length && ignoredActions.indexOf(action.type) !== -1)) {
          measureUtils.measureTime(function () {
            var foundActionNonSerializableValue = findNonSerializableValue(action, "", isSerializable, getEntries, ignoredActionPaths, cache);
            if (foundActionNonSerializableValue) {
              var keyPath = foundActionNonSerializableValue.keyPath,
                value = foundActionNonSerializableValue.value;
              console.error("A non-serializable value was detected in an action, in the path: `" + keyPath + "`. Value:", value, "\nTake a look at the logic that dispatched this action: ", action, "\n(See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)", "\n(To allow non-serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)");
            }
          });
        }
        if (!ignoreState) {
          measureUtils.measureTime(function () {
            var state = storeAPI.getState();
            var foundStateNonSerializableValue = findNonSerializableValue(state, "", isSerializable, getEntries, ignoredPaths, cache);
            if (foundStateNonSerializableValue) {
              var keyPath = foundStateNonSerializableValue.keyPath,
                value = foundStateNonSerializableValue.value;
              console.error("A non-serializable value was detected in the state, in the path: `" + keyPath + "`. Value:", value, "\nTake a look at the reducer(s) handling this action type: " + action.type + ".\n(See https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)");
            }
          });
          measureUtils.warnIfExceeded();
        }
        return result;
      };
    };
  };
}
// src/getDefaultMiddleware.ts
function isBoolean(x) {
  return typeof x === "boolean";
}
function curryGetDefaultMiddleware() {
  return function curriedGetDefaultMiddleware(options) {
    return getDefaultMiddleware(options);
  };
}
function getDefaultMiddleware(options) {
  if (options === void 0) {
    options = {};
  }
  var _c = options.thunk,
    thunk = _c === void 0 ? true : _c,
    _d = options.immutableCheck,
    immutableCheck = _d === void 0 ? true : _d,
    _e = options.serializableCheck,
    serializableCheck = _e === void 0 ? true : _e;
  var middlewareArray = new MiddlewareArray();
  if (thunk) {
    if (isBoolean(thunk)) {
      middlewareArray.push(es);
    } else {
      middlewareArray.push(es.withExtraArgument(thunk.extraArgument));
    }
  }
  if (false) { var serializableOptions, immutableOptions; }
  return middlewareArray;
}
// src/configureStore.ts
var IS_PRODUCTION = "production" === "production";
function configureStore(options) {
  var curriedGetDefaultMiddleware = curryGetDefaultMiddleware();
  var _c = options || {},
    _d = _c.reducer,
    reducer = _d === void 0 ? void 0 : _d,
    _e = _c.middleware,
    middleware = _e === void 0 ? curriedGetDefaultMiddleware() : _e,
    _f = _c.devTools,
    devTools = _f === void 0 ? true : _f,
    _g = _c.preloadedState,
    preloadedState = _g === void 0 ? void 0 : _g,
    _h = _c.enhancers,
    enhancers = _h === void 0 ? void 0 : _h;
  var rootReducer;
  if (typeof reducer === "function") {
    rootReducer = reducer;
  } else if (redux_toolkit_esm_isPlainObject(reducer)) {
    rootReducer = combineReducers(reducer);
  } else {
    throw new Error('"reducer" is a required argument, and must be a function or an object of functions that can be passed to combineReducers');
  }
  var finalMiddleware = middleware;
  if (typeof finalMiddleware === "function") {
    finalMiddleware = finalMiddleware(curriedGetDefaultMiddleware);
    if (!IS_PRODUCTION && !Array.isArray(finalMiddleware)) {
      throw new Error("when using a middleware builder function, an array of middleware must be returned");
    }
  }
  if (!IS_PRODUCTION && finalMiddleware.some(function (item) {
    return typeof item !== "function";
  })) {
    throw new Error("each middleware provided to configureStore must be a function");
  }
  var middlewareEnhancer = applyMiddleware.apply(void 0, finalMiddleware);
  var finalCompose = compose;
  if (devTools) {
    finalCompose = composeWithDevTools(__spreadValues({
      trace: !IS_PRODUCTION
    }, typeof devTools === "object" && devTools));
  }
  var storeEnhancers = [middlewareEnhancer];
  if (Array.isArray(enhancers)) {
    storeEnhancers = __spreadArray([middlewareEnhancer], enhancers);
  } else if (typeof enhancers === "function") {
    storeEnhancers = enhancers(storeEnhancers);
  }
  var composedEnhancer = finalCompose.apply(void 0, storeEnhancers);
  return createStore(rootReducer, preloadedState, composedEnhancer);
}
// src/createAction.ts
function createAction(type, prepareAction) {
  function actionCreator() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    if (prepareAction) {
      var prepared = prepareAction.apply(void 0, args);
      if (!prepared) {
        throw new Error("prepareAction did not return an object");
      }
      return __spreadValues(__spreadValues({
        type: type,
        payload: prepared.payload
      }, "meta" in prepared && {
        meta: prepared.meta
      }), "error" in prepared && {
        error: prepared.error
      });
    }
    return {
      type: type,
      payload: args[0]
    };
  }
  actionCreator.toString = function () {
    return "" + type;
  };
  actionCreator.type = type;
  actionCreator.match = function (action) {
    return action.type === type;
  };
  return actionCreator;
}
function isFSA(action) {
  return redux_toolkit_esm_isPlainObject(action) && typeof action.type === "string" && Object.keys(action).every(isValidKey);
}
function isValidKey(key) {
  return ["type", "payload", "error", "meta"].indexOf(key) > -1;
}
function getType(actionCreator) {
  return "" + actionCreator;
}
// src/createReducer.ts

// src/mapBuilders.ts
function executeReducerBuilderCallback(builderCallback) {
  var actionsMap = {};
  var actionMatchers = [];
  var defaultCaseReducer;
  var builder = {
    addCase: function addCase(typeOrActionCreator, reducer) {
      if (false) {}
      var type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
      if (type in actionsMap) {
        throw new Error("addCase cannot be called with two reducers for the same action type");
      }
      actionsMap[type] = reducer;
      return builder;
    },
    addMatcher: function addMatcher(matcher, reducer) {
      if (false) {}
      actionMatchers.push({
        matcher: matcher,
        reducer: reducer
      });
      return builder;
    },
    addDefaultCase: function addDefaultCase(reducer) {
      if (false) {}
      defaultCaseReducer = reducer;
      return builder;
    }
  };
  builderCallback(builder);
  return [actionsMap, actionMatchers, defaultCaseReducer];
}
// src/createReducer.ts
function isStateFunction(x) {
  return typeof x === "function";
}
var hasWarnedAboutObjectNotation = false;
function createReducer(initialState, mapOrBuilderCallback, actionMatchers, defaultCaseReducer) {
  if (actionMatchers === void 0) {
    actionMatchers = [];
  }
  if (false) {}
  var _c = typeof mapOrBuilderCallback === "function" ? executeReducerBuilderCallback(mapOrBuilderCallback) : [mapOrBuilderCallback, actionMatchers, defaultCaseReducer],
    actionsMap = _c[0],
    finalActionMatchers = _c[1],
    finalDefaultCaseReducer = _c[2];
  var getInitialState;
  if (isStateFunction(initialState)) {
    getInitialState = function getInitialState() {
      return freezeDraftable(initialState());
    };
  } else {
    var frozenInitialState_1 = freezeDraftable(initialState);
    getInitialState = function getInitialState() {
      return frozenInitialState_1;
    };
  }
  function reducer(state, action) {
    if (state === void 0) {
      state = getInitialState();
    }
    var caseReducers = __spreadArray([actionsMap[action.type]], finalActionMatchers.filter(function (_c) {
      var matcher = _c.matcher;
      return matcher(action);
    }).map(function (_c) {
      var reducer2 = _c.reducer;
      return reducer2;
    }));
    if (caseReducers.filter(function (cr) {
      return !!cr;
    }).length === 0) {
      caseReducers = [finalDefaultCaseReducer];
    }
    return caseReducers.reduce(function (previousState, caseReducer) {
      if (caseReducer) {
        if (r(previousState)) {
          var draft = previousState;
          var result = caseReducer(draft, action);
          if (result === void 0) {
            return previousState;
          }
          return result;
        } else if (!t(previousState)) {
          var result = caseReducer(previousState, action);
          if (result === void 0) {
            if (previousState === null) {
              return previousState;
            }
            throw Error("A case reducer on a non-draftable value must not return undefined");
          }
          return result;
        } else {
          return immer_esm(previousState, function (draft) {
            return caseReducer(draft, action);
          });
        }
      }
      return previousState;
    }, state);
  }
  reducer.getInitialState = getInitialState;
  return reducer;
}
// src/createSlice.ts
var hasWarnedAboutObjectNotation2 = false;
function getType2(slice, actionKey) {
  return slice + "/" + actionKey;
}
function createSlice(options) {
  var name = options.name;
  if (!name) {
    throw new Error("`name` is a required option for createSlice");
  }
  if (typeof process !== "undefined" && "production" === "development") {}
  var initialState = typeof options.initialState == "function" ? options.initialState : freezeDraftable(options.initialState);
  var reducers = options.reducers || {};
  var reducerNames = Object.keys(reducers);
  var sliceCaseReducersByName = {};
  var sliceCaseReducersByType = {};
  var actionCreators = {};
  reducerNames.forEach(function (reducerName) {
    var maybeReducerWithPrepare = reducers[reducerName];
    var type = getType2(name, reducerName);
    var caseReducer;
    var prepareCallback;
    if ("reducer" in maybeReducerWithPrepare) {
      caseReducer = maybeReducerWithPrepare.reducer;
      prepareCallback = maybeReducerWithPrepare.prepare;
    } else {
      caseReducer = maybeReducerWithPrepare;
    }
    sliceCaseReducersByName[reducerName] = caseReducer;
    sliceCaseReducersByType[type] = caseReducer;
    actionCreators[reducerName] = prepareCallback ? createAction(type, prepareCallback) : createAction(type);
  });
  function buildReducer() {
    if (false) {}
    var _c = typeof options.extraReducers === "function" ? executeReducerBuilderCallback(options.extraReducers) : [options.extraReducers],
      _d = _c[0],
      extraReducers = _d === void 0 ? {} : _d,
      _e = _c[1],
      actionMatchers = _e === void 0 ? [] : _e,
      _f = _c[2],
      defaultCaseReducer = _f === void 0 ? void 0 : _f;
    var finalCaseReducers = __spreadValues(__spreadValues({}, extraReducers), sliceCaseReducersByType);
    return createReducer(initialState, function (builder) {
      for (var key in finalCaseReducers) {
        builder.addCase(key, finalCaseReducers[key]);
      }
      for (var _i = 0, actionMatchers_1 = actionMatchers; _i < actionMatchers_1.length; _i++) {
        var m = actionMatchers_1[_i];
        builder.addMatcher(m.matcher, m.reducer);
      }
      if (defaultCaseReducer) {
        builder.addDefaultCase(defaultCaseReducer);
      }
    });
  }
  var _reducer;
  return {
    name: name,
    reducer: function reducer(state, action) {
      if (!_reducer) _reducer = buildReducer();
      return _reducer(state, action);
    },
    actions: actionCreators,
    caseReducers: sliceCaseReducersByName,
    getInitialState: function getInitialState() {
      if (!_reducer) _reducer = buildReducer();
      return _reducer.getInitialState();
    }
  };
}
// src/entities/entity_state.ts
function getInitialEntityState() {
  return {
    ids: [],
    entities: {}
  };
}
function createInitialStateFactory() {
  function getInitialState(additionalState) {
    if (additionalState === void 0) {
      additionalState = {};
    }
    return Object.assign(getInitialEntityState(), additionalState);
  }
  return {
    getInitialState: getInitialState
  };
}
// src/entities/state_selectors.ts
function createSelectorsFactory() {
  function getSelectors(selectState) {
    var selectIds = function selectIds(state) {
      return state.ids;
    };
    var selectEntities = function selectEntities(state) {
      return state.entities;
    };
    var selectAll = createDraftSafeSelector(selectIds, selectEntities, function (ids, entities) {
      return ids.map(function (id) {
        return entities[id];
      });
    });
    var selectId = function selectId(_, id) {
      return id;
    };
    var selectById = function selectById(entities, id) {
      return entities[id];
    };
    var selectTotal = createDraftSafeSelector(selectIds, function (ids) {
      return ids.length;
    });
    if (!selectState) {
      return {
        selectIds: selectIds,
        selectEntities: selectEntities,
        selectAll: selectAll,
        selectTotal: selectTotal,
        selectById: createDraftSafeSelector(selectEntities, selectId, selectById)
      };
    }
    var selectGlobalizedEntities = createDraftSafeSelector(selectState, selectEntities);
    return {
      selectIds: createDraftSafeSelector(selectState, selectIds),
      selectEntities: selectGlobalizedEntities,
      selectAll: createDraftSafeSelector(selectState, selectAll),
      selectTotal: createDraftSafeSelector(selectState, selectTotal),
      selectById: createDraftSafeSelector(selectGlobalizedEntities, selectId, selectById)
    };
  }
  return {
    getSelectors: getSelectors
  };
}
// src/entities/state_adapter.ts

function createSingleArgumentStateOperator(mutator) {
  var operator = createStateOperator(function (_, state) {
    return mutator(state);
  });
  return function operation(state) {
    return operator(state, void 0);
  };
}
function createStateOperator(mutator) {
  return function operation(state, arg) {
    function isPayloadActionArgument(arg2) {
      return isFSA(arg2);
    }
    var runMutator = function runMutator(draft) {
      if (isPayloadActionArgument(arg)) {
        mutator(arg.payload, draft);
      } else {
        mutator(arg, draft);
      }
    };
    if (isDraft3(state)) {
      runMutator(state);
      return state;
    } else {
      return createNextState3(state, runMutator);
    }
  };
}
// src/entities/utils.ts
function selectIdValue(entity, selectId) {
  var key = selectId(entity);
  if (false) {}
  return key;
}
function ensureEntitiesArray(entities) {
  if (!Array.isArray(entities)) {
    entities = Object.values(entities);
  }
  return entities;
}
function splitAddedUpdatedEntities(newEntities, selectId, state) {
  newEntities = ensureEntitiesArray(newEntities);
  var added = [];
  var updated = [];
  for (var _i = 0, newEntities_1 = newEntities; _i < newEntities_1.length; _i++) {
    var entity = newEntities_1[_i];
    var id = selectIdValue(entity, selectId);
    if (id in state.entities) {
      updated.push({
        id: id,
        changes: entity
      });
    } else {
      added.push(entity);
    }
  }
  return [added, updated];
}
// src/entities/unsorted_state_adapter.ts
function createUnsortedStateAdapter(selectId) {
  function addOneMutably(entity, state) {
    var key = selectIdValue(entity, selectId);
    if (key in state.entities) {
      return;
    }
    state.ids.push(key);
    state.entities[key] = entity;
  }
  function addManyMutably(newEntities, state) {
    newEntities = ensureEntitiesArray(newEntities);
    for (var _i = 0, newEntities_2 = newEntities; _i < newEntities_2.length; _i++) {
      var entity = newEntities_2[_i];
      addOneMutably(entity, state);
    }
  }
  function setOneMutably(entity, state) {
    var key = selectIdValue(entity, selectId);
    if (!(key in state.entities)) {
      state.ids.push(key);
    }
    state.entities[key] = entity;
  }
  function setManyMutably(newEntities, state) {
    newEntities = ensureEntitiesArray(newEntities);
    for (var _i = 0, newEntities_3 = newEntities; _i < newEntities_3.length; _i++) {
      var entity = newEntities_3[_i];
      setOneMutably(entity, state);
    }
  }
  function setAllMutably(newEntities, state) {
    newEntities = ensureEntitiesArray(newEntities);
    state.ids = [];
    state.entities = {};
    addManyMutably(newEntities, state);
  }
  function removeOneMutably(key, state) {
    return removeManyMutably([key], state);
  }
  function removeManyMutably(keys, state) {
    var didMutate = false;
    keys.forEach(function (key) {
      if (key in state.entities) {
        delete state.entities[key];
        didMutate = true;
      }
    });
    if (didMutate) {
      state.ids = state.ids.filter(function (id) {
        return id in state.entities;
      });
    }
  }
  function removeAllMutably(state) {
    Object.assign(state, {
      ids: [],
      entities: {}
    });
  }
  function takeNewKey(keys, update, state) {
    var original2 = state.entities[update.id];
    var updated = Object.assign({}, original2, update.changes);
    var newKey = selectIdValue(updated, selectId);
    var hasNewKey = newKey !== update.id;
    if (hasNewKey) {
      keys[update.id] = newKey;
      delete state.entities[update.id];
    }
    state.entities[newKey] = updated;
    return hasNewKey;
  }
  function updateOneMutably(update, state) {
    return updateManyMutably([update], state);
  }
  function updateManyMutably(updates, state) {
    var newKeys = {};
    var updatesPerEntity = {};
    updates.forEach(function (update) {
      if (update.id in state.entities) {
        updatesPerEntity[update.id] = {
          id: update.id,
          changes: __spreadValues(__spreadValues({}, updatesPerEntity[update.id] ? updatesPerEntity[update.id].changes : null), update.changes)
        };
      }
    });
    updates = Object.values(updatesPerEntity);
    var didMutateEntities = updates.length > 0;
    if (didMutateEntities) {
      var didMutateIds = updates.filter(function (update) {
        return takeNewKey(newKeys, update, state);
      }).length > 0;
      if (didMutateIds) {
        state.ids = Object.keys(state.entities);
      }
    }
  }
  function upsertOneMutably(entity, state) {
    return upsertManyMutably([entity], state);
  }
  function upsertManyMutably(newEntities, state) {
    var _c = splitAddedUpdatedEntities(newEntities, selectId, state),
      added = _c[0],
      updated = _c[1];
    updateManyMutably(updated, state);
    addManyMutably(added, state);
  }
  return {
    removeAll: createSingleArgumentStateOperator(removeAllMutably),
    addOne: createStateOperator(addOneMutably),
    addMany: createStateOperator(addManyMutably),
    setOne: createStateOperator(setOneMutably),
    setMany: createStateOperator(setManyMutably),
    setAll: createStateOperator(setAllMutably),
    updateOne: createStateOperator(updateOneMutably),
    updateMany: createStateOperator(updateManyMutably),
    upsertOne: createStateOperator(upsertOneMutably),
    upsertMany: createStateOperator(upsertManyMutably),
    removeOne: createStateOperator(removeOneMutably),
    removeMany: createStateOperator(removeManyMutably)
  };
}
// src/entities/sorted_state_adapter.ts
function createSortedStateAdapter(selectId, sort) {
  var _c = createUnsortedStateAdapter(selectId),
    removeOne = _c.removeOne,
    removeMany = _c.removeMany,
    removeAll = _c.removeAll;
  function addOneMutably(entity, state) {
    return addManyMutably([entity], state);
  }
  function addManyMutably(newEntities, state) {
    newEntities = ensureEntitiesArray(newEntities);
    var models = newEntities.filter(function (model) {
      return !(selectIdValue(model, selectId) in state.entities);
    });
    if (models.length !== 0) {
      merge(models, state);
    }
  }
  function setOneMutably(entity, state) {
    return setManyMutably([entity], state);
  }
  function setManyMutably(newEntities, state) {
    newEntities = ensureEntitiesArray(newEntities);
    if (newEntities.length !== 0) {
      merge(newEntities, state);
    }
  }
  function setAllMutably(newEntities, state) {
    newEntities = ensureEntitiesArray(newEntities);
    state.entities = {};
    state.ids = [];
    addManyMutably(newEntities, state);
  }
  function updateOneMutably(update, state) {
    return updateManyMutably([update], state);
  }
  function updateManyMutably(updates, state) {
    var appliedUpdates = false;
    for (var _i = 0, updates_1 = updates; _i < updates_1.length; _i++) {
      var update = updates_1[_i];
      var entity = state.entities[update.id];
      if (!entity) {
        continue;
      }
      appliedUpdates = true;
      Object.assign(entity, update.changes);
      var newId = selectId(entity);
      if (update.id !== newId) {
        delete state.entities[update.id];
        state.entities[newId] = entity;
      }
    }
    if (appliedUpdates) {
      resortEntities(state);
    }
  }
  function upsertOneMutably(entity, state) {
    return upsertManyMutably([entity], state);
  }
  function upsertManyMutably(newEntities, state) {
    var _c = splitAddedUpdatedEntities(newEntities, selectId, state),
      added = _c[0],
      updated = _c[1];
    updateManyMutably(updated, state);
    addManyMutably(added, state);
  }
  function areArraysEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    for (var i = 0; i < a.length && i < b.length; i++) {
      if (a[i] === b[i]) {
        continue;
      }
      return false;
    }
    return true;
  }
  function merge(models, state) {
    models.forEach(function (model) {
      state.entities[selectId(model)] = model;
    });
    resortEntities(state);
  }
  function resortEntities(state) {
    var allEntities = Object.values(state.entities);
    allEntities.sort(sort);
    var newSortedIds = allEntities.map(selectId);
    var ids = state.ids;
    if (!areArraysEqual(ids, newSortedIds)) {
      state.ids = newSortedIds;
    }
  }
  return {
    removeOne: removeOne,
    removeMany: removeMany,
    removeAll: removeAll,
    addOne: createStateOperator(addOneMutably),
    updateOne: createStateOperator(updateOneMutably),
    upsertOne: createStateOperator(upsertOneMutably),
    setOne: createStateOperator(setOneMutably),
    setMany: createStateOperator(setManyMutably),
    setAll: createStateOperator(setAllMutably),
    addMany: createStateOperator(addManyMutably),
    updateMany: createStateOperator(updateManyMutably),
    upsertMany: createStateOperator(upsertManyMutably)
  };
}
// src/entities/create_adapter.ts
function createEntityAdapter(options) {
  if (options === void 0) {
    options = {};
  }
  var _c = __spreadValues({
      sortComparer: false,
      selectId: function selectId(instance) {
        return instance.id;
      }
    }, options),
    selectId = _c.selectId,
    sortComparer = _c.sortComparer;
  var stateFactory = createInitialStateFactory();
  var selectorsFactory = createSelectorsFactory();
  var stateAdapter = sortComparer ? createSortedStateAdapter(selectId, sortComparer) : createUnsortedStateAdapter(selectId);
  return __spreadValues(__spreadValues(__spreadValues({
    selectId: selectId,
    sortComparer: sortComparer
  }, stateFactory), selectorsFactory), stateAdapter);
}
// src/nanoid.ts
var urlAlphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW";
var nanoid = function nanoid(size) {
  if (size === void 0) {
    size = 21;
  }
  var id = "";
  var i = size;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};
// src/createAsyncThunk.ts
var commonProperties = ["name", "message", "stack", "code"];
var RejectWithValue = /** @class */function () {
  function RejectWithValue(payload, meta) {
    this.payload = payload;
    this.meta = meta;
  }
  return RejectWithValue;
}();
var FulfillWithMeta = /** @class */function () {
  function FulfillWithMeta(payload, meta) {
    this.payload = payload;
    this.meta = meta;
  }
  return FulfillWithMeta;
}();
var miniSerializeError = function miniSerializeError(value) {
  if (typeof value === "object" && value !== null) {
    var simpleError = {};
    for (var _i = 0, commonProperties_1 = commonProperties; _i < commonProperties_1.length; _i++) {
      var property = commonProperties_1[_i];
      if (typeof value[property] === "string") {
        simpleError[property] = value[property];
      }
    }
    return simpleError;
  }
  return {
    message: String(value)
  };
};
var createAsyncThunk = function () {
  function createAsyncThunk2(typePrefix, payloadCreator, options) {
    var fulfilled = createAction(typePrefix + "/fulfilled", function (payload, requestId, arg, meta) {
      return {
        payload: payload,
        meta: __spreadProps(__spreadValues({}, meta || {}), {
          arg: arg,
          requestId: requestId,
          requestStatus: "fulfilled"
        })
      };
    });
    var pending = createAction(typePrefix + "/pending", function (requestId, arg, meta) {
      return {
        payload: void 0,
        meta: __spreadProps(__spreadValues({}, meta || {}), {
          arg: arg,
          requestId: requestId,
          requestStatus: "pending"
        })
      };
    });
    var rejected = createAction(typePrefix + "/rejected", function (error, requestId, arg, payload, meta) {
      return {
        payload: payload,
        error: (options && options.serializeError || miniSerializeError)(error || "Rejected"),
        meta: __spreadProps(__spreadValues({}, meta || {}), {
          arg: arg,
          requestId: requestId,
          rejectedWithValue: !!payload,
          requestStatus: "rejected",
          aborted: (error == null ? void 0 : error.name) === "AbortError",
          condition: (error == null ? void 0 : error.name) === "ConditionError"
        })
      };
    });
    var displayedWarning = false;
    var AC = typeof AbortController !== "undefined" ? AbortController : /** @class */function () {
      function class_1() {
        this.signal = {
          aborted: false,
          addEventListener: function addEventListener() {},
          dispatchEvent: function dispatchEvent() {
            return false;
          },
          onabort: function onabort() {},
          removeEventListener: function removeEventListener() {},
          reason: void 0,
          throwIfAborted: function throwIfAborted() {}
        };
      }
      class_1.prototype.abort = function () {
        if (false) {}
      };
      return class_1;
    }();
    function actionCreator(arg) {
      return function (dispatch, getState, extra) {
        var requestId = (options == null ? void 0 : options.idGenerator) ? options.idGenerator(arg) : nanoid();
        var abortController = new AC();
        var abortReason;
        var started = false;
        function abort(reason) {
          abortReason = reason;
          abortController.abort();
        }
        var promise2 = function () {
          return __async(this, null, function () {
            var _a, _b, finalAction, conditionResult, abortedPromise, err_1, skipDispatch;
            return __generator(this, function (_c) {
              switch (_c.label) {
                case 0:
                  _c.trys.push([0, 4,, 5]);
                  conditionResult = (_a = options == null ? void 0 : options.condition) == null ? void 0 : _a.call(options, arg, {
                    getState: getState,
                    extra: extra
                  });
                  if (!isThenable(conditionResult)) return [3 /*break*/, 2];
                  return [4 /*yield*/, conditionResult];
                case 1:
                  conditionResult = _c.sent();
                  _c.label = 2;
                case 2:
                  if (conditionResult === false || abortController.signal.aborted) {
                    throw {
                      name: "ConditionError",
                      message: "Aborted due to condition callback returning false."
                    };
                  }
                  started = true;
                  abortedPromise = new Promise(function (_, reject) {
                    return abortController.signal.addEventListener("abort", function () {
                      return reject({
                        name: "AbortError",
                        message: abortReason || "Aborted"
                      });
                    });
                  });
                  dispatch(pending(requestId, arg, (_b = options == null ? void 0 : options.getPendingMeta) == null ? void 0 : _b.call(options, {
                    requestId: requestId,
                    arg: arg
                  }, {
                    getState: getState,
                    extra: extra
                  })));
                  return [4 /*yield*/, Promise.race([abortedPromise, Promise.resolve(payloadCreator(arg, {
                    dispatch: dispatch,
                    getState: getState,
                    extra: extra,
                    requestId: requestId,
                    signal: abortController.signal,
                    abort: abort,
                    rejectWithValue: function rejectWithValue(value, meta) {
                      return new RejectWithValue(value, meta);
                    },
                    fulfillWithValue: function fulfillWithValue(value, meta) {
                      return new FulfillWithMeta(value, meta);
                    }
                  })).then(function (result) {
                    if (result instanceof RejectWithValue) {
                      throw result;
                    }
                    if (result instanceof FulfillWithMeta) {
                      return fulfilled(result.payload, requestId, arg, result.meta);
                    }
                    return fulfilled(result, requestId, arg);
                  })])];
                case 3:
                  finalAction = _c.sent();
                  return [3 /*break*/, 5];
                case 4:
                  err_1 = _c.sent();
                  finalAction = err_1 instanceof RejectWithValue ? rejected(null, requestId, arg, err_1.payload, err_1.meta) : rejected(err_1, requestId, arg);
                  return [3 /*break*/, 5];
                case 5:
                  skipDispatch = options && !options.dispatchConditionRejection && rejected.match(finalAction) && finalAction.meta.condition;
                  if (!skipDispatch) {
                    dispatch(finalAction);
                  }
                  return [2 /*return*/, finalAction];
              }
            });
          });
        }();
        return Object.assign(promise2, {
          abort: abort,
          requestId: requestId,
          arg: arg,
          unwrap: function unwrap() {
            return promise2.then(unwrapResult);
          }
        });
      };
    }
    return Object.assign(actionCreator, {
      pending: pending,
      rejected: rejected,
      fulfilled: fulfilled,
      typePrefix: typePrefix
    });
  }
  createAsyncThunk2.withTypes = function () {
    return createAsyncThunk2;
  };
  return createAsyncThunk2;
}();
function unwrapResult(action) {
  if (action.meta && action.meta.rejectedWithValue) {
    throw action.payload;
  }
  if (action.error) {
    throw action.error;
  }
  return action.payload;
}
function isThenable(value) {
  return value !== null && typeof value === "object" && typeof value.then === "function";
}
// src/tsHelpers.ts
var hasMatchFunction = function hasMatchFunction(v) {
  return v && typeof v.match === "function";
};
// src/matchers.ts
var matches = function matches(matcher, action) {
  if (hasMatchFunction(matcher)) {
    return matcher.match(action);
  } else {
    return matcher(action);
  }
};
function isAnyOf() {
  var matchers = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    matchers[_i] = arguments[_i];
  }
  return function (action) {
    return matchers.some(function (matcher) {
      return matches(matcher, action);
    });
  };
}
function isAllOf() {
  var matchers = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    matchers[_i] = arguments[_i];
  }
  return function (action) {
    return matchers.every(function (matcher) {
      return matches(matcher, action);
    });
  };
}
function hasExpectedRequestMetadata(action, validStatus) {
  if (!action || !action.meta) return false;
  var hasValidRequestId = typeof action.meta.requestId === "string";
  var hasValidRequestStatus = validStatus.indexOf(action.meta.requestStatus) > -1;
  return hasValidRequestId && hasValidRequestStatus;
}
function isAsyncThunkArray(a) {
  return typeof a[0] === "function" && "pending" in a[0] && "fulfilled" in a[0] && "rejected" in a[0];
}
function isPending() {
  var asyncThunks = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    asyncThunks[_i] = arguments[_i];
  }
  if (asyncThunks.length === 0) {
    return function (action) {
      return hasExpectedRequestMetadata(action, ["pending"]);
    };
  }
  if (!isAsyncThunkArray(asyncThunks)) {
    return isPending()(asyncThunks[0]);
  }
  return function (action) {
    var matchers = asyncThunks.map(function (asyncThunk) {
      return asyncThunk.pending;
    });
    var combinedMatcher = isAnyOf.apply(void 0, matchers);
    return combinedMatcher(action);
  };
}
function isRejected() {
  var asyncThunks = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    asyncThunks[_i] = arguments[_i];
  }
  if (asyncThunks.length === 0) {
    return function (action) {
      return hasExpectedRequestMetadata(action, ["rejected"]);
    };
  }
  if (!isAsyncThunkArray(asyncThunks)) {
    return isRejected()(asyncThunks[0]);
  }
  return function (action) {
    var matchers = asyncThunks.map(function (asyncThunk) {
      return asyncThunk.rejected;
    });
    var combinedMatcher = isAnyOf.apply(void 0, matchers);
    return combinedMatcher(action);
  };
}
function isRejectedWithValue() {
  var asyncThunks = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    asyncThunks[_i] = arguments[_i];
  }
  var hasFlag = function hasFlag(action) {
    return action && action.meta && action.meta.rejectedWithValue;
  };
  if (asyncThunks.length === 0) {
    return function (action) {
      var combinedMatcher = isAllOf(isRejected.apply(void 0, asyncThunks), hasFlag);
      return combinedMatcher(action);
    };
  }
  if (!isAsyncThunkArray(asyncThunks)) {
    return isRejectedWithValue()(asyncThunks[0]);
  }
  return function (action) {
    var combinedMatcher = isAllOf(isRejected.apply(void 0, asyncThunks), hasFlag);
    return combinedMatcher(action);
  };
}
function isFulfilled() {
  var asyncThunks = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    asyncThunks[_i] = arguments[_i];
  }
  if (asyncThunks.length === 0) {
    return function (action) {
      return hasExpectedRequestMetadata(action, ["fulfilled"]);
    };
  }
  if (!isAsyncThunkArray(asyncThunks)) {
    return isFulfilled()(asyncThunks[0]);
  }
  return function (action) {
    var matchers = asyncThunks.map(function (asyncThunk) {
      return asyncThunk.fulfilled;
    });
    var combinedMatcher = isAnyOf.apply(void 0, matchers);
    return combinedMatcher(action);
  };
}
function isAsyncThunkAction() {
  var asyncThunks = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    asyncThunks[_i] = arguments[_i];
  }
  if (asyncThunks.length === 0) {
    return function (action) {
      return hasExpectedRequestMetadata(action, ["pending", "fulfilled", "rejected"]);
    };
  }
  if (!isAsyncThunkArray(asyncThunks)) {
    return isAsyncThunkAction()(asyncThunks[0]);
  }
  return function (action) {
    var matchers = [];
    for (var _i = 0, asyncThunks_1 = asyncThunks; _i < asyncThunks_1.length; _i++) {
      var asyncThunk = asyncThunks_1[_i];
      matchers.push(asyncThunk.pending, asyncThunk.rejected, asyncThunk.fulfilled);
    }
    var combinedMatcher = isAnyOf.apply(void 0, matchers);
    return combinedMatcher(action);
  };
}
// src/listenerMiddleware/utils.ts
var assertFunction = function assertFunction(func, expected) {
  if (typeof func !== "function") {
    throw new TypeError(expected + " is not a function");
  }
};
var noop = function noop() {};
var catchRejection = function catchRejection(promise2, onError) {
  if (onError === void 0) {
    onError = noop;
  }
  promise2.catch(onError);
  return promise2;
};
var addAbortSignalListener = function addAbortSignalListener(abortSignal, callback) {
  abortSignal.addEventListener("abort", callback, {
    once: true
  });
  return function () {
    return abortSignal.removeEventListener("abort", callback);
  };
};
var abortControllerWithReason = function abortControllerWithReason(abortController, reason) {
  var signal = abortController.signal;
  if (signal.aborted) {
    return;
  }
  if (!("reason" in signal)) {
    Object.defineProperty(signal, "reason", {
      enumerable: true,
      value: reason,
      configurable: true,
      writable: true
    });
  }
  ;
  abortController.abort(reason);
};
// src/listenerMiddleware/exceptions.ts
var task = "task";
var listener = "listener";
var completed = "completed";
var cancelled = "cancelled";
var taskCancelled = "task-" + cancelled;
var taskCompleted = "task-" + completed;
var listenerCancelled = listener + "-" + cancelled;
var listenerCompleted = listener + "-" + completed;
var TaskAbortError = /** @class */function () {
  function TaskAbortError(code) {
    this.code = code;
    this.name = "TaskAbortError";
    this.message = task + " " + cancelled + " (reason: " + code + ")";
  }
  return TaskAbortError;
}();
// src/listenerMiddleware/task.ts
var validateActive = function validateActive(signal) {
  if (signal.aborted) {
    throw new TaskAbortError(signal.reason);
  }
};
function raceWithSignal(signal, promise2) {
  var cleanup = noop;
  return new Promise(function (resolve, reject) {
    var notifyRejection = function notifyRejection() {
      return reject(new TaskAbortError(signal.reason));
    };
    if (signal.aborted) {
      notifyRejection();
      return;
    }
    cleanup = addAbortSignalListener(signal, notifyRejection);
    promise2.finally(function () {
      return cleanup();
    }).then(resolve, reject);
  }).finally(function () {
    cleanup = noop;
  });
}
var runTask = function runTask(task2, cleanUp) {
  return __async(void 0, null, function () {
    var value, error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 3, 4, 5]);
          return [4 /*yield*/, Promise.resolve()];
        case 1:
          _c.sent();
          return [4 /*yield*/, task2()];
        case 2:
          value = _c.sent();
          return [2 /*return*/, {
            status: "ok",
            value: value
          }];
        case 3:
          error_1 = _c.sent();
          return [2 /*return*/, {
            status: error_1 instanceof TaskAbortError ? "cancelled" : "rejected",
            error: error_1
          }];
        case 4:
          cleanUp == null ? void 0 : cleanUp();
          return [7 /*endfinally*/];
        case 5:
          return [2 /*return*/];
      }
    });
  });
};

var createPause = function createPause(signal) {
  return function (promise2) {
    return catchRejection(raceWithSignal(signal, promise2).then(function (output) {
      validateActive(signal);
      return output;
    }));
  };
};
var createDelay = function createDelay(signal) {
  var pause = createPause(signal);
  return function (timeoutMs) {
    return pause(new Promise(function (resolve) {
      return setTimeout(resolve, timeoutMs);
    }));
  };
};
// src/listenerMiddleware/index.ts
var redux_toolkit_esm_assign = Object.assign;
var INTERNAL_NIL_TOKEN = {};
var alm = "listenerMiddleware";
var createFork = function createFork(parentAbortSignal) {
  var linkControllers = function linkControllers(controller) {
    return addAbortSignalListener(parentAbortSignal, function () {
      return abortControllerWithReason(controller, parentAbortSignal.reason);
    });
  };
  return function (taskExecutor) {
    assertFunction(taskExecutor, "taskExecutor");
    var childAbortController = new AbortController();
    linkControllers(childAbortController);
    var result = runTask(function () {
      return __async(void 0, null, function () {
        var result2;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              validateActive(parentAbortSignal);
              validateActive(childAbortController.signal);
              return [4 /*yield*/, taskExecutor({
                pause: createPause(childAbortController.signal),
                delay: createDelay(childAbortController.signal),
                signal: childAbortController.signal
              })];
            case 1:
              result2 = _c.sent();
              validateActive(childAbortController.signal);
              return [2 /*return*/, result2];
          }
        });
      });
    }, function () {
      return abortControllerWithReason(childAbortController, taskCompleted);
    });
    return {
      result: createPause(parentAbortSignal)(result),
      cancel: function cancel() {
        abortControllerWithReason(childAbortController, taskCancelled);
      }
    };
  };
};
var createTakePattern = function createTakePattern(startListening, signal) {
  var take = function take(predicate, timeout) {
    return __async(void 0, null, function () {
      var unsubscribe, tuplePromise, promises, output;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            validateActive(signal);
            unsubscribe = function unsubscribe() {};
            tuplePromise = new Promise(function (resolve, reject) {
              var stopListening = startListening({
                predicate: predicate,
                effect: function effect(action, listenerApi) {
                  listenerApi.unsubscribe();
                  resolve([action, listenerApi.getState(), listenerApi.getOriginalState()]);
                }
              });
              unsubscribe = function unsubscribe() {
                stopListening();
                reject();
              };
            });
            promises = [tuplePromise];
            if (timeout != null) {
              promises.push(new Promise(function (resolve) {
                return setTimeout(resolve, timeout, null);
              }));
            }
            _c.label = 1;
          case 1:
            _c.trys.push([1,, 3, 4]);
            return [4 /*yield*/, raceWithSignal(signal, Promise.race(promises))];
          case 2:
            output = _c.sent();
            validateActive(signal);
            return [2 /*return*/, output];
          case 3:
            unsubscribe();
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };

  return function (predicate, timeout) {
    return catchRejection(take(predicate, timeout));
  };
};
var getListenerEntryPropsFrom = function getListenerEntryPropsFrom(options) {
  var type = options.type,
    actionCreator = options.actionCreator,
    matcher = options.matcher,
    predicate = options.predicate,
    effect = options.effect;
  if (type) {
    predicate = createAction(type).match;
  } else if (actionCreator) {
    type = actionCreator.type;
    predicate = actionCreator.match;
  } else if (matcher) {
    predicate = matcher;
  } else if (predicate) {} else {
    throw new Error("Creating or removing a listener requires one of the known fields for matching an action");
  }
  assertFunction(effect, "options.listener");
  return {
    predicate: predicate,
    type: type,
    effect: effect
  };
};
var createListenerEntry = function createListenerEntry(options) {
  var _c = getListenerEntryPropsFrom(options),
    type = _c.type,
    predicate = _c.predicate,
    effect = _c.effect;
  var id = nanoid();
  var entry = {
    id: id,
    effect: effect,
    type: type,
    predicate: predicate,
    pending: new Set(),
    unsubscribe: function unsubscribe() {
      throw new Error("Unsubscribe not initialized");
    }
  };
  return entry;
};
var cancelActiveListeners = function cancelActiveListeners(entry) {
  entry.pending.forEach(function (controller) {
    abortControllerWithReason(controller, listenerCancelled);
  });
};
var createClearListenerMiddleware = function createClearListenerMiddleware(listenerMap) {
  return function () {
    listenerMap.forEach(cancelActiveListeners);
    listenerMap.clear();
  };
};
var safelyNotifyError = function safelyNotifyError(errorHandler, errorToNotify, errorInfo) {
  try {
    errorHandler(errorToNotify, errorInfo);
  } catch (errorHandlerError) {
    setTimeout(function () {
      throw errorHandlerError;
    }, 0);
  }
};
var addListener = createAction(alm + "/add");
var clearAllListeners = createAction(alm + "/removeAll");
var removeListener = createAction(alm + "/remove");
var defaultErrorHandler = function defaultErrorHandler() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  console.error.apply(console, __spreadArray([alm + "/error"], args));
};
function createListenerMiddleware(middlewareOptions) {
  var _this = this;
  if (middlewareOptions === void 0) {
    middlewareOptions = {};
  }
  var listenerMap = new Map();
  var extra = middlewareOptions.extra,
    _c = middlewareOptions.onError,
    onError = _c === void 0 ? defaultErrorHandler : _c;
  assertFunction(onError, "onError");
  var insertEntry = function insertEntry(entry) {
    entry.unsubscribe = function () {
      return listenerMap.delete(entry.id);
    };
    listenerMap.set(entry.id, entry);
    return function (cancelOptions) {
      entry.unsubscribe();
      if (cancelOptions == null ? void 0 : cancelOptions.cancelActive) {
        cancelActiveListeners(entry);
      }
    };
  };
  var findListenerEntry = function findListenerEntry(comparator) {
    for (var _i = 0, _c = Array.from(listenerMap.values()); _i < _c.length; _i++) {
      var entry = _c[_i];
      if (comparator(entry)) {
        return entry;
      }
    }
    return void 0;
  };
  var startListening = function startListening(options) {
    var entry = findListenerEntry(function (existingEntry) {
      return existingEntry.effect === options.effect;
    });
    if (!entry) {
      entry = createListenerEntry(options);
    }
    return insertEntry(entry);
  };
  var stopListening = function stopListening(options) {
    var _c = getListenerEntryPropsFrom(options),
      type = _c.type,
      effect = _c.effect,
      predicate = _c.predicate;
    var entry = findListenerEntry(function (entry2) {
      var matchPredicateOrType = typeof type === "string" ? entry2.type === type : entry2.predicate === predicate;
      return matchPredicateOrType && entry2.effect === effect;
    });
    if (entry) {
      entry.unsubscribe();
      if (options.cancelActive) {
        cancelActiveListeners(entry);
      }
    }
    return !!entry;
  };
  var notifyListener = function notifyListener(entry, action, api, getOriginalState) {
    return __async(_this, null, function () {
      var internalTaskController, take, listenerError_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            internalTaskController = new AbortController();
            take = createTakePattern(startListening, internalTaskController.signal);
            _c.label = 1;
          case 1:
            _c.trys.push([1, 3, 4, 5]);
            entry.pending.add(internalTaskController);
            return [4 /*yield*/, Promise.resolve(entry.effect(action, redux_toolkit_esm_assign({}, api, {
              getOriginalState: getOriginalState,
              condition: function condition(predicate, timeout) {
                return take(predicate, timeout).then(Boolean);
              },
              take: take,
              delay: createDelay(internalTaskController.signal),
              pause: createPause(internalTaskController.signal),
              extra: extra,
              signal: internalTaskController.signal,
              fork: createFork(internalTaskController.signal),
              unsubscribe: entry.unsubscribe,
              subscribe: function subscribe() {
                listenerMap.set(entry.id, entry);
              },
              cancelActiveListeners: function cancelActiveListeners() {
                entry.pending.forEach(function (controller, _, set) {
                  if (controller !== internalTaskController) {
                    abortControllerWithReason(controller, listenerCancelled);
                    set.delete(controller);
                  }
                });
              }
            })))];
          case 2:
            _c.sent();
            return [3 /*break*/, 5];
          case 3:
            listenerError_1 = _c.sent();
            if (!(listenerError_1 instanceof TaskAbortError)) {
              safelyNotifyError(onError, listenerError_1, {
                raisedBy: "effect"
              });
            }
            return [3 /*break*/, 5];
          case 4:
            abortControllerWithReason(internalTaskController, listenerCompleted);
            entry.pending.delete(internalTaskController);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };

  var clearListenerMiddleware = createClearListenerMiddleware(listenerMap);
  var middleware = function middleware(api) {
    return function (next) {
      return function (action) {
        if (addListener.match(action)) {
          return startListening(action.payload);
        }
        if (clearAllListeners.match(action)) {
          clearListenerMiddleware();
          return;
        }
        if (removeListener.match(action)) {
          return stopListening(action.payload);
        }
        var originalState = api.getState();
        var getOriginalState = function getOriginalState() {
          if (originalState === INTERNAL_NIL_TOKEN) {
            throw new Error(alm + ": getOriginalState can only be called synchronously");
          }
          return originalState;
        };
        var result;
        try {
          result = next(action);
          if (listenerMap.size > 0) {
            var currentState = api.getState();
            var listenerEntries = Array.from(listenerMap.values());
            for (var _i = 0, listenerEntries_1 = listenerEntries; _i < listenerEntries_1.length; _i++) {
              var entry = listenerEntries_1[_i];
              var runListener = false;
              try {
                runListener = entry.predicate(action, currentState, originalState);
              } catch (predicateError) {
                runListener = false;
                safelyNotifyError(onError, predicateError, {
                  raisedBy: "predicate"
                });
              }
              if (!runListener) {
                continue;
              }
              notifyListener(entry, action, api, getOriginalState);
            }
          }
        } finally {
          originalState = INTERNAL_NIL_TOKEN;
        }
        return result;
      };
    };
  };
  return {
    middleware: middleware,
    startListening: startListening,
    stopListening: stopListening,
    clearListeners: clearListenerMiddleware
  };
}
// src/autoBatchEnhancer.ts
var SHOULD_AUTOBATCH = "RTK_autoBatch";
var prepareAutoBatched = function prepareAutoBatched() {
  return function (payload) {
    var _c;
    return {
      payload: payload,
      meta: (_c = {}, _c[SHOULD_AUTOBATCH] = true, _c)
    };
  };
};
var promise;
var queueMicrotaskShim = typeof queueMicrotask === "function" ? queueMicrotask.bind(typeof window !== "undefined" ? window : typeof __webpack_require__.g !== "undefined" ? __webpack_require__.g : globalThis) : function (cb) {
  return (promise || (promise = Promise.resolve())).then(cb).catch(function (err) {
    return setTimeout(function () {
      throw err;
    }, 0);
  });
};
var createQueueWithTimer = function createQueueWithTimer(timeout) {
  return function (notify) {
    setTimeout(notify, timeout);
  };
};
var rAF = typeof window !== "undefined" && window.requestAnimationFrame ? window.requestAnimationFrame : createQueueWithTimer(10);
var autoBatchEnhancer = function autoBatchEnhancer(options) {
  if (options === void 0) {
    options = {
      type: "raf"
    };
  }
  return function (next) {
    return function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      var store = next.apply(void 0, args);
      var notifying = true;
      var shouldNotifyAtEndOfTick = false;
      var notificationQueued = false;
      var listeners = new Set();
      var queueCallback = options.type === "tick" ? queueMicrotaskShim : options.type === "raf" ? rAF : options.type === "callback" ? options.queueNotification : createQueueWithTimer(options.timeout);
      var notifyListeners = function notifyListeners() {
        notificationQueued = false;
        if (shouldNotifyAtEndOfTick) {
          shouldNotifyAtEndOfTick = false;
          listeners.forEach(function (l) {
            return l();
          });
        }
      };
      return Object.assign({}, store, {
        subscribe: function subscribe(listener2) {
          var wrappedListener = function wrappedListener() {
            return notifying && listener2();
          };
          var unsubscribe = store.subscribe(wrappedListener);
          listeners.add(listener2);
          return function () {
            unsubscribe();
            listeners.delete(listener2);
          };
        },
        dispatch: function dispatch(action) {
          var _a;
          try {
            notifying = !((_a = action == null ? void 0 : action.meta) == null ? void 0 : _a[SHOULD_AUTOBATCH]);
            shouldNotifyAtEndOfTick = !notifying;
            if (shouldNotifyAtEndOfTick) {
              if (!notificationQueued) {
                notificationQueued = true;
                queueCallback(notifyListeners);
              }
            }
            return store.dispatch(action);
          } finally {
            notifying = true;
          }
        }
      });
    };
  };
};
// src/index.ts
F();

//# sourceMappingURL=redux-toolkit.esm.js.map
// EXTERNAL MODULE: ./node_modules/webext-redux/lib/index.js
var lib = __webpack_require__(3723);
// EXTERNAL MODULE: ./node_modules/webextension-polyfill/dist/browser-polyfill.js
var browser_polyfill = __webpack_require__(930);
var browser_polyfill_default = /*#__PURE__*/__webpack_require__.n(browser_polyfill);
// EXTERNAL MODULE: ./node_modules/redux-logger/dist/redux-logger.js
var redux_logger = __webpack_require__(6748);
;// CONCATENATED MODULE: ./src/Store/reducer/auth.js
var userState={pass:null,accounts:[],currentAccount:{accountName:"",temp1m:"",evmAddress:"",nativeAddress:"",txHistory:[]},newAccount:null,uiData:{},httpEndPoints:{qa:"https://qa-http-nodes.5ire.network",testnet:"https://rpc-testnet.5ire.network"// testnet: "http://52.15.41.233:9933"
},wsEndPoints:{qa:"wss://qa-wss-nodes.5ire.network",testnet:"wss://wss-testnet.5ire.network"// testnet: "ws://52.15.41.233:9944"
},balance:{evmBalance:"",nativeBalance:"",totalBalance:""},currentNetwork:"Testnet",// currentNetwork: "QA",
accountName:"","eth_accounts":'',isLogin:false,// passError: false,
connectedSites:[],isLoading:false// isApiReady:false,
};var userSlice=createSlice({name:"auth",initialState:userState,reducers:{setPassword:function setPassword(state,action){state.pass=action.payload;},setCurrentAcc:function setCurrentAcc(state,action){state.currentAccount=action.payload;},setAccounts:function setAccounts(state,action){state.accounts=action.payload;},pushAccounts:function pushAccounts(state,action){state.accounts.push(action.payload);},setLogin:function setLogin(state,action){state.isLogin=action.payload;},setUIdata:function setUIdata(state,action){state.uiData=action.payload;},setAccountName:function setAccountName(state,action){state.accountName=action.payload;},setNewAccount:function setNewAccount(state,action){state.newAccount=action.payload;},setCurrentNetwork:function setCurrentNetwork(state,action){state.currentNetwork=action.payload;},// setBalance: (state, action) => {
//   if (action.payload.of === "evm")
//     state.balance.evmBalance = action.payload.balance;
//   else if (action.payload.of === "native")
//     state.balance.nativeBalance = action.payload.balance;
// },
setBalance:function setBalance(state,action){state.balance.evmBalance=action.payload.evmBalance;state.balance.nativeBalance=action.payload.nativeBalance;state.balance.totalBalance=action.payload.totalBalance;},resetBalance:function resetBalance(state){state.balance={evmBalance:"",nativeBalance:""};},setTxHistory:function setTxHistory(state,action){state.accounts[action.payload.index].txHistory.push(action.payload.data);state.currentAccount.txHistory.push(action.payload.data);},updateTxHistory:function updateTxHistory(state,action){var currentTx=state.currentAccount.txHistory.find(function(item){if(action.payload.isSwap)return item.txHash.mainHash===action.payload.txHash&&item.isEvm;return item.txHash===action.payload.txHash&&item.isEvm;});var otherAcc=state.accounts.find(function(item){return item.accountName===action.payload.accountName;});var otherTx=otherAcc.txHistory.find(function(item){if(action.payload.isSwap)return item.txHash.mainHash===action.payload.txHash&&item.isEvm;return item.txHash===action.payload.txHash&&item.isEvm;});if(currentTx)currentTx.status=action.payload.status?"Success":"Failed";if(otherTx)otherTx.status=action.payload.status?"Success":"Failed";},setSite:function setSite(state,action){state===null||state===void 0?void 0:state.connectedSites.push(action.payload);},toggleSite:function toggleSite(state,action){var siteIndex=state===null||state===void 0?void 0:state.connectedSites.findIndex(function(st){return st.origin=action.payload.origin;});if(siteIndex>-1){state.connectedSites[siteIndex].isConnected=action.payload.isConnected;// state.connectedSites.splice(siteIndex,1,action.payload)
}},toggleLoader:function toggleLoader(state,action){state.isLoading=action.payload;}// setApiReady : (state, action) => {
//   state.isApiReady = action.payload;
// }
}});// Action creators are generated for each case reducer function
var _userSlice$actions=userSlice.actions,setPassword=_userSlice$actions.setPassword,setCurrentAcc=_userSlice$actions.setCurrentAcc,setLogin=_userSlice$actions.setLogin,setAccountName=_userSlice$actions.setAccountName,setAccounts=_userSlice$actions.setAccounts,setCurrentNetwork=_userSlice$actions.setCurrentNetwork,setUIdata=_userSlice$actions.setUIdata,setBalance=_userSlice$actions.setBalance,setTxHistory=_userSlice$actions.setTxHistory,setSite=_userSlice$actions.setSite,toggleSite=_userSlice$actions.toggleSite,toggleLoader=_userSlice$actions.toggleLoader,pushAccounts=_userSlice$actions.pushAccounts,setNewAccount=_userSlice$actions.setNewAccount,resetBalance=_userSlice$actions.resetBalance,updateTxHistory=_userSlice$actions.updateTxHistory;/* harmony default export */ var auth = (userSlice.reducer);
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
function _iterableToArrayLimit(arr, i) {
  var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
  if (null != _i) {
    var _s,
      _e,
      _x,
      _r,
      _arr = [],
      _n = !0,
      _d = !1;
    try {
      if (_x = (_i = _i.call(arr)).next, 0 === i) {
        if (Object(_i) !== _i) return;
        _n = !1;
      } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
    } catch (err) {
      _d = !0, _e = err;
    } finally {
      try {
        if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return;
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js




function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
;// CONCATENATED MODULE: ./src/Scripts/platform.js
var ExtensionPlatform=/*#__PURE__*/function(){function ExtensionPlatform(){_classCallCheck(this,ExtensionPlatform);}_createClass(ExtensionPlatform,[{key:"reload",value://
// Public
//
function reload(){browser_polyfill_default().runtime.reload();}},{key:"openTab",value:function(){var _openTab=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(options){var newTab;return _regeneratorRuntime().wrap(function _callee$(_context){while(1)switch(_context.prev=_context.next){case 0:_context.next=2;return browser_polyfill_default().tabs.create(options);case 2:newTab=_context.sent;return _context.abrupt("return",newTab);case 4:case"end":return _context.stop();}},_callee);}));function openTab(_x){return _openTab.apply(this,arguments);}return openTab;}()},{key:"openWindow",value:function(){var _openWindow=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(options){var newWindow;return _regeneratorRuntime().wrap(function _callee2$(_context2){while(1)switch(_context2.prev=_context2.next){case 0:_context2.next=2;return browser_polyfill_default().windows.create(options);case 2:newWindow=_context2.sent;return _context2.abrupt("return",newWindow);case 4:case"end":return _context2.stop();}},_callee2);}));function openWindow(_x2){return _openWindow.apply(this,arguments);}return openWindow;}()},{key:"focusWindow",value:function(){var _focusWindow=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(windowId){return _regeneratorRuntime().wrap(function _callee3$(_context3){while(1)switch(_context3.prev=_context3.next){case 0:_context3.next=2;return browser_polyfill_default().windows.update(windowId,{focused:true});case 2:case"end":return _context3.stop();}},_callee3);}));function focusWindow(_x3){return _focusWindow.apply(this,arguments);}return focusWindow;}()},{key:"updateWindowPosition",value:function(){var _updateWindowPosition=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(windowId,left,top){return _regeneratorRuntime().wrap(function _callee4$(_context4){while(1)switch(_context4.prev=_context4.next){case 0:_context4.next=2;return browser_polyfill_default().windows.update(windowId,{left:left,top:top});case 2:case"end":return _context4.stop();}},_callee4);}));function updateWindowPosition(_x4,_x5,_x6){return _updateWindowPosition.apply(this,arguments);}return updateWindowPosition;}()},{key:"getLastFocusedWindow",value:function(){var _getLastFocusedWindow=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(){var windowObject;return _regeneratorRuntime().wrap(function _callee5$(_context5){while(1)switch(_context5.prev=_context5.next){case 0:_context5.next=2;return browser_polyfill_default().windows.getLastFocused();case 2:windowObject=_context5.sent;return _context5.abrupt("return",windowObject);case 4:case"end":return _context5.stop();}},_callee5);}));function getLastFocusedWindow(){return _getLastFocusedWindow.apply(this,arguments);}return getLastFocusedWindow;}()},{key:"closeCurrentWindow",value:function(){var _closeCurrentWindow=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(){var windowDetails;return _regeneratorRuntime().wrap(function _callee6$(_context6){while(1)switch(_context6.prev=_context6.next){case 0:_context6.next=2;return browser_polyfill_default().windows.getCurrent();case 2:windowDetails=_context6.sent;browser_polyfill_default().windows.remove(windowDetails.id);case 4:case"end":return _context6.stop();}},_callee6);}));function closeCurrentWindow(){return _closeCurrentWindow.apply(this,arguments);}return closeCurrentWindow;}()},{key:"getVersion",value:function getVersion(){var _browser$runtime$getM=browser_polyfill_default().runtime.getManifest(),version=_browser$runtime$getM.version,versionName=_browser$runtime$getM.version_name;var versionParts=version.split(".");if(versionName){if(versionParts.length<4){throw new Error("Version missing build number: '".concat(version,"'"));}// On Chrome, a more descriptive representation of the version is stored in the
// `version_name` field for display purposes. We use this field instead of the `version`
// field on Chrome for non-main builds (i.e. Flask, Beta) because we want to show the
// version in the SemVer-compliant format "v[major].[minor].[patch]-[build-type].[build-number]",
// yet Chrome does not allow letters in the `version` field.
return versionName;// A fourth version part is sometimes present for "rollback" Chrome builds
}else if(![3,4].includes(versionParts.length)){throw new Error("Invalid version: ".concat(version));}else if(versionParts[2].match(/(?:(?![0-9])[\s\S])/)){// On Firefox, the build type and build version are in the third part of the version.
var _versionParts=_slicedToArray(versionParts,3),major=_versionParts[0],minor=_versionParts[1],patchAndPrerelease=_versionParts[2];var matches=patchAndPrerelease.match(/^([0-9]+)([A-Za-z]+)([0-9])+$/);if(matches===null){throw new Error("Version contains invalid prerelease: ".concat(version));}var _matches=_slicedToArray(matches,4),patch=_matches[1],buildType=_matches[2],buildVersion=_matches[3];return"".concat(major,".").concat(minor,".").concat(patch,"-").concat(buildType,".").concat(buildVersion);}// If there is no `version_name` and there are only 3 or 4 version parts, then this is not a
// prerelease and the version requires no modification.
return version;}},{key:"getPlatformInfo",value:function getPlatformInfo(cb){try{var platformInfo=browser_polyfill_default().runtime.getPlatformInfo();cb(platformInfo);return;}catch(e){cb(e);// eslint-disable-next-line no-useless-return
return;}}},{key:"addOnRemovedListener",value:function addOnRemovedListener(listener){browser_polyfill_default().windows.onRemoved.addListener(listener);}},{key:"getAllWindows",value:function(){var _getAllWindows=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(){var windows;return _regeneratorRuntime().wrap(function _callee7$(_context7){while(1)switch(_context7.prev=_context7.next){case 0:_context7.next=2;return browser_polyfill_default().windows.getAll();case 2:windows=_context7.sent;return _context7.abrupt("return",windows);case 4:case"end":return _context7.stop();}},_callee7);}));function getAllWindows(){return _getAllWindows.apply(this,arguments);}return getAllWindows;}()},{key:"getActiveTabs",value:function(){var _getActiveTabs=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(){var tabs;return _regeneratorRuntime().wrap(function _callee8$(_context8){while(1)switch(_context8.prev=_context8.next){case 0:_context8.next=2;return browser_polyfill_default().tabs.query({active:true});case 2:tabs=_context8.sent;return _context8.abrupt("return",tabs);case 4:case"end":return _context8.stop();}},_callee8);}));function getActiveTabs(){return _getActiveTabs.apply(this,arguments);}return getActiveTabs;}()},{key:"currentTab",value:function(){var _currentTab=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(){var tab;return _regeneratorRuntime().wrap(function _callee9$(_context9){while(1)switch(_context9.prev=_context9.next){case 0:_context9.next=2;return browser_polyfill_default().tabs.getCurrent();case 2:tab=_context9.sent;return _context9.abrupt("return",tab);case 4:case"end":return _context9.stop();}},_callee9);}));function currentTab(){return _currentTab.apply(this,arguments);}return currentTab;}()},{key:"switchToTab",value:function(){var _switchToTab=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10(tabId){var tab;return _regeneratorRuntime().wrap(function _callee10$(_context10){while(1)switch(_context10.prev=_context10.next){case 0:_context10.next=2;return browser_polyfill_default().tabs.update(tabId,{highlighted:true});case 2:tab=_context10.sent;return _context10.abrupt("return",tab);case 4:case"end":return _context10.stop();}},_callee10);}));function switchToTab(_x7){return _switchToTab.apply(this,arguments);}return switchToTab;}()},{key:"closeTab",value:function(){var _closeTab=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee11(tabId){return _regeneratorRuntime().wrap(function _callee11$(_context11){while(1)switch(_context11.prev=_context11.next){case 0:_context11.next=2;return browser_polyfill_default().tabs.remove(tabId);case 2:case"end":return _context11.stop();}},_callee11);}));function closeTab(_x8){return _closeTab.apply(this,arguments);}return closeTab;}()}]);return ExtensionPlatform;}();var NOTIFICATION_HEIGHT=620;var NOTIFICATION_WIDTH=400;var NOTIFICATION_MANAGER_EVENTS={POPUP_CLOSED:"onPopupClosed"};/**
 * A collection of methods for controlling the showing and hiding of the notification popup.
 */var NotificationManager=/*#__PURE__*/function(){function NotificationManager(store){_classCallCheck(this,NotificationManager);this.platform=new ExtensionPlatform();this.platform.addOnRemovedListener(this._onWindowClosed.bind(this));this.store=store;}/**
   * Mark the notification popup as having been automatically closed.
   *
   * This lets us differentiate between the cases where we close the
   * notification popup v.s. when the user closes the popup window directly.
   */_createClass(NotificationManager,[{key:"markAsAutomaticallyClosed",value:function markAsAutomaticallyClosed(){this._popupAutomaticallyClosed=true;}/**
   * Either brings an existing MetaMask notification window into focus, or creates a new notification window. New
   * notification windows are given a 'popup' type.
   *
   */},{key:"showPopup",value:function(){var _showPopup=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee12(){var route,popup,left,top,lastFocused,_window,screenX,screenY,outerWidth,extensionURL,popupWindow,_args12=arguments;return _regeneratorRuntime().wrap(function _callee12$(_context12){while(1)switch(_context12.prev=_context12.next){case 0:route=_args12.length>0&&_args12[0]!==undefined?_args12[0]:"";_context12.next=3;return this._getPopup();case 3:popup=_context12.sent;if(!popup){_context12.next=9;break;}_context12.next=7;return this.platform.focusWindow(popup.id);case 7:_context12.next=32;break;case 9:left=0;top=0;_context12.prev=11;_context12.next=14;return this.platform.getLastFocusedWindow();case 14:lastFocused=_context12.sent;// Position window in top right corner of lastFocused window.
top=lastFocused.top;left=lastFocused.left+(lastFocused.width-NOTIFICATION_WIDTH);_context12.next=24;break;case 19:_context12.prev=19;_context12.t0=_context12["catch"](11);// The following properties are more than likely 0, due to being
// opened from the background chrome process for the extension that
// has no physical dimensions
_window=window,screenX=_window.screenX,screenY=_window.screenY,outerWidth=_window.outerWidth;top=Math.max(screenY,0);left=Math.max(screenX+(outerWidth-NOTIFICATION_WIDTH),0);case 24:extensionURL=browser_polyfill_default().runtime.getURL("index.html");// create new notification popup
_context12.next=27;return this.platform.openWindow({url:extensionURL+"?route=".concat(route),type:"popup",width:NOTIFICATION_WIDTH,height:NOTIFICATION_HEIGHT,left:left,top:top});case 27:popupWindow=_context12.sent;if(!(popupWindow.left!==left&&popupWindow.state!=="fullscreen")){_context12.next=31;break;}_context12.next=31;return this.platform.updateWindowPosition(popupWindow.id,left,top);case 31:this._popupId=popupWindow.id;case 32:case"end":return _context12.stop();}},_callee12,this,[[11,19]]);}));function showPopup(){return _showPopup.apply(this,arguments);}return showPopup;}()},{key:"_onWindowClosed",value:function _onWindowClosed(windowId){console.log("Yyyyyyyy",windowId,this._popupId);if(windowId===this._popupId){this._popupId=undefined;// this.emit("POPUP_CLOSED", {
//   automaticallyClosed: this._popupAutomaticallyClosed,
// });
this._popupAutomaticallyClosed=undefined;this.handleClose();}}},{key:"handleClose",value:function handleClose(){var _state$auth$uiData,_state$auth$uiData$me;var state=this.store.getState();var method=state===null||state===void 0?void 0:(_state$auth$uiData=state.auth.uiData)===null||_state$auth$uiData===void 0?void 0:(_state$auth$uiData$me=_state$auth$uiData.message)===null||_state$auth$uiData$me===void 0?void 0:_state$auth$uiData$me.method;var conntectMethods=["eth_requestAccounts","eth_accounts","connect"];console.log("I WAS WAITING FOR MESSAGE");if(conntectMethods.indexOf('method')>-1){var _state$auth,_state$auth$uiData2,_state$auth$uiData3;browser_polyfill_default().tabs.sendMessage(state===null||state===void 0?void 0:(_state$auth=state.auth)===null||_state$auth===void 0?void 0:(_state$auth$uiData2=_state$auth.uiData)===null||_state$auth$uiData2===void 0?void 0:_state$auth$uiData2.tabId,{id:state===null||state===void 0?void 0:(_state$auth$uiData3=state.auth.uiData)===null||_state$auth$uiData3===void 0?void 0:_state$auth$uiData3.id,response:null,error:"User rejected connect permission."});}else if(method==='eth_sendTransaction'){var _state$auth2,_state$auth2$uiData,_state$auth3,_state$auth3$uiData;browser_polyfill_default().tabs.sendMessage(state===null||state===void 0?void 0:(_state$auth2=state.auth)===null||_state$auth2===void 0?void 0:(_state$auth2$uiData=_state$auth2.uiData)===null||_state$auth2$uiData===void 0?void 0:_state$auth2$uiData.tabId,{id:state===null||state===void 0?void 0:(_state$auth3=state.auth)===null||_state$auth3===void 0?void 0:(_state$auth3$uiData=_state$auth3.uiData)===null||_state$auth3$uiData===void 0?void 0:_state$auth3$uiData.id,response:null,error:"User rejected  transactoin."});}this.store.dispatch(setUIdata({}));}/**
   * Checks all open MetaMask windows, and returns the first one it finds that is a notification window (i.e. has the
   * type 'popup')
   *
   * @private
   */},{key:"_getPopup",value:function(){var _getPopup2=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13(){var windows;return _regeneratorRuntime().wrap(function _callee13$(_context13){while(1)switch(_context13.prev=_context13.next){case 0:_context13.next=2;return this.platform.getAllWindows();case 2:windows=_context13.sent;return _context13.abrupt("return",this._getPopupIn(windows));case 4:case"end":return _context13.stop();}},_callee13,this);}));function _getPopup(){return _getPopup2.apply(this,arguments);}return _getPopup;}()/**
   * Given an array of windows, returns the 'popup' that has been opened by MetaMask, or null if no such window exists.
   *
   * @private
   * @param {Array} windows - An array of objects containing data about the open MetaMask extension windows.
   */},{key:"_getPopupIn",value:function _getPopupIn(windows){var _this=this;return windows?windows.find(function(win){// Returns notification popup
return win&&win.type==="popup"&&win.id===_this._popupId;}):null;}}]);return NotificationManager;}();
;// CONCATENATED MODULE: ./src/Scripts/utils.js
var getBaseUrl=function getBaseUrl(url){var pathArray=url.split("/");var protocol=pathArray[0];var host=pathArray[2];return protocol+"//"+host;};var getCurrentTabUrl=function getCurrentTabUrl(callback){var queryInfo={active:true,currentWindow:true};Browser.tabs.query(queryInfo).then(function(tabs){var _tabs$;callback(getBaseUrl((_tabs$=tabs[0])===null||_tabs$===void 0?void 0:_tabs$.url));});};var getCurrentTabUId=function getCurrentTabUId(callback){var queryInfo={active:true,currentWindow:true};Browser.tabs.query(queryInfo).then(function(tabs){callback(tabs[0].id);});};var isManifestV3=browser_polyfill_default().runtime.getManifest().manifest_version===3;
;// CONCATENATED MODULE: ./src/Scripts/controller.js
// Initializes the Redux store
function init(preloadedState){return new Promise(function(resolve,reject){var store=configureStore({reducer:{auth:auth},preloadedState:preloadedState// middleware: [logger],
});(0,lib/* wrapStore */.IF)(store,{portName:PORT_NAME});// Subscribes to the redux store changes. For each state
// change, we want to store the new state to the storage.
store.subscribe(function(){browser_polyfill_default().storage.local.set({state:store.getState()});// Optional: other things we want to do on state change
// Here we update the badge text with the counter value.
//    Browser.action.setBadgeText({ text: `${store.getState().counter?.value}` });
});if(isManifestV3){browser_polyfill_default().storage.session.get(["login"]).then(function(res){store.dispatch(setLogin(res!==null&&res!==void 0&&res.login?res.login:false));resolve(store);}).catch(reject);}else{browser_polyfill_default().storage.local.get(["login"]).then(function(res){store.dispatch(setLogin(res!==null&&res!==void 0&&res.login?res.login:false));resolve(store);}).catch(reject);}});}//Load the redux store
function loadStore(){var sendStoreMessage=arguments.length>0&&arguments[0]!==undefined?arguments[0]:true;return new Promise(/*#__PURE__*/function(){var _ref=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(resolve){return _regeneratorRuntime().wrap(function _callee2$(_context2){while(1)switch(_context2.prev=_context2.next){case 0:try{browser_polyfill_default().storage.local.get("state").then(/*#__PURE__*/function(){var _ref2=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(storage){var store;return _regeneratorRuntime().wrap(function _callee$(_context){while(1)switch(_context.prev=_context.next){case 0:_context.next=2;return init(storage.state||{auth:userState});case 2:store=_context.sent;store.dispatch(toggleLoader(false));// 2. Sends a message to notify that the store is ready.
sendStoreMessage&&browser_polyfill_default().runtime.sendMessage({type:"STORE_INITIALIZED"});resolve(store);case 6:case"end":return _context.stop();}},_callee);}));return function(_x2){return _ref2.apply(this,arguments);};}());}catch(err){// console.log("Here error in store", err);
//error while loading the store
}case 1:case"end":return _context2.stop();}},_callee2);}));return function(_x){return _ref.apply(this,arguments);};}());}//inject the script on current webpage
function initScript(){return _initScript.apply(this,arguments);}//controller class for permission related methods
function _initScript(){_initScript=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(){return _regeneratorRuntime().wrap(function _callee6$(_context6){while(1)switch(_context6.prev=_context6.next){case 0:_context6.prev=0;_context6.next=3;return browser_polyfill_default().scripting.registerContentScripts([{id:"inpage",matches:["file://*/*","http://*/*","https://*/*"],js:["./static/js/injected.js"],runAt:"document_start",world:"MAIN"}]);case 3:_context6.next=7;break;case 5:_context6.prev=5;_context6.t0=_context6["catch"](0);case 7:case"end":return _context6.stop();}},_callee6,null,[[0,5]]);}));return _initScript.apply(this,arguments);}var Controller=/*#__PURE__*/function(){function Controller(store){_classCallCheck(this,Controller);this.store=store;this.notificationManager=new NotificationManager(store);}//show extension notifications
_createClass(Controller,[{key:"showNotification",value:function showNotification(){var message=arguments.length>0&&arguments[0]!==undefined?arguments[0]:"";var title=arguments.length>1&&arguments[1]!==undefined?arguments[1]:"5ire";var type=arguments.length>2&&arguments[2]!==undefined?arguments[2]:"basic";browser_polyfill_default().notifications.create("",{iconUrl:browser_polyfill_default().runtime.getURL("logo192.png"),message:message,title:title,type:type});}},{key:"sendEndPoint",value:function(){var _sendEndPoint=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(data){var storage;return _regeneratorRuntime().wrap(function _callee3$(_context3){while(1)switch(_context3.prev=_context3.next){case 0:try{storage=this.store.getState();if(data.tabId){//pass the current network http endpoint
browser_polyfill_default().tabs.sendMessage(data.tabId,{id:data.id,response:{result:storage.auth.httpEndPoints[storage.auth.currentNetwork.toLowerCase()]},error:null});}}catch(err){//  console.log("Error while sending the endpoint for injection");
//handle the error message passing also
}case 1:case"end":return _context3.stop();}},_callee3,this);}));function sendEndPoint(_x3){return _sendEndPoint.apply(this,arguments);}return sendEndPoint;}()//for connecting the accounts to a specfic webpage
},{key:"handleConnect",value:function(){var _handleConnect=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(data){var state,isEthReq,isExist,res;return _regeneratorRuntime().wrap(function _callee4$(_context4){while(1)switch(_context4.prev=_context4.next){case 0:state=this.store.getState();isEthReq=(data===null||data===void 0?void 0:data.method)==="eth_requestAccounts"||(data===null||data===void 0?void 0:data.method)==="eth_accounts";isExist=state.auth.connectedSites.find(function(st){var _data$message;return st.origin===((_data$message=data.message)===null||_data$message===void 0?void 0:_data$message.origin);});// console.log("is Connected Website: ", isExist?.isConnected);
if(!(isExist!==null&&isExist!==void 0&&isExist.isConnected)){_context4.next=8;break;}res=isEthReq?{method:data===null||data===void 0?void 0:data.method,result:[state.auth.currentAccount.evmAddress]}:{evmAddress:state.auth.currentAccount.evmAddress,nativeAddress:state.auth.currentAccount.nativeAddress};browser_polyfill_default().tabs.sendMessage(data.tabId,{id:data.id,response:res,error:null});_context4.next=11;break;case 8:this.store.dispatch(setUIdata(data));_context4.next=11;return this.notificationManager.showPopup("loginApprove");case 11:case"end":return _context4.stop();}},_callee4,this);}));function handleConnect(_x4){return _handleConnect.apply(this,arguments);}return handleConnect;}()//for transaction from connected website
},{key:"handleEthTransaction",value:function(){var _handleEthTransaction=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(data){return _regeneratorRuntime().wrap(function _callee5$(_context5){while(1)switch(_context5.prev=_context5.next){case 0:this.store.dispatch(setUIdata(_objectSpread2(_objectSpread2({},data),{},{message:data===null||data===void 0?void 0:data.message[0]})));_context5.next=3;return this.notificationManager.showPopup("approveTx");case 3:case"end":return _context5.stop();}},_callee5,this);}));function handleEthTransaction(_x5){return _handleEthTransaction.apply(this,arguments);}return handleEthTransaction;}()}]);return Controller;}();//for http-requests
function httpRequest(_x6,_x7){return _httpRequest.apply(this,arguments);}// check if transaction is success or failed and update it into storage
function _httpRequest(){_httpRequest=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(url,payload){var res,data;return _regeneratorRuntime().wrap(function _callee7$(_context7){while(1)switch(_context7.prev=_context7.next){case 0:_context7.next=2;return fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:payload});case 2:res=_context7.sent;_context7.next=5;return res.json();case 5:data=_context7.sent;return _context7.abrupt("return",data);case 7:case"end":return _context7.stop();}},_callee7);}));return _httpRequest.apply(this,arguments);}function checkTransactions(_x8){return _checkTransactions.apply(this,arguments);}function _checkTransactions(){_checkTransactions=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(txData){var store,state,noti,accountName,txHash,isSwap,rpcUrl,txRecipt;return _regeneratorRuntime().wrap(function _callee8$(_context8){while(1)switch(_context8.prev=_context8.next){case 0:_context8.prev=0;_context8.next=3;return loadStore(false);case 3:store=_context8.sent;_context8.next=6;return store.getState();case 6:state=_context8.sent;noti=new Controller(store);accountName=state.auth.currentAccount.accountName;// console.log("Here is the Transaction state: ", txData);
/*
    check for every pending transactions and if they success or fail update it into storage
    and send the success notification
    */txHash=typeof txData.txHash==="object"?txData.txHash.mainHash:txData.txHash;//check if transaction is swap or not
// console.log("data is here: ", txData.chain, txHash, state.auth.httpEndPoints[txData.chain]);
isSwap=txData.type==="swap";rpcUrl=state.auth.httpEndPoints[txData.chain]||"https://rpc-testnet.5ire.network";_context8.next=14;return httpRequest(rpcUrl,JSON.stringify({jsonrpc:"2.0",method:"eth_getTransactionReceipt",params:[txHash],id:1}));case 14:txRecipt=_context8.sent;// console.log("Here is the Transaction Result: ", txRecipt);
if(txRecipt&&txRecipt!==null&&txRecipt!==void 0&&txRecipt.result){store.dispatch(updateTxHistory({txHash:txHash,accountName:accountName,status:Boolean(parseInt(txRecipt.result.status)),isSwap:isSwap}));noti.showNotification("Transaction ".concat(Boolean(parseInt(txRecipt.result.status))?"Success":"Failed"," ").concat(txHash.slice(0,30)," ..."));}else checkTransactions(txData);_context8.next=20;break;case 18:_context8.prev=18;_context8.t0=_context8["catch"](0);case 20:case"end":return _context8.stop();}},_callee8,null,[[0,18]]);}));return _checkTransactions.apply(this,arguments);}
;// CONCATENATED MODULE: ./src/Scripts/background.js
// import { setApiReady } from "../Store/reducer/auth";
try{//send the Notification if transaction is confirmed
var txNotification=function txNotification(txData){checkTransactions(txData.data);};//background globals
var isInitialized=false;var store=null;browser_polyfill_default().runtime.onConnect.addListener(/*#__PURE__*/function(){var _ref=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(port){return _regeneratorRuntime().wrap(function _callee$(_context){while(1)switch(_context.prev=_context.next){case 0:if(!(port.name===CONNECTION_NAME)){_context.next=6;break;}_context.next=3;return loadStore();case 3:store=_context.sent;isInitialized=true;port.onDisconnect.addListener(function(){//handle popup close actions
// store.dispatch(setApiReady(false));
});case 6:case"end":return _context.stop();}},_callee);}));return function(_x){return _ref.apply(this,arguments);};}());/** Fired when the extension is first installed,
   *  when the extension is updated to a new version,
   *  and when Chrome is updated to a new version. */browser_polyfill_default().runtime.onInstalled.addListener(/*#__PURE__*/function(){var _ref2=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(details){var _iterator,_step,cs,_iterator2,_step2,tab;return _regeneratorRuntime().wrap(function _callee2$(_context2){while(1)switch(_context2.prev=_context2.next){case 0://on install of extension
// console.log("[background.js] onInstalled", details);
// store.dispatch(setApiReady(false));
_iterator=_createForOfIteratorHelper(browser_polyfill_default().runtime.getManifest().content_scripts);_context2.prev=1;_iterator.s();case 3:if((_step=_iterator.n()).done){_context2.next=13;break;}cs=_step.value;_context2.t0=_createForOfIteratorHelper;_context2.next=8;return browser_polyfill_default().tabs.query({url:cs.matches});case 8:_context2.t1=_context2.sent;_iterator2=(0,_context2.t0)(_context2.t1);try{for(_iterator2.s();!(_step2=_iterator2.n()).done;){tab=_step2.value;browser_polyfill_default().scripting.executeScript({target:{tabId:tab.id},files:cs.js});}}catch(err){_iterator2.e(err);}finally{_iterator2.f();}case 11:_context2.next=3;break;case 13:_context2.next=18;break;case 15:_context2.prev=15;_context2.t2=_context2["catch"](1);_iterator.e(_context2.t2);case 18:_context2.prev=18;_iterator.f();return _context2.finish(18);case 21:case"end":return _context2.stop();}},_callee2,null,[[1,15,18,21]]);}));return function(_x2){return _ref2.apply(this,arguments);};}());browser_polyfill_default().runtime.onStartup.addListener(function(){//on background script startup
// store.dispatch(setApiReady(false));
// console.log("[background.js] onStartup");
});browser_polyfill_default().runtime.onMessage.addListener(/*#__PURE__*/function(){var _ref3=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(message,sender,cb){var _sender$tab;var controller,data;return _regeneratorRuntime().wrap(function _callee3$(_context3){while(1)switch(_context3.prev=_context3.next){case 0://check if the current event is transactions
if((message===null||message===void 0?void 0:message.type)==="tx")txNotification(message);if(isInitialized){_context3.next=6;break;}_context3.next=4;return loadStore(false);case 4:store=_context3.sent;isInitialized=true;case 6:controller=new Controller(store);data=_objectSpread2(_objectSpread2({},message),{},{tabId:sender===null||sender===void 0?void 0:(_sender$tab=sender.tab)===null||_sender$tab===void 0?void 0:_sender$tab.id});_context3.t0=data===null||data===void 0?void 0:data.method;_context3.next=_context3.t0==="connect"?11:_context3.t0==="eth_requestAccounts"?11:_context3.t0==="eth_accounts"?11:_context3.t0==="eth_sendTransaction"?14:_context3.t0==="get_endPoint"?17:20;break;case 11:_context3.next=13;return controller.handleConnect(data);case 13:return _context3.abrupt("break",20);case 14:_context3.next=16;return controller.handleEthTransaction(data);case 16:return _context3.abrupt("break",20);case 17:_context3.next=19;return controller.sendEndPoint(data);case 19:return _context3.abrupt("break",20);case 20:case"end":return _context3.stop();}},_callee3);}));return function(_x3,_x4,_x5){return _ref3.apply(this,arguments);};}());/**
   *  Sent to the event page just before it is unloaded.
   *  This gives the extension opportunity to do some clean up.
   *  Note that since the page is unloading,
   *  any asynchronous operations started while handling this event
   *  are not guaranteed to complete.
   *  If more activity for the event page occurs before it gets
   *  unloaded the onSuspendCanceled event will
   *  be sent and the page won't be unloaded. */browser_polyfill_default().runtime.onSuspend.addListener(function(){//event called when extension is suspended or closed
// console.log("[background.js] onSuspend");
isInitialized=false;});//init the scripts (inject the script into current webpage)
initScript();}catch(err){console.log("Error: ",err);}
}();
/******/ })()
;