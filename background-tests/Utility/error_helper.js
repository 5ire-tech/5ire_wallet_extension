"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ErrorPayload = exports.Error = void 0;
var _utility = require("./utility");
var _Constants = require("../Constants");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
//error managing class
class Error {
  constructor(_message) {
    var _this = this;
    _defineProperty(this, "message", null);
    //throw the current error
    _defineProperty(this, "throw", function () {
      let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      throw new Error(message || _this.message);
    });
    //return the current error
    _defineProperty(this, "createError", function () {
      let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      return new Error(message || _this.message);
    });
    if (!(0, _utility.isObject)(_message)) this.throw(_Constants.ERROR_MESSAGES.INVAILD_ERROR_MESSAGE);
    if (!(0, _utility.hasProperty)(_message, _Constants.LABELS.ERRCODE) && !(0, _utility.hasProperty)(_message, _Constants.LABELS.ERRMESSAGE)) this.throw(_Constants.ERROR_MESSAGES.INVALID_ERROR_PAYLOAD);
    this.message = _message;
  }
}

//error payload creator
exports.Error = Error;
class ErrorPayload {
  constructor(errCode, errMessage) {
    _defineProperty(this, "errCode", null);
    _defineProperty(this, "errMessage", null);
    if ((0, _utility.isNullorUndef)(errCode) && (0, _utility.isNullorUndef)(errMessage) && !(0, _utility.hasLength)(errMessage)) new Error(new ErrorPayload(_Constants.ERRCODES.CHECK_FAIL, _Constants.ERROR_MESSAGES.INVALID_ERROR_PAYLOAD)).throw();
    this.errCode = errCode;
    this.errMessage = errMessage;
  }
}
exports.ErrorPayload = ErrorPayload;