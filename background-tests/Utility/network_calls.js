"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransactionProcessingPayload = exports.TransactionPayload = exports.TabMessagePayload = exports.ExternalAppsRequest = exports.EventPayload = exports.EVMRPCPayload = void 0;
exports.httpRequest = httpRequest;
var _utils = require("../Scripts/utils");
var _utility = require("../Utility/utility");
var _Constants = require("../Constants");
async function httpRequest(url, method, payload) {
  let headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    "Content-Type": _Constants.HTTP_CONTENT_TYPE.JSON
  };
  try {
    const reqHeader = {
      method,
      headers: headers
    };
    if (method === _Constants.HTTP_METHODS.POST) reqHeader.body = (0, _utility.isString)(payload) ? payload : JSON.stringify(payload);
    const res = await fetch(url, reqHeader);
    if (res.status >= 500) return {
      internalServer: true
    };
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      err: err
    };
  }
}

//rpc payload construction class
class EVMRPCPayload {
  constructor(method) {
    let params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    let jsonrpc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "2.0";
    if (!(0, _utility.isString)(method)) throw new Error(_Constants.ERROR_MESSAGES.NOT_VALID_JSON_RPC_METHOD);
    this.method = method;
    this.jsonrpc = jsonrpc;
    this.params = params;
    this.id = id;
  }
}

//paylod for rpc response from rpc operations
exports.EVMRPCPayload = EVMRPCPayload;
class EventPayload {
  constructor() {
    let stateChangeKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let eventForEmitting = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let payload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let error = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    this.stateChangeKey = stateChangeKey;
    this.eventEmit = eventForEmitting;
    this.payload = payload;
    this.error = error;
  }
}

//payload creator for tab messages
exports.EventPayload = EventPayload;
class TabMessagePayload {
  constructor(id, response) {
    let method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let event = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    let error = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    this.id = id;
    this.response = response;
    this.event = event;
    this.method = method;
    this.error = error;
  }
}

//create the external app request payload for saving and further processing
exports.TabMessagePayload = TabMessagePayload;
class ExternalAppsRequest {
  constructor(requestId, tabId, message, method, origin, route, popupId) {
    this.id = requestId;
    this.tabId = tabId;
    this.message = message;
    this.method = method;
    this.origin = origin;
    this.route = route;
    this.popupId = popupId;
  }
}

//for the transaction processing payload creation
exports.ExternalAppsRequest = ExternalAppsRequest;
class TransactionProcessingPayload {
  constructor(data, type) {
    let transactionHistoryTrack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let contractBytecode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    let options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    this.data = data;
    this.type = type;
    this.transactionHistoryTrack = transactionHistoryTrack;
    this.contractBytecode = contractBytecode;
    this.options = options;
  }
}

//for main transaction payload
exports.TransactionProcessingPayload = TransactionProcessingPayload;
class TransactionPayload {
  constructor() {
    let to = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    let amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    let isEvm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let chain = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "QA";
    let type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
    let txHash = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "";
    let status = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : _Constants.STATUS.QUEUED;
    let intermidateHash = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
    let gasUsed = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : null;
    let args = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : null;
    let method = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : null;
    this.to = to;
    this.amount = amount;
    this.isEvm = isEvm;
    this.chain = chain;
    this.txHash = txHash;
    this.type = type;
    this.status = status;
    this.intermidateHash = intermidateHash;
    this.gasUsed = gasUsed;
    this.id = (0, _utils.getUUID)();
    this.timeStamp = new Date().toString();
    this.method = method;
    this.args = args;
  }
}
exports.TransactionPayload = TransactionPayload;