"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDataSession = exports.getDataLocal = exports.ExtensionStorageHandler = void 0;
var _ = require(".");
var _error_helper = require("../Utility/error_helper");
var _Constants = require("../Constants");
var _initialState = require("../Store/initialState");
var _utility = require("../Utility/utility");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
//local storage data null safety check
const getDataLocal = async key => {
  try {
    var _localState$state;
    if (!(0, _utility.isString)(key) && (0, _utility.isEmpty)(key.trim())) throw new _error_helper.Error(_Constants.ERROR_MESSAGES.INVALID_QUERY);
    const localState = await _.localStorage.get(key);
    if (!(localState !== null && localState !== void 0 && localState.state) && (0, _utility.isEqual)(key, _Constants.LABELS.STATE)) {
      await _.localStorage.set({
        state: _initialState.userState
      });
      return _initialState.userState;
    } else if (localState !== null && localState !== void 0 && (_localState$state = localState.state) !== null && _localState$state !== void 0 && _localState$state.auth) {
      var _localState$state2, _localState$state2$au, _localState$state3, _localState$state3$au, _localState$state4, _localState$state4$au, _localState$state5, _localState$state5$au, _localState$state6, _localState$state6$au;
      const newState = {
        ..._initialState.userState,
        oldAccounts: localState !== null && localState !== void 0 && (_localState$state2 = localState.state) !== null && _localState$state2 !== void 0 && (_localState$state2$au = _localState$state2.auth) !== null && _localState$state2$au !== void 0 && _localState$state2$au.accounts ? localState === null || localState === void 0 ? void 0 : (_localState$state3 = localState.state) === null || _localState$state3 === void 0 ? void 0 : (_localState$state3$au = _localState$state3.auth) === null || _localState$state3$au === void 0 ? void 0 : _localState$state3$au.accounts : localState === null || localState === void 0 ? void 0 : (_localState$state4 = localState.state) === null || _localState$state4 === void 0 ? void 0 : (_localState$state4$au = _localState$state4.auth) === null || _localState$state4$au === void 0 ? void 0 : _localState$state4$au.allAccounts,
        currentNetwork: localState === null || localState === void 0 ? void 0 : (_localState$state5 = localState.state) === null || _localState$state5 === void 0 ? void 0 : (_localState$state5$au = _localState$state5.auth) === null || _localState$state5$au === void 0 ? void 0 : _localState$state5$au.currentNetwork,
        pass: localState === null || localState === void 0 ? void 0 : (_localState$state6 = localState.state) === null || _localState$state6 === void 0 ? void 0 : (_localState$state6$au = _localState$state6.auth) === null || _localState$state6$au === void 0 ? void 0 : _localState$state6$au.pass
      };
      await _.localStorage.set({
        state: newState
      });
      return newState;
    } else if (!(localState !== null && localState !== void 0 && localState.externalControls) && (0, _utility.isEqual)(key, _Constants.LABELS.EXTERNAL_CONTROLS)) {
      await _.localStorage.set({
        externalControls: _initialState.externalControls
      });
      return _initialState.externalControls;
    } else if (!(localState !== null && localState !== void 0 && localState.transactionQueue) && (0, _utility.isEqual)(key, _Constants.LABELS.TRANSACTION_QUEUE)) {
      await _.localStorage.set({
        transactionQueue: _initialState.transactionQueue
      });
      return _initialState.transactionQueue;
    } else if (!(localState !== null && localState !== void 0 && localState.windowAndTabState) && (0, _utility.isEqual)(key, _Constants.LABELS.WINDOW_AND_TAB_STATE)) {
      await _.localStorage.set({
        windowAndTabState: _initialState.windowAndTabState
      });
      return _initialState.windowAndTabState;
    }
    return localState[key];
  } catch (err) {
    console.log("Error while setting and getting state in local storage", err);
    return null;
  }
};

//session storage data null safety check
exports.getDataLocal = getDataLocal;
const getDataSession = async key => {
  try {
    if (!(0, _utility.isString)(key) && (0, _utility.isEmpty)(key.trim())) throw new _error_helper.Error(_Constants.ERROR_MESSAGES.INVALID_QUERY);
    const sessionState = await _.sessionStorage.get(key);
    return sessionState ? sessionState : null;
  } catch (err) {
    console.log("Error while setting and getting state in session storage");
    return null;
  }
};

//CRUD into localstorage
exports.getDataSession = getDataSession;
class ExtensionStorageHandler {
  constructor() {
    //*************************************Helper methods*****************************/
    //update the state
    _defineProperty(this, "updateBalance", async (data, state) => {
      var _state$allAccountsBal, _state$currentAccount, _state$currentAccount2;
      if ((0, _utility.isEqual)(data.totalBalance, (_state$allAccountsBal = state.allAccountsBalance[state === null || state === void 0 ? void 0 : (_state$currentAccount = state.currentAccount) === null || _state$currentAccount === void 0 ? void 0 : _state$currentAccount.evmAddress][state.currentNetwork.toLowerCase()]) === null || _state$allAccountsBal === void 0 ? void 0 : _state$allAccountsBal.totalBalance)) return false;
      const newState = {
        ...state
      };
      newState.allAccountsBalance[state === null || state === void 0 ? void 0 : (_state$currentAccount2 = state.currentAccount) === null || _state$currentAccount2 === void 0 ? void 0 : _state$currentAccount2.evmAddress][state.currentNetwork.toLowerCase()] = {
        ...data
      };
      return await this._updateStorage(newState);
    });
    //update the pending transaction balance
    _defineProperty(this, "updatePendingTransactionBalance", async (data, state, options) => {
      const newState = {
        ...state,
        pendingTransactionBalance: {
          ...state.pendingTransactionBalance,
          [options.address]: {
            ...state.pendingTransactionBalance[options.address],
            [options.network]: data
          }
        }
      };
      const status = await this._updateStorage(newState);
      return status;
    });
    //push the transactions
    _defineProperty(this, "addNewTxHistory", async (data, state, options) => {
      var _options$account;
      const newState = {
        ...state
      };
      newState.txHistory[options === null || options === void 0 ? void 0 : (_options$account = options.account) === null || _options$account === void 0 ? void 0 : _options$account.evmAddress].push(data);
      const status = await this._updateStorage(newState);
      return status;
    });
    //update transaction
    _defineProperty(this, "updateTxHistory", async (data, state, options) => {
      var _options$account2, _options$account3;
      const newState = {
        ...state
      };
      const txHistory = newState.txHistory[(_options$account2 = options.account) === null || _options$account2 === void 0 ? void 0 : _options$account2.evmAddress];
      const txIndex = txHistory.findIndex(item => {
        return item.id === data.id;
      });
      if (0 > txIndex) return false;
      //set the updated status into localstorage
      txHistory[txIndex] = data;
      newState.txHistory[(_options$account3 = options.account) === null || _options$account3 === void 0 ? void 0 : _options$account3.evmAddress] = txHistory;

      //update the history
      return await this._updateStorage(newState);
    });
    //change current network
    _defineProperty(this, "changeNetwork", async (data, state) => {
      if ((0, _utility.isEqual)(data.currentNetwork, state.currentNetwork)) return false;
      const newState = {
        ...state,
        currentNetwork: data.currentNetwork
      };
      return await this._updateStorage(newState);
    });
    //change account
    _defineProperty(this, "changeAccount", async (data, state) => {
      if (data.accountName === state.currentAccount.accountName) return false;
      const newState = {
        ...state,
        currentAccount: data
      };
      return await this._updateStorage(newState);
    });
    //remove the history item
    _defineProperty(this, "saveErroredFailedTransaction", async (data, state, options) => {
      var _options$account4, _options$account5, _options$account6;
      const {
        id
      } = data;
      const newState = {
        ...state
      };
      const index = newState.txHistory[(_options$account4 = options.account) === null || _options$account4 === void 0 ? void 0 : _options$account4.evmAddress].findIndex(item => item.id === id);
      newState.txHistory[(_options$account5 = options.account) === null || _options$account5 === void 0 ? void 0 : _options$account5.evmAddress][index] = {
        ...newState.txHistory[(_options$account6 = options.account) === null || _options$account6 === void 0 ? void 0 : _options$account6.evmAddress][index],
        status: _Constants.STATUS.FAILED
      };
      return await this._updateStorage(newState);
    });
    /************************************ External Apps Control *********************/
    //add a new connection task
    _defineProperty(this, "addNewConnectionTask", async (data, state) => {
      const newState = {
        ...state
      };
      newState.connectionQueue.push(data);
      return await this._updateStorage(newState, _Constants.LABELS.EXTERNAL_CONTROLS);
    });
    //update the popup id in currentTask
    _defineProperty(this, "updateCurrentSession", async (data, state) => {
      const newState = {
        ...state
      };
      newState.activeSession.popupId = data.popupId || newState.activeSession.popupId;
      newState.activeSession.route = data.route || newState.activeSession.route;
      return await this._updateStorage(newState, _Constants.LABELS.EXTERNAL_CONTROLS);
    });
    //select the next task as active
    _defineProperty(this, "changeActiveSession", async (data, state) => {
      const activeSession = state.connectionQueue.shift();
      const newState = {
        ...state,
        activeSession: activeSession || null
      };
      return await this._updateStorage(newState, _Constants.LABELS.EXTERNAL_CONTROLS);
    });
    //update the connected status
    _defineProperty(this, "appConnectionUpdate", async (data, state) => {
      const newState = {
        ...state
      };
      newState.connectedApps[data.origin] = {
        isConnected: data.connected
      };
      return await this._updateStorage(newState, _Constants.LABELS.EXTERNAL_CONTROLS);
    });
    //clear the external requests data
    // eslint-disable-next-line no-unused-vars
    _defineProperty(this, "clearAllExternalRequests", async (data, state) => {
      const newState = _initialState.externalControls;
      return await this._updateStorage(newState, _Constants.LABELS.EXTERNAL_CONTROLS);
    });
    /************************************ For Transaction Queue *********************/
    //add a new transaction task
    _defineProperty(this, "addNewTransaction", async (data, state, options) => {
      const newState = {
        ...state
      };
      newState[options.network].txQueue.push(data);
      return await this._updateStorage(newState, _Constants.LABELS.TRANSACTION_QUEUE);
    });
    //process new transaction
    _defineProperty(this, "processQueuedTransaction", async (data, state, options) => {
      const queuedTransaction = state[options.network].txQueue.shift();
      const newState = {
        ...state,
        [options.network]: {
          ...state[options.network],
          currentTransaction: queuedTransaction ? {
            ...queuedTransaction,
            transactionHistoryTrack: {
              ...queuedTransaction.transactionHistoryTrack,
              status: _Constants.STATUS.PENDING
            }
          } : null
        }
      };
      return await this._updateStorage(newState, _Constants.LABELS.TRANSACTION_QUEUE);
    });
    //update the transaction track into current processing transaction
    _defineProperty(this, "updateHistoryTrack", async (data, state, options) => {
      var _state$options$networ;
      const newState = {
        ...state,
        [options.network]: {
          ...state[options.network],
          currentTransaction: {
            ...((_state$options$networ = state[options.network]) === null || _state$options$networ === void 0 ? void 0 : _state$options$networ.currentTransaction),
            transactionHistoryTrack: data
          }
        }
      };
      return await this._updateStorage(newState, _Constants.LABELS.TRANSACTION_QUEUE);
    });
    //remove the current failed transaction
    _defineProperty(this, "removeFailedTx", async (data, state, options) => {
      const newState = {
        ...state,
        [options.network]: {
          ...state[options.network],
          currentTransaction: {
            ...state[options.network].currentTransaction,
            transactionHistoryTrack: null
          }
        }
      };
      return await this._updateStorage(newState, _Constants.LABELS.TRANSACTION_QUEUE);
    });
    //clear transaction queue
    // eslint-disable-next-line no-unused-vars
    _defineProperty(this, "clearTransactionQueue", async (data, state) => {
      const newState = {
        ..._initialState.transactionQueue
      };
      return await this._updateStorage(newState, _Constants.LABELS.TRANSACTION_QUEUE);
    });
    /************************** Window and Tabs State Tasks ***************************/
    // eslint-disable-next-line no-unused-vars
    _defineProperty(this, "saveTabAndWindowState", async (data, state) => {
      const newState = {
        ...data
      };
      return await this._updateStorage(newState, _Constants.LABELS.WINDOW_AND_TAB_STATE);
    });
    /************************** Keyring Related Tasks *********************************/
    // unlockWallet
    _defineProperty(this, "unlock", async message => {
      if (message.isLogin) this._updateSession(_Constants.LABELS.ISLOGIN, message.isLogin);
    });
    // set the new Account
    _defineProperty(this, "createOrRestore", async (message, state) => {
      const {
        vault,
        newAccount
      } = message;
      const currentAccount = {
        evmAddress: newAccount.evmAddress,
        accountName: newAccount.accountName,
        accountIndex: newAccount.accountIndex,
        nativeAddress: newAccount.nativeAddress,
        type: newAccount.type
      };
      const allAccountsBalance = this._setAccountBalance(state, newAccount);
      const pendingTransactionBalance = this._setAllAccountPendingBalance(state, newAccount);
      const txHistory = this._txProperty(state, newAccount.evmAddress);
      const newState = {
        ...state,
        vault,
        isLogin: true,
        currentAccount,
        txHistory,
        allAccountsBalance,
        pendingTransactionBalance
      };
      this._updateSession(_Constants.LABELS.ISLOGIN, true);
      return await this._updateStorage(newState);
    });
    _defineProperty(this, "forgotPassByMnemonic", async (message, state) => {
      var _state$txHistory;
      const {
        vault,
        newAccount
      } = message;
      const currentAccount = {
        evmAddress: newAccount.evmAddress,
        accountName: newAccount.accountName,
        accountIndex: newAccount.accountIndex,
        nativeAddress: newAccount.nativeAddress,
        type: newAccount.type
      };
      let txHistory = {};
      if (state !== null && state !== void 0 && (_state$txHistory = state.txHistory) !== null && _state$txHistory !== void 0 && _state$txHistory.hasOwnProperty(newAccount.evmAddress)) txHistory[newAccount === null || newAccount === void 0 ? void 0 : newAccount.evmAddress] = state.txHistory[newAccount.evmAddress];else txHistory = this._txProperty({
        txHistory: {}
      }, newAccount.evmAddress);
      const allAccountsBalance = this._setAccountBalance(state, newAccount);
      const pendingTransactionBalance = this._setAllAccountPendingBalance(state, newAccount);
      const newState = {
        ...state,
        vault,
        txHistory,
        currentAccount,
        allAccountsBalance,
        pendingTransactionBalance,
        isLogin: true
      };
      this._updateSession(_Constants.LABELS.ISLOGIN, true);
      return await this._updateStorage(newState);
    });
    //import account by mnemonic
    _defineProperty(this, "importAccountByMnemonics", async (message, state) => {
      const {
        newAccount,
        vault
      } = message;
      const txHistory = this._txProperty(state, newAccount.evmAddress);
      const allAccountsBalance = this._setAccountBalance(state, newAccount);
      const pendingTransactionBalance = this._setAllAccountPendingBalance(state, newAccount);
      const newState = {
        ...state,
        vault,
        txHistory,
        currentAccount: newAccount,
        allAccountsBalance,
        pendingTransactionBalance
      };
      return await this._updateStorage(newState);
    });
    //add hd account
    _defineProperty(this, "addAccount", async (message, state) => {
      const {
        vault,
        newAccount
      } = message;
      const currentAccount = {
        evmAddress: newAccount.evmAddress,
        accountName: newAccount.accountName,
        accountIndex: newAccount.accountIndex,
        nativeAddress: newAccount.nativeAddress,
        type: newAccount.type
      };
      const txHistory = this._txProperty(state, newAccount.evmAddress);
      const allAccountsBalance = this._setAccountBalance(state, newAccount);
      const pendingTransactionBalance = this._setAllAccountPendingBalance(state, newAccount);
      const newState = {
        ...state,
        vault,
        currentAccount,
        txHistory,
        allAccountsBalance,
        pendingTransactionBalance
      };
      return await this._updateStorage(newState);
    });
    //Lock the wallet
    _defineProperty(this, "lock", async (message, state) => {
      const newState = {
        ...state,
        isLogin: message.isLogin
      };
      return await this._updateStorage(newState);
    });
    // remove specific account
    _defineProperty(this, "removeAccount", async (message, state) => {
      const {
        removedAccountAddress,
        vault,
        accounts
      } = message;
      const newState = {
        ...state,
        vault
      };
      if (newState !== null && newState !== void 0 && newState.txHistory.hasOwnProperty(removedAccountAddress)) {
        delete newState.txHistory[removedAccountAddress];
      }
      if (newState !== null && newState !== void 0 && newState.allAccountsBalance.hasOwnProperty(removedAccountAddress)) {
        delete newState.allAccountsBalance[removedAccountAddress];
      }
      if (newState !== null && newState !== void 0 && newState.pendingTransactionBalance.hasOwnProperty(removedAccountAddress)) {
        delete newState.pendingTransactionBalance[removedAccountAddress];
      }
      if (message !== null && message !== void 0 && message.isInitialAccount) {
        newState.isLogin = false;
        newState.currentAccount = _initialState.userState.currentAccount;
      }
      newState.currentAccount = accounts[accounts.length - 1];
      return await this._updateStorage(newState);
    });
    _defineProperty(this, "recoverOldStateAccounts", async (message, state) => {
      const {
        vault,
        currentAccount
      } = message;
      const allAccountsBalance = this._setAccountBalance(state, currentAccount);
      const pendingTransactionBalance = this._setAllAccountPendingBalance(state, currentAccount);
      const newState = {
        ...state,
        vault,
        isLogin: true,
        allAccountsBalance,
        pendingTransactionBalance
      };
      if (state !== null && state !== void 0 && state.oldAccounts) {
        const txHistory = {};
        for (let i = 0; i < (state === null || state === void 0 ? void 0 : state.oldAccounts.length); i++) {
          const account = state === null || state === void 0 ? void 0 : state.oldAccounts[i];
          txHistory[account.evmAddress] = [];
          for (let j = 0; j < ((_account$txHistory = account.txHistory) === null || _account$txHistory === void 0 ? void 0 : _account$txHistory.length); j++) {
            var _account$txHistory, _oldTx$txHash, _oldTx$txHash2, _oldTx$txHash3;
            const oldTx = account.txHistory[j];
            const tx = {
              ...oldTx,
              args: null,
              gasUsed: "",
              method: null,
              timeStamp: oldTx === null || oldTx === void 0 ? void 0 : oldTx.dateTime,
              txHash: oldTx !== null && oldTx !== void 0 && (_oldTx$txHash = oldTx.txHash) !== null && _oldTx$txHash !== void 0 && _oldTx$txHash.mainHash ? oldTx === null || oldTx === void 0 ? void 0 : (_oldTx$txHash2 = oldTx.txHash) === null || _oldTx$txHash2 === void 0 ? void 0 : _oldTx$txHash2.mainHash : oldTx !== null && oldTx !== void 0 && oldTx.txHash ? oldTx === null || oldTx === void 0 ? void 0 : oldTx.txHash : "",
              intermidateHash: oldTx === null || oldTx === void 0 ? void 0 : (_oldTx$txHash3 = oldTx.txHash) === null || _oldTx$txHash3 === void 0 ? void 0 : _oldTx$txHash3.hash
            };
            txHistory[account.evmAddress].push(tx);
          }
        }
        newState.txHistory = txHistory;
        newState.currentAccount = {
          evmAddress: currentAccount.evmAddress,
          accountName: currentAccount.accountName,
          accountIndex: currentAccount.accountIndex,
          nativeAddress: currentAccount.nativeAddress,
          type: currentAccount.type
        };
        delete newState.oldAccounts;
        delete newState.pass;
      }
      await this._updateSession(_Constants.LABELS.ISLOGIN, true);
      return await this._updateStorage(newState);
    });
    //*********************************** Internal methods **************************/
    _defineProperty(this, "_updateStorage", async (state, key) => {
      const checkKey = key || _Constants.LABELS.STATE;
      await _.localStorage.set({
        [checkKey]: state
      });
    });
    _defineProperty(this, "_updateSession", async (key, state) => {
      await _.sessionStorage.set({
        [key]: state
      });
    });
    _defineProperty(this, "_txProperty", (state, accountName, oldHistory) => {
      return {
        ...state.txHistory,
        [accountName]: oldHistory ? oldHistory : []
      };
    });
    _defineProperty(this, "_setAccountBalance", (state, acc) => {
      const obj = {};
      Object.values(_Constants.NETWORK).forEach(e => {
        obj[e.toLowerCase()] = {
          evmBalance: 0,
          nativeBalance: 0,
          totalBalance: 0
        };
      });
      return {
        ...state.allAccountsBalance,
        [acc.evmAddress]: {
          ...obj
        }
      };
    });
    _defineProperty(this, "_setAllAccountPendingBalance", (state, acc) => {
      const obj = {};
      Object.values(_Constants.NETWORK).forEach(e => {
        obj[e.toLowerCase()] = {
          evm: 0,
          native: 0
        };
      });
      return {
        ...state.pendingTransactionBalance,
        [acc.evmAddress]: {
          ...obj
        }
      };
    });
  }
}
exports.ExtensionStorageHandler = ExtensionStorageHandler;
_defineProperty(ExtensionStorageHandler, "instance", null);
//error checker static member
_defineProperty(ExtensionStorageHandler, "updateStorage", async (key, data, options) => {
  try {
    //checks for invalid or undef argument
    (0, _utility.isNullorUndef)(key) && !(0, _utility.hasLength)(key) && new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.INVALID_ARGU_TYPE, _Constants.ERROR_MESSAGES.INVALID_TYPE)).throw();
    (0, _utility.isNullorUndef)(data) && new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_DATA)).throw();
    if ((0, _utility.isNullorUndef)(ExtensionStorageHandler.instance)) {
      ExtensionStorageHandler.instance = new ExtensionStorageHandler();
      delete ExtensionStorageHandler.constructor;
    }
    if (!(0, _utility.hasProperty)(ExtensionStorageHandler.instance, key)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.NULL_UNDEF, _Constants.ERROR_MESSAGES.UNDEF_PROPERTY)).throw();
    const state = await getDataLocal((options === null || options === void 0 ? void 0 : options.localStateKey) || _Constants.LABELS.STATE);
    await ExtensionStorageHandler.instance[key](data, state, options);
    return false;
  } catch (err) {
    return new _error_helper.ErrorPayload(err.message.errCode || _Constants.ERRCODES.INTERNAL, err.message.errMessage || err.message);
  }
});