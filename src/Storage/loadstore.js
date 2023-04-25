import { localStorage, sessionStorage } from ".";
import { hasLength, isEqual, isNullorUndef, isObject, isString, log, isEmpty, hasProperty } from "../Utility/utility";
import { userState, externalControls, transactionQueue } from "../Store/initialState";
import { Error, ErrorPayload } from "../Utility/error_helper";
import { ERRCODES, ERROR_MESSAGES, LABELS } from "../Constants";


//local storage data null safety check
export const getDataLocal = async (key) => {
    try {
        if (!isString(key) && isEmpty(key.trim())) throw new Error("Query key is invalid");
        const localState = await localStorage.get(key);

        if (!localState?.state && isEqual(key, LABELS.STATE)) {
            await localStorage.set({ state: userState });
            return userState;
        } else if (!localState?.externalControls && isEqual(key, LABELS.EXTERNAL_CONTROLS)) {
            await localStorage.set({ externalControls });
            return externalControls
        } else if (!localState?.transactionQueue && isEqual(key, LABELS.TRANSACTION_QUEUE)) {
            await localStorage.set({ transactionQueue });
            return transactionQueue
        }

        return localState[key];

    } catch (err) {
        console.log("Error while setting and getting state in local storage", err);
        return null;
    }
}

//session storage data null safety check
export const getDataSession = async (key) => {
    try {
        if (!isString(key) && isEmpty(key.trim())) throw new Error("Query key is invalid");
        const sessionState = await sessionStorage.get(key);
        return sessionState ? sessionState : null;

    } catch (err) {
        console.log("Error while setting and getting state in session storage");
        return null;
    }
}


//CRUD into localstorage
export class ExtensionStorageHandler {
    static instance = null;

    //error checker static member
    static updateStorage = async (key, data, options) => {
        try {

            //checks for invalid or undef argument
            isNullorUndef(key) && !hasLength(key) && new Error(new ErrorPayload(ERRCODES.INVALID_ARGU_TYPE, ERROR_MESSAGES.INVALID_TYPE)).throw();
            isNullorUndef(data) && new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

            // !isObject(data) && new Error(new ErrorPayload(ERRCODES.INVALID_ARGU_TYPE, ERROR_MESSAGES.INVALID_TYPE)).throw();

            if (isNullorUndef(ExtensionStorageHandler.instance)) {
                ExtensionStorageHandler.instance = new ExtensionStorageHandler();
                delete ExtensionStorageHandler.constructor
            }

            if (!hasProperty(ExtensionStorageHandler.instance, key)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_PROPERTY)).throw();

            const state = await getDataLocal(options?.localStateKey || LABELS.STATE);
            await ExtensionStorageHandler.instance[key](data, state, options);
            return false;

        } catch (err) {
            log("Error while updating the local storage data: ", err);
            return new ErrorPayload(err.message.errCode || ERRCODES.INTERNAL, err.message.errMessage || err.message);
        }
    }


    //*************************************Helper methods*****************************/

    //update the balance
    updateBalance = async (data, state) => {
        if (isEqual(data.totalBalance, state.balance.totalBalance)) return false;
        const newState = { ...state, balance: data };
        return await this._updateStorage(newState)
    }

    //push the transactions
    addNewTxHistory = async (data, state, options) => {

        const newState = { ...state }
        newState.txHistory[options.account.accountName].push(data);
        const status = await this._updateStorage(newState);
        return status;

    }

    //update transaction
    updateTxHistory = async (data, state, options) => {
        const newState = { ...state };
        const txHistory = newState.txHistory[options.account.accountName];

        const txIndex = txHistory.findIndex((item) => {
            return item.id === data.id
        });


        if (0 > txIndex) return false;
        //set the updated status into localstorage
        txHistory[txIndex] = data;
        newState.txHistory[options.account.accountName] = txHistory;

        //update the history
        return await this._updateStorage(newState);
    }


    //change current network
    changeNetwork = async (data, state) => {
        if (isEqual(data.currentNetwork, state.currentNetwork)) return false
        const newState = { ...state, currentNetwork: data.currentNetwork }
        return await this._updateStorage(newState);
    }

    //change account
    changeAccount = async (data, state) => {
        if (data.accountName === state.currentAccount.accountName) return false;
        const newState = { ...state, currentAccount: data }
        return await this._updateStorage(newState);
    }

    /************************************ External Apps Control *********************/

    //add a new connection task
    addNewConnectionTask = (data, state) => {
        const newState = { ...state };
        newState.connectionQueue.push(data)
        this._updateStorage(newState, LABELS.EXTERNAL_CONTROLS)
    }

    //update the popup id in currentTask
    updateCurrentSession = (data, state) => {
        const newState = { ...state };
        newState.activeSession.popupId = data.popupId || newState.activeSession.popupId;
        newState.activeSession.route = data.route || newState.activeSession.route;

        this._updateStorage(newState, LABELS.EXTERNAL_CONTROLS)
    }

    //select the next task as active
    changeActiveSession = (data, state) => {
        const activeSession = state.connectionQueue.shift();
        const newState = { ...state, activeSession: activeSession || null };
        this._updateStorage(newState, LABELS.EXTERNAL_CONTROLS)
    }

    //update the connected status
    appConnectionUpdate = (data, state) => {
        const newState = { ...state };
        newState.connectedApps[data.origin] = { isConnected: data.connected }
        this._updateStorage(newState, LABELS.EXTERNAL_CONTROLS)
    }


    /************************************ For Transaction Queue *********************/
    //add a new transaction task
    addNewTransaction = (data, state) => {
        const newState = { ...state };
        newState.txQueue.push(data)
        this._updateStorage(newState, LABELS.TRANSACTION_QUEUE);
    }

    //process new transaction
    processQueuedTransaction = (data, state) => {
        const queuedTransaction = state.txQueue.shift();
        const newState = { ...state, currentTransaction: queuedTransaction || null };
        this._updateStorage(newState, LABELS.TRANSACTION_QUEUE)
    }

    //update the transaction track into current processing transaction
    updateHistoryTrack = (data, state) => {
        const newState = { ...state, currentTransaction: { ...state?.currentTransaction, transactionHistoryTrack: data } };
        this._updateStorage(newState, LABELS.TRANSACTION_QUEUE)
    }

    /**************************Keyring Related Tasks***********************************/


    // unlockWallet 
    unlock = async (message) => {
        if (message.isLogin)
            this._updateSession(LABELS.ISLOGIN, message.isLogin);

    }


    // set the new Account
    createOrRestore = async (message, state) => {

        const { vault, type, newAccount } = message;
        const newState = { ...state, vault, isLogin: true };

        if (type === LABELS.IMPORT) {

            newState.currentAccount = {
                evmAddress: newAccount.evmAddress,
                accountName: newAccount.accountName,
                accountIndex: newAccount.accountIndex,
                nativeAddress: newAccount.nativeAddress,
            }
            newState.txHistory = this._txProperty(state, newAccount.accountName);
        }

        this._updateSession(LABELS.ISLOGIN, true);
        return await this._updateStorage(newState);
    };


    forgotPassByMnemonic = async (message, state) => {
        const { vault, newAccount, type } = message;

        const currentAcc = {
            evmAddress: newAccount.evmAddress,
            accountName: newAccount.accountName,
            accountIndex: newAccount.accountIndex,
            nativeAddress: newAccount.nativeAddress,
        }
        const txHistory = this._txProperty({ txHistory: {} }, newAccount.accountName);

        const newState = { ...state, vault, txHistory, currentAccount: currentAcc, isLogin: true }
        this._updateSession(LABELS.ISLOGIN, true);
        return await this._updateStorage(newState);
    };


    importAccountByMnemonics = async (message, state) => {
        const { newAccount, vault } = message;
        const txHistory = this._txProperty(state, newAccount.accountName);
        const newState = { ...state, vault, txHistory, currentAccount: newAccount }
        return await this._updateStorage(newState);
    };

    //add hd account
    addAccount = async (message, state) => {
        const { vault } = message;
        const newState = { ...state, vault };
        return await this._updateStorage(newState);
    };

    //Lock the wallet
    lock = async (message, state) => {
        const newState = { ...state, isLogin: message.isLogin };
        return await this._updateStorage(newState);
    }

    // remove specific account 
    removeAccount = async (message, state) => {
        const newState = { ...state, vault: message.vault };
        if (message?.isInitialAccount) {
            newState.isLogin = false
        }
        return await this._updateStorage(newState);

    }

    // remove specific account 
    resetVaultAndPass = async (message, state) => {
        console.log("resetVaultAndPass in Storage  ::: ", message);
        const newState = { ...state, vault: null, isLogin: false };
        await this._updateSession("isLogin", null);
        return await this._updateStorage(newState);
    }


    //*********************************** Internal methods **************************/
    _updateStorage = async (state, key) => {
        const checkKey = key || LABELS.STATE;
        await localStorage.set({ [checkKey]: state })

    }

    _updateSession = async (key, state) => {
        await sessionStorage.set({ [key]: state })
    }

    _txProperty = (state, accountName) => {
        return {
            ...state.txHistory,
            [accountName]: []
        };
    }

}