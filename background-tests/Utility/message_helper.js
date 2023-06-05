"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendRuntimeMessage = exports.sendMessageToTab = exports.sendMessageOverStream = exports.bindRuntimeMessageListener = exports.MessageOverStream = void 0;
var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));
var _error_helper = require("./error_helper");
var _utility = require("./utility");
var _Constants = require("../Constants");
var _index = _interopRequireDefault(require("../Scripts/extension-port-stream-mod/index"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
//message passing helper
const sendRuntimeMessage = (typeLabel, eventLabel, message) => {
  try {
    if (!(0, _utility.isObject)(message) && (0, _utility.isNullorUndef)(message)) throw new _error_helper.Error(_Constants.ERROR_MESSAGES.INVALID_MSG_ARRAY_AND_OBJECTS_ALLOWED);
    if (!(0, _utility.isString)(eventLabel) && eventLabel.trim().length === 0) throw new _error_helper.Error(_Constants.ERROR_MESSAGES.INVALID_EVENT_LABEL);
    if (!(0, _utility.isString)(typeLabel) && typeLabel.trim().length === 0) throw new _error_helper.Error(_Constants.ERROR_MESSAGES.INVALID_TYPE_LABEL);
    _webextensionPolyfill.default.runtime.sendMessage({
      type: typeLabel,
      event: eventLabel,
      data: message
    });
  } catch (err) {
    console.log("Error while sending message to background: ", err.message);
  }
};

//send the runtime message over a port duplex stream
exports.sendRuntimeMessage = sendRuntimeMessage;
class MessageOverStream {
  constructor() {
    _defineProperty(this, "sendMessageOverStream", (typeLabel, eventLabel, message) => {
      try {
        if (!MessageOverStream.portStream) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_DATA)).throw();
        if (!(0, _utility.isObject)(message) && (0, _utility.isNullorUndef)(message)) throw new _error_helper.Error(_Constants.ERROR_MESSAGES.INVALID_MSG_ARRAY_AND_OBJECTS_ALLOWED);
        if (!(0, _utility.isString)(eventLabel) && eventLabel.trim().length === 0) throw new _error_helper.Error(_Constants.ERROR_MESSAGES.INVALID_EVENT_LABEL);
        if (!(0, _utility.isString)(typeLabel) && typeLabel.trim().length === 0) throw new _error_helper.Error(_Constants.ERROR_MESSAGES.INVALID_TYPE_LABEL);
        MessageOverStream.portStream.write({
          type: typeLabel,
          event: eventLabel,
          data: message
        });
      } catch (err) {
        console.log("Error while sending message to background over streams: ", err.message);
      }
    });
  }
}
exports.MessageOverStream = MessageOverStream;
_defineProperty(MessageOverStream, "instance", null);
_defineProperty(MessageOverStream, "portStream", null);
//maintain only single instance at runtime
_defineProperty(MessageOverStream, "getInstance", () => {
  if (!MessageOverStream.instance) {
    MessageOverStream.instance = new MessageOverStream();
    delete MessageOverStream.constructor;
  }
  return MessageOverStream.instance;
});
//create the stream connection to background using port connection and convert the connection into stream
_defineProperty(MessageOverStream, "setupStream", () => {
  MessageOverStream.portStream = new _index.default(_webextensionPolyfill.default.runtime.connect({
    name: _Constants.STREAM_CHANNELS.EXTENSION_UI
  }));
  return MessageOverStream.getInstance();
});
const sendMessageOverStream = MessageOverStream.getInstance().sendMessageOverStream;

//bind the message listner
exports.sendMessageOverStream = sendMessageOverStream;
const bindRuntimeMessageListener = listner => {
  try {
    _webextensionPolyfill.default.runtime.onMessage.addListener(listner);
  } catch (err) {
    console.log("Error while binding the listner: ", err);
  }
};

//send message to tabs
exports.bindRuntimeMessageListener = bindRuntimeMessageListener;
const sendMessageToTab = (tabId, payload) => {
  try {
    tabId && _webextensionPolyfill.default.tabs.sendMessage(tabId, payload);
  } catch (err) {
    (0, _utility.log)("Error while sending message to tabs: ", err);
  }
};
exports.sendMessageToTab = sendMessageToTab;