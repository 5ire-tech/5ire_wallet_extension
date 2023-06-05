"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContentJS = void 0;
var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));
var _constants = require("./constants");
var _stream = require("./stream");
var _Constants = require("../Constants");
var _index = _interopRequireDefault(require("./extension-port-stream-mod/index"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// for content script
class ContentJS {
  constructor() {
    //create a page stream to get and pass the message to content script
    ContentJS.pageStream = new _stream.WindowPostMessageStream({
      name: _constants.CONTENT_SCRIPT,
      target: _constants.INPAGE
    });

    //inject the injected-script into firefox
    this.injectScript();

    //bind the data event on page stream
    this.bindDataFromPageStream();

    //connect to background worker using port stream
    this.connectPortStream();

    //bind message event from extension side
    this.bindMessageFromBackgroundWorker();
  }
  static initContentScript() {
    if (!ContentJS.instance) {
      ContentJS.instance = new ContentJS();
      delete ContentJS.constructor;
    }
    return ContentJS.instance;
  }

  //connet the port stream to background worker
  connectPortStream() {
    const portConnection = _webextensionPolyfill.default.runtime.connect({
      name: _Constants.STREAM_CHANNELS.CONTENTSCRIPT
    });
    ContentJS.postStreamForBackground = new _index.default(portConnection);
  }

  //bind the data event on window post message stream from injected script
  bindDataFromPageStream() {
    ContentJS.pageStream.on("data", async data => {
      var _data$message;
      if (!(data !== null && data !== void 0 && data.method)) return;
      try {
        switch (data.method) {
          case "connect":
          case "eth_requestAccounts":
          case "eth_accounts":
          case "disconnect":
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_NOMINATOR:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_ADD_VALIDATOR:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_BONDMORE:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_PAYOUT:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_RENOMINATE:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_RESTART_VALIDATOR:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_NOMINATOR:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_STOP_VALIDATOR:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_NOMINATOR:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_UNBOND_VALIDATOR:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_BONDMORE:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_PAYOUT:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR_UNBONDED:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR:
          case _Constants.VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR_UNBONDED:
            ContentJS.postStreamForBackground.write(data);
            break;
          case "eth_sendTransaction":
            if (data.method !== "eth_sendTransaction" || ((_data$message = data.message) === null || _data$message === void 0 ? void 0 : _data$message.length) < 0) {
              ContentJS.pageStream.write({
                id: data.id,
                error: "Invalid Transaction Request"
              });
            } else {
              ContentJS.postStreamForBackground.write(data);
            }
            break;
          case _Constants.SIGNER_METHODS.SIGN_PAYLOAD:
          case _Constants.SIGNER_METHODS.SIGN_RAW:
            ContentJS.postStreamForBackground.write(data);
            break;
          case "get_endPoint":
            ContentJS.postStreamForBackground.write(data);
            break;
          default:
            ContentJS.pageStream.write({
              id: data.id,
              error: "Invalid request method"
            });
        }
      } catch (err) {
        console.log("Error in Content Script: ", err);
        ContentJS.pageStream.write({
          id: data.id,
          error: "Error while performing the operation"
        });
      }
    });
  }

  //bind message event from background script
  bindMessageFromBackgroundWorker() {
    /**
     * Fired when there is runtime message from extension side
     */
    _webextensionPolyfill.default.runtime.onMessage.addListener(message => {
      if (message !== null && message !== void 0 && message.id) {
        ContentJS.pageStream.write(message);
      }
    });
  }

  //inject into firefox web page
  injectScript() {
    try {
      const container = document.head || document.documentElement;
      const scriptTag = document.createElement("script");
      scriptTag.setAttribute("async", "false");
      // scriptTag.textContent = content;
      scriptTag.setAttribute("src", _webextensionPolyfill.default.runtime.getURL("static/js/injected.js"));
      container.insertBefore(scriptTag, container.children[0]);
      container.removeChild(scriptTag);
    } catch (error) {
      console.error("failed to inject the inpage script", error);
    }
  }
}
exports.ContentJS = ContentJS;
_defineProperty(ContentJS, "pageStream", null);
_defineProperty(ContentJS, "instance", null);
_defineProperty(ContentJS, "postStreamForBackground", null);