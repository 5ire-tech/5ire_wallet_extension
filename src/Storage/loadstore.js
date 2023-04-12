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

        if (!localState?.state) {
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
    static updateStorage = async (key, data, options) => {
        try {

            // console.log("KEY in UpdateStorage", key);
            // console.log("isNullorUndef(key) ", isNullorUndef(key));
            // console.log("!hasLength(key) ", !hasLength(key));
            // console.log("data in UpdateStorage", data);

            //checks for invalid or undef argument
            isNullorUndef(key) && !hasLength(key) && new Error(new ErrorPayload(ERRCODES.INVALID_ARGU_TYPE, ERROR_MESSAGES.INVALID_TYPE)).throw();

            isNullorUndef(data) && new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

            // !isObject(data) && new Error(new ErrorPayload(ERRCODES.INVALID_ARGU_TYPE, ERROR_MESSAGES.INVALID_TYPE)).throw();


            if (isNullorUndef(ExtensionStorageHandler.instance)) {
                ExtensionStorageHandler.instance = new ExtensionStorageHandler();
                delete ExtensionStorageHandler.constructor
            }

            const state = await getDataLocal(LABELS.STATE);
            ExtensionStorageHandler.instance[key](data, state, options);
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
        return await this._updateStorage(newState);
    }

    //update transaction
    updateTxHistory = async (data, state, options) => {
        const newState = { ...state };
        const txHistory = newState.txHistory[options.account.accountName];
        const txIndex = txHistory.findIndex((item) => {
            const isTx = data.isSwap ? item.txHash.mainHash === data.txHash : item.txHash === data.txHash;
            return isTx;
        })

        if (0 > txIndex) return false;
        //set the updated status into localstorage
        txHistory[txIndex].status = data.status;

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

    //new account
    // createOrRestore = async (message, state, options) => {
    //     const { vault, accounts } = message;
    //     const newState = { ...state, vault, currentAccount: accounts[0] }
    //     console.log("New State : ", newState);
    //     return await this._updateStorage(newState);
    // }

    //unlockWallet 
    // unlock = async (message, state, options) => {
    //     if (message.isLogin)
    //         this._updateSession(LABELS.ISLOGIN, message.isLogin);

    // }

    //************************************Internal methods***************************/
    _updateStorage = async (state) => {
        await localStorage.set({ [LABELS.STATE]: state })
        return false
    }

    // _updateSession = async (key, state) => {
    //     await sessionStorage.set({ [key]: state })
    // }

}