"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InjectedScript = void 0;
var _Constants = require("../Constants");
var _ireProvider = require("./5ire-Provider");
var _constants = require("./constants");
var _stream = require("./stream");
var _pageResponseHelper = require("./page-response-helper");
var _utility = require("../Utility/utility");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// for injected script injection
class InjectedScript {
  constructor() {
    // bind the data event handler on page stream for getting the responses from content script
    _defineProperty(this, "bindDataFromPageStream", () => {
      InjectedScript.injectedStream.on("data", async data => {
        //handle the event from exetension
        if (data !== null && data !== void 0 && data.event) {
          var _data$response2, _data$response2$resul, _data$response$result2, _data$response3;
          if ((0, _utility.isEqual)(data.event, _Constants.TABS_EVENT.WALLET_CONNECTED_EVENT)) {
            var _data$response, _data$response$result;
            // log("here is data response: ", data.response);
            this._afterConnecting((_data$response = data.response) === null || _data$response === void 0 ? void 0 : (_data$response$result = _data$response.result) === null || _data$response$result === void 0 ? void 0 : _data$response$result.evmAddress);
          } else if ((0, _utility.isEqual)(data.event, _Constants.TABS_EVENT.NETWORK_CHANGE_EVENT)) this._afterNetworkChange((_data$response2 = data.response) === null || _data$response2 === void 0 ? void 0 : (_data$response2$resul = _data$response2.result) === null || _data$response2$resul === void 0 ? void 0 : _data$response2$resul.url);else if ((0, _utility.isEqual)(data.event, _Constants.TABS_EVENT.WALLET_DISCONNECTED_EVENT)) this._clearAllConfig();else if ((0, _utility.isEqual)(data.event, _Constants.TABS_EVENT.ACCOUNT_CHANGE_EVENT)) this._injectSelectedAddress((_data$response$result2 = data.response.result) === null || _data$response$result2 === void 0 ? void 0 : _data$response$result2.evmAddress);

          //emit the event
          InjectedScript.fireProvider.emit(data.event, (_data$response3 = data.response) === null || _data$response3 === void 0 ? void 0 : _data$response3.result);
          return;
        }

        //check if the response has a id or not
        if (data.id) {
          const handler = InjectedScript.pageResponseHandler.getHandler(data.id);

          //check if the message is related to error
          if (data.error) {
            InjectedScript.pageResponseHandler.reject(data);
          } else {
            if (Object.values(_Constants.CONNECTION_METHODS).find(item => item === (handler === null || handler === void 0 ? void 0 : handler.method))) {
              var _data$response$result3, _data$response4, _data$response5, _data$response5$resul;
              !(0, _utility.isEqual)(data.id, _Constants.RELOAD_ID) && this._afterConnecting((_data$response$result3 = data.response.result) !== null && _data$response$result3 !== void 0 && _data$response$result3.length ? (_data$response4 = data.response) === null || _data$response4 === void 0 ? void 0 : _data$response4.result[0] : (_data$response5 = data.response) === null || _data$response5 === void 0 ? void 0 : (_data$response5$resul = _data$response5.result) === null || _data$response5$resul === void 0 ? void 0 : _data$response5$resul.evmAddress);
              InjectedScript.pageResponseHandler.resolve(data);
              return;
            } else if ((handler === null || handler === void 0 ? void 0 : handler.method) === _Constants.WALLET_METHODS.DISCONNECT) {
              this._clearAllConfig();
            }
            InjectedScript.pageResponseHandler.resolve(data);
          }
        }
      });
    });
    // inject the provider into current page
    _defineProperty(this, "injectProvider", () => {
      InjectedScript.fireProvider = new _ireProvider.FireProvider();
      window.fire = InjectedScript.fireProvider;
    });
    //create the page response handler
    InjectedScript.pageResponseHandler = new _pageResponseHelper.PageResponseHandler();

    //create a page stream to get and pass the message to content script
    InjectedScript.injectedStream = new _stream.WindowPostMessageStream({
      name: _constants.INPAGE,
      target: _constants.CONTENT_SCRIPT
    });

    //bind the data event on page stream
    this.bindDataFromPageStream();

    //inject the Provider
    this.injectProvider();

    //inject the config if app is connected
    this._afterReloadPage();
  }
  static initInjectedScript() {
    if (!InjectedScript.instance) {
      InjectedScript.instance = new InjectedScript();
      delete InjectedScript.constructor;
    }
    return InjectedScript.instance;
  }

  //for handling the message passing to content script
  static handleStreamToContent(request, requestForStream) {
    InjectedScript.pageResponseHandler.addRequest(request);
    InjectedScript.injectedStream.write(requestForStream);
  }
  /*************************** Internal Methods *****************************/ // after called dapps connection or connection event
  async _afterConnecting(address) {
    // console.log("called the after connection");
    this._injectSelectedAddress(address);
    this._setConnectFlag(true);
    await this._getHttpProvider();
    await this._getChainid();
  }

  // called when network changed
  async _afterNetworkChange(httpHost) {
    // log("called the network change")
    this._setHttpHost(httpHost);
    await this._getChainid();
  }

  // check if app is connected after reload
  async _afterReloadPage() {
    if (!InjectedScript.fireProvider.httpHost) {
      // log("called the reload")
      const isError = await this._getHttpProvider();
      if (!isError) {
        await this._getChainid();
        await this._getAccount();
        this._setConnectFlag(true);
      }
    }
  }

  //********************* requester's methods ***************/
  //inject the http endpoint for specfic network
  async _getHttpProvider() {
    try {
      const res = await InjectedScript.fireProvider.passReq(_Constants.WALLET_METHODS.GET_END_POINT, null);
      if (res) this._setHttpHost(res);
      return false;
    } catch (err) {
      (0, _utility.log)("error is here: ", err);
      return true;
    }
  }

  //get the current network id
  async _getChainid() {
    try {
      if (InjectedScript.fireProvider.httpHost) {
        const res = await InjectedScript.fireProvider.passReq(_Constants.EVM_JSON_RPC_METHODS.ETH_CHAINID, []);
        this._injectChainId(res);
      } else return true;
      return false;
    } catch (err) {
      return true;
    }
  }

  //get account
  async _getAccount() {
    try {
      if (InjectedScript.fireProvider.httpHost) {
        const res = await InjectedScript.fireProvider.passReq(_Constants.CONNECTION_METHODS.ETH_ACCOUNTS, [], _Constants.RELOAD_ID);
        if (res !== null && res !== void 0 && res.length) this._injectSelectedAddress(res[0]);
        return false;
      }
    } catch (err) {
      console.log("error while getting account in injected: ", err);
      return true;
    }
  }

  //************************* Setters *************************/
  //inject accounts into provider
  _injectSelectedAddress(address) {
    InjectedScript.fireProvider.selectedAddress = address;
  }

  //set the connect flag
  _setConnectFlag(isConnected) {
    InjectedScript.fireProvider.connected = isConnected;
  }

  //set chain idS
  _injectChainId(chainId) {
    InjectedScript.fireProvider.chainId = chainId;
  }

  //set http rpc host
  _setHttpHost(httpHost) {
    InjectedScript.fireProvider.httpHost = httpHost;
  }

  //************************ clear config *********************/
  //clear all config
  _clearAllConfig() {
    this._injectSelectedAddress(null);
    this._setConnectFlag(false);
    this._injectChainId("");
    this._setHttpHost("");
  }
}
exports.InjectedScript = InjectedScript;
_defineProperty(InjectedScript, "fireProvider", null);
_defineProperty(InjectedScript, "injectedStream", null);
_defineProperty(InjectedScript, "pageResponseHandler", null);
_defineProperty(InjectedScript, "instance", null);