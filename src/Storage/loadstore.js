import { localStorage, sessionStorage } from ".";
import { hasLength, isEqual, isNullorUndef, isObject, isString, log, isEmpty } from "../Utility/utility";
import { userState } from "../Store/initialState";
import { Error, ErrorPayload } from "../Utility/error_helper";
import { ERRCODES, ERROR_MESSAGES, LABELS } from "../Constants";


//local storage data null safety check
export const getDataLocal = async (key) => {
    try {
        if (!isString(key) && isEmpty(key.trim())) throw new Error("Query key is invalid");
        const localState = await localStorage.get(key);

        if (!localState) {
            localStorage.set({ state: userState })
            return userState;
        }

        return localState.state;

    } catch (err) {
        console.log("Error while setting and getting state in local storage");
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
   static updateStorage = async (key, data) => {
    try {
        //checks for invalid or undef argument
        isNullorUndef(key) && !hasLength(key) && new Error(new ErrorPayload(ERRCODES.INVALID_ARGU_TYPE, ERROR_MESSAGES.INVALID_TYPE)).throw();
        isNullorUndef(data) && new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();
        !isObject(data) && new Error(new ErrorPayload(ERRCODES.INVALID_ARGU_TYPE, ERROR_MESSAGES.INVALID_TYPE)).throw();
        

        if(isNullorUndef(ExtensionStorageHandler.instance)) {
            ExtensionStorageHandler.instance = new ExtensionStorageHandler();
            delete ExtensionStorageHandler.constructor
        }

        const state = await getDataLocal(LABELS.STATE);
        ExtensionStorageHandler.instance[key](data, state);
        return false;

    } catch (err) {
        log("Error while updating the local storage data: ", err);
        return new ErrorPayload(err.message.errCode || ERRCODES.INTERNAL, err.message.errMessage || err.message);
    }
}


    //*************************************Helper methods*****************************/
    //push the transactions
    pushTx = async (data, state) => {
        const newState = {...state}
        newState.txHistory[data.accountName].push(data.paylaod);
        return await this._updateStorage(newState);
    }

    //update the balance
    updateBalance = async (data, state) => {
        if(isEqual(data.payload.totalBalance, state.balance.totalBalance)) return false;
        const newState = {...state, balance: data.payload};
        return await this._updateStorage(newState)
    }

    //change current network
    changeNetwork = async (data, state) => {
        if(isEqual(data.payload.currentNetwork, state.currentNetwork)) return false
        const newState = {...state, currentNetwork: data.payload.currentNetwork}
        return await this._updateStorage(newState);
    }

    //change account
    changeAccount = async (data, state) => {
        if(data.payload.accountName === state.currentAccount.accountName) return false;
        const newState = {...state, currentAccount: data.payload}
        return await this._updateStorage(newState);
    }

    //update transaction
    updateTx = async (data, state) => {
        const txHistory = state.txHistory[data.payload.accountName];
        const txIndex = txHistory.findIndex((item) => {
        const isTx = isNullorUndef(item?.txHash) ? item.txHash === data.paylaod.txHash : item.txHash.mainHash === data.paylaod.txHash
        return isTx;
        })

        if(txIndex < 0) return false;
        //set the updated status into localstorage
        txHistory[txIndex].status = data.payload.status;
        const newState = {...state};
        
        //update the history
        return await this._updateStorage(newState);
    }

    //************************************Internal methods***************************/
    _updateStorage = async (state) => {
        await localStorage.set({[LABELS.STATE]: state})
        return false
    }

}