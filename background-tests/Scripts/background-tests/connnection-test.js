"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nativeSendTest = exports.connectionTest = void 0;
var _assert = _interopRequireDefault(require("assert"));
var _connection = require("../../Helper/connection.helper");
var _console = require("console");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//test the node connection
const connectionTest = async network => {
  try {
    const connection = new _connection.Connection();
    const apis = await connection.initializeApi(network);
    const networkId = await apis.evmApi.eth.net.getId();
    _assert.default.equal(networkId, 997);
    return {
      test: "Node Connection",
      err: null
    };
  } catch (err) {
    return {
      test: "Node Connection",
      err: err
    };
  }
};

// test the native transfer
exports.connectionTest = connectionTest;
const nativeSendTest = async () => {
  try {
    const item = "hello main";
    (0, _console.log)(item);
  } catch (err) {
    return {
      test: "Native Send",
      err: err
    };
  }
};
exports.nativeSendTest = nativeSendTest;