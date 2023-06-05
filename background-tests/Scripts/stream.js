"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WindowPostMessageStream = exports.BasePostMessageStream = void 0;
exports.isValidStreamMessage = isValidStreamMessage;
var _readableStream = require("readable-stream");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function isValidStreamMessage(message) {
  return Object.entries(message).length > 0 && Boolean(message.data) && (typeof message.data === "number" || typeof message.data === "object" || typeof message.data === "string");
}
const noop = () => undefined;
const SYN = "SYN";
const ACK = "ACK";

/**
 * Abstract base class for postMessage streams.
 */
class BasePostMessageStream extends _readableStream.Duplex {
  constructor() {
    super({
      objectMode: true
    });

    // Initialization flags
    _defineProperty(this, "_init", void 0);
    _defineProperty(this, "_haveSyn", void 0);
    this._init = false;
    this._haveSyn = false;
  }

  /**
   * Must be called at end of child constructor to initiate
   * communication with other end.
   */
  _handshake() {
    // Send synchronization message
    this._write(SYN, null, noop);
    this.cork();
  }
  _onData(data) {
    if (this._init) {
      // Forward message
      try {
        this.push(data);
      } catch (err) {
        this.emit("error", err);
      }
    } else if (data === SYN) {
      // Listen for handshake
      this._haveSyn = true;
      this._write(ACK, null, noop);
    } else if (data === ACK) {
      this._init = true;
      if (!this._haveSyn) {
        this._write(ACK, null, noop);
      }
      this.uncork();
    }
  }

  /**
   * Child classes must implement this function.
   */

  _read() {
    return undefined;
  }
  _write(data, _encoding, cb) {
    this._postMessage(data);
    cb();
  }
}
exports.BasePostMessageStream = BasePostMessageStream;
class WindowPostMessageStream extends BasePostMessageStream {
  /**
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
   */
  constructor(_ref) {
    let {
      name,
      target,
      targetOrigin = window.location.origin,
      targetWindow = window
    } = _ref;
    super();
    _defineProperty(this, "_name", void 0);
    _defineProperty(this, "_target", void 0);
    _defineProperty(this, "_targetOrigin", void 0);
    _defineProperty(this, "_targetWindow", void 0);
    if (typeof window === "undefined" || typeof window.postMessage !== "function") {
      throw new Error("window.postMessage is not a function. This class should only be instantiated in a Window.");
    }
    this._name = name;
    this._target = target;
    this._targetOrigin = targetOrigin;
    this._targetWindow = targetWindow;
    this._onMessage = this._onMessage.bind(this);
    window.addEventListener("message", this._onMessage, false);
    this._handshake();
  }
  _postMessage(data) {
    this._targetWindow.postMessage({
      target: this._target,
      data
    }, this._targetOrigin);
  }
  _onMessage(event) {
    const message = event.data;
    if (this._targetOrigin !== "*" && event.origin !== this._targetOrigin || event.source !== this._targetWindow || !isValidStreamMessage(message) || message.target !== this._name) {
      return;
    }
    this._onData(message.data);
  }
  _destroy() {
    window.removeEventListener("message", this._onMessage, false);
  }
}
exports.WindowPostMessageStream = WindowPostMessageStream;