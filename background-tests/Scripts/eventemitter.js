"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventEmitter = void 0;
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
//event emitter
class EventEmitter {
  constructor() {
    var _this = this;
    _defineProperty(this, "on", (eventName, handler) => {
      this.eventHandler[eventName] = handler;
    });
    _defineProperty(this, "emit", function (eventName) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      _this.eventHandler[eventName](...args);
    });
    this.eventHandler = {};
  }
}
exports.EventEmitter = EventEmitter;