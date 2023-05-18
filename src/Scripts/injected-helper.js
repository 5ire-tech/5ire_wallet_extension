import { CONNECTION_METHODS, EVM_JSON_RPC_METHODS, RELOAD_ID, TABS_EVENT, WALLET_METHODS } from "../Constants";
import { FireProvider } from "./5ire-Provider";
import { CONTENT_SCRIPT, INPAGE } from "./constants";
import { WindowPostMessageStream } from "./stream";
import {PageResponseHandler} from "./page-response-helper";
import { isEqual, log } from "../Utility/utility";

// for injected script injection
export class InjectedScript {
    static fireProvider = null;
    static injectedStream = null;
    static pageResponseHandler = null;
    static instance = null

  
    constructor() {

    //create the page response handler
    InjectedScript.pageResponseHandler = new PageResponseHandler();

     //create a page stream to get and pass the message to content script
     InjectedScript.injectedStream = new WindowPostMessageStream({
        name: INPAGE,
        target: CONTENT_SCRIPT,
      });

      //bind the data event on page stream
      this.bindDataFromPageStream();

      //inject the Provider
      this.injectProvider();

      //inject the config if app is connected
      this._afterReloadPage();
    }

    static initInjectedScript() {
      if(!InjectedScript.instance) {
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

    // bind the data event handler on page stream for getting the responses from content script
    bindDataFromPageStream = () => {
        InjectedScript.injectedStream.on("data", async (data) => {

            //handle the event from exetension
            if (data?.event) {
              if (isEqual(data.event, TABS_EVENT.WALLET_CONNECTED_EVENT)) {
                // log("here is data response: ", data.response);
                this._afterConnecting(data.response?.result?.evmAddress);
              }
              else if(isEqual(data.event, TABS_EVENT.NETWORK_CHANGE_EVENT)) this._afterNetworkChange(data.response?.result?.url)
              else if(isEqual(data.event, TABS_EVENT.WALLET_DISCONNECTED_EVENT)) this.__clearAllConfig();
              else if(isEqual(data.event, TABS_EVENT.ACCOUNT_CHANGE_EVENT)) this._injectSelectedAddress(data.response.result?.evmAddress)

              //emit the event
              InjectedScript.fireProvider.emit(data.event, data.response?.result);
              return;
            }
          
            //check if the response has a id or not
            if (data.id) {
              const handler = InjectedScript.pageResponseHandler.getHandler(data.id);
          
              //check if the message is related to error
              if (data.error) {
                InjectedScript.pageResponseHandler.reject(data);
              } else {
                if (Object.values(CONNECTION_METHODS).find(item => item === handler?.method)) {
                  !isEqual(data.id, RELOAD_ID) && this._afterConnecting(data.response.result?.length ? data.response?.result[0] : data.response?.result?.evmAddress);
                  InjectedScript.pageResponseHandler.resolve(data);
                  return;
                } else if (handler?.method === WALLET_METHODS.DISCONNECT) {
                 this._clearAllConfig();
                }
                
                InjectedScript.pageResponseHandler.resolve(data);
              }
            }
          });
    }

     // inject the provider into current page
    injectProvider = () => {
        InjectedScript.fireProvider = new FireProvider();
        window.fire = InjectedScript.fireProvider;
    }


    /*************************** Internal Methods *****************************/
    // after called dapps connection or connection event
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
      if(!InjectedScript.fireProvider.httpHost) {
        // log("called the reload")
        const isError = await this._getHttpProvider();
        if(!isError) {
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
        const res = await InjectedScript.fireProvider.passReq(WALLET_METHODS.GET_END_POINT, null);
        if(res) this._setHttpHost(res);
        return false
      } catch (err) {
        log("error is here: ", err);
        return true;
      }
    }

    //get the current network id
    async _getChainid() {
      try {
        if(InjectedScript.fireProvider.httpHost) {
          const res = await InjectedScript.fireProvider.passReq(EVM_JSON_RPC_METHODS.ETH_CHAINID, []);
          this._injectChainId(res)
        } else return true;
        return false
      } catch (err) {
        return true
      }
    }
    
    //get account
    async _getAccount() {
      try {
        if(InjectedScript.fireProvider.httpHost) {
          const res = await InjectedScript.fireProvider.passReq(CONNECTION_METHODS.ETH_ACCOUNTS, [], RELOAD_ID);
          if(res?.length) this._injectSelectedAddress(res[0])
          return false
        }
      } catch (err) {
        console.log("error while getting account in injected: ", err);
        return true
      }
    }


  //************************* Setters *************************/
  //inject accounts into provider
  _injectSelectedAddress(address) {
    InjectedScript.fireProvider.selectedAddress = address
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