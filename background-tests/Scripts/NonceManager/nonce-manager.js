"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NonceManager = void 0;
var _utility = require("../../Utility/utility");
var _initbackground = require("../initbackground");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class NonceManager {
  constructor() {
    //nonce setter and getter
    _defineProperty(this, "getPreviousNonce", () => NonceManager.preNonce);
    _defineProperty(this, "setPreviousNonce", nonce => NonceManager.preNonce = nonce);
    //generate new nonce
    _defineProperty(this, "getNonce", async (network, evmAddress) => {
      try {
        const nonce = await _initbackground.NetworkHandler.api[network].evmApi.eth.getTransactionCount(evmAddress);
        return nonce;
      } catch (err) {
        (0, _utility.log)("Error while getting the nonce: ", err);
      }
    });
  }
}
exports.NonceManager = NonceManager;
//previous transaction nonce
_defineProperty(NonceManager, "preNonce", 0);