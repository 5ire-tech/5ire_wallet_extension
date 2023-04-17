import { HTTP_METHODS, HTTP_CONTENT_TYPE, ERROR_MESSAGES, STATUS } from "../Constants";
import { getUUID } from "../Scripts/utils";
import {isString} from "../Utility/utility"

export async function httpRequest(url, method, payload, headers = {"Content-Type": HTTP_CONTENT_TYPE.JSON }) {
  
  try {
    const reqHeader = {
      method,
      headers: headers
    }
  
    if(method === HTTP_METHODS.POST) reqHeader.body = isString(payload) ? payload : JSON.stringify(payload)
  
    const res = await fetch(url, reqHeader);
    if(res.status >= 500) return {internalServer: true};
    const data = await res.json();
    return data;

  } catch (err) {
    return {err: err}
  }
  }


  //rpc payload construction class
  export class EVMRPCPayload {
      constructor(method, params=[], id=1, jsonrpc = "2.0") {
        if(!isString(method)) throw new Error(ERROR_MESSAGES.NOT_VALID_JSON_RPC_METHOD);
        this.method = method;
        this.jsonrpc = jsonrpc;
        this.params = params;
        this.id = id        
      }
  }


  //paylod for rpc response from rpc operations
  export class EventPayload {
    constructor(stateChangeKey, eventForEmitting, payload, moreEvent = [], error=null) {
      this.stateChangeKey = stateChangeKey
      this.eventEmit = eventForEmitting
      this.payload = payload
      this.moreEvent = moreEvent
      this.error = error
    }
  }


  //payload creator for tab messages
  export class TabMessagePayload {
    constructor(id, response, error=null) {
      this.id = id;
      this.response = response;
      this.error = error;
    }
  }


  //create the external app request payload for saving and further processing
export class ExternalAppsRequest {
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
export class TransactionProcessingPayload {
  constructor(data, type, transactionHistoryTrack=null, contractBytecode = null, options = null) {
    this.data = data;
    this.type = type;
    this.transactionHistoryTrack = transactionHistoryTrack;
    this.contractBytecode = contractBytecode;
    this.options = options;
  }
}

//for main transaction payload
export class TransactionPayload {
  constructor(to="", amount=0, isEvm=null, chain="QA", type="", txHash="", status=STATUS.QUEUED, intermidateHash=null, gasUsed=null) {
    this.to = to;
    this.amount = amount;
    this.isEvm = isEvm;
    this.chain = chain;
    this.txHash = txHash;
    this.type = type;
    this.status = status;
    this.intermidateHash = intermidateHash;
    this.gasUsed = gasUsed;
    this.id = getUUID();
    this.timeStamp = new Date().toString();
    this.functionExecuted = null;
  }
}