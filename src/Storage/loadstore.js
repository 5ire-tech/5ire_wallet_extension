import { localStorage, sessionStorage } from ".";
import { Error, ErrorPayload } from "../Utility/error_helper";
import { ERRCODES, ERROR_MESSAGES, LABELS, STATUS, NETWORK } from "../Constants";
import { userState, externalControls, transactionQueue } from "../Store/initialState";
import { hasLength, isEqual, isNullorUndef, isString, isEmpty, hasProperty } from "../Utility/utility";


//local storage data null safety check
export const getDataLocal = async (key) => {
    try {
        if (!isString(key) && isEmpty(key.trim())) throw new Error("Query key is invalid");
        const localState = await localStorage.get(key);

        if (!localState?.state && isEqual(key, LABELS.STATE)) {
            await localStorage.set({ state: userState });
            return userState;
        }
        else if (localState?.state?.auth) {
            const newState = {
                ...userState,
                oldAccounts: localState?.state?.auth?.accounts ? localState?.state?.auth?.accounts : localState?.state?.auth?.allAccounts,
                currentNetwork: localState?.state?.auth?.currentNetwork,
                pass: localState?.state?.auth?.pass,
            }
            await localStorage.set({ state: newState });
            return newState;

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

            if (isNullorUndef(ExtensionStorageHandler.instance)) {
                ExtensionStorageHandler.instance = new ExtensionStorageHandler();
                delete ExtensionStorageHandler.constructor
            }

            if (!hasProperty(ExtensionStorageHandler.instance, key)) new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_PROPERTY)).throw();

            const state = await getDataLocal(options?.localStateKey || LABELS.STATE);
            await ExtensionStorageHandler.instance[key](data, state, options);
            return false;

        } catch (err) {
            return new ErrorPayload(err.message.errCode || ERRCODES.INTERNAL, err.message.errMessage || err.message);
        }
    }


    //*************************************Helper methods*****************************/

    //update the state
    updateBalance = async (data, state) => {
        if (isEqual(data.totalBalance, state.allAccountsBalance[state?.currentAccount?.evmAddress][state.currentNetwork.toLowerCase()]?.totalBalance)) return false;


        state.allAccountsBalance[state?.currentAccount?.evmAddress][state.currentNetwork.toLowerCase()] = {
            ...data
        }

        const newState = { ...state };
        return await this._updateStorage(newState);
    }

    //update the pending transaction balance
    updatePendingTransactionBalance = async (data, state, options) => {
        const newState = { ...state, pendingTransactionBalance: { ...state.pendingTransactionBalance, [options.network]: data } };
        const status = await this._updateStorage(newState);
        return status;
    }

    //push the transactions
    addNewTxHistory = async (data, state, options) => {

        const newState = { ...state }
        newState.txHistory[options?.account?.evmAddress].push(data);
        // newState.txHistory[options.account.accountName].push(data);
        const status = await this._updateStorage(newState);
        return status;

    }

    //update transaction
    updateTxHistory = async (data, state, options) => {
        const newState = { ...state };
        const txHistory = newState.txHistory[options.account?.evmAddress];
        // const txHistory = newState.txHistory[options.account.accountName];

        const txIndex = txHistory.findIndex((item) => {
            return item.id === data.id
        });


        if (0 > txIndex) return false;
        //set the updated status into localstorage
        txHistory[txIndex] = data;
        newState.txHistory[options.account?.evmAddress] = txHistory;

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

    //remove the history item
    saveErroredFailedTransaction = async (data, state, options) => {
        const { id } = data;
        const newState = { ...state };
        const index = newState.txHistory[options.account?.evmAddress].findIndex((item) => item.id === id);
        newState.txHistory[options.account?.evmAddress][index] = { ...newState.txHistory[options.account?.evmAddress][index], status: STATUS.FAILED };
        return await this._updateStorage(newState);
    }

    /************************************ External Apps Control *********************/

    //add a new connection task
    addNewConnectionTask = async (data, state) => {
        const newState = { ...state };
        newState.connectionQueue.push(data)
        return await this._updateStorage(newState, LABELS.EXTERNAL_CONTROLS)
    }

    //update the popup id in currentTask
    updateCurrentSession = async (data, state) => {
        const newState = { ...state };
        newState.activeSession.popupId = data.popupId || newState.activeSession.popupId;
        newState.activeSession.route = data.route || newState.activeSession.route;

        return await this._updateStorage(newState, LABELS.EXTERNAL_CONTROLS)
    }

    //select the next task as active
    changeActiveSession = async (data, state) => {
        const activeSession = state.connectionQueue.shift();
        const newState = { ...state, activeSession: activeSession || null };
        return await this._updateStorage(newState, LABELS.EXTERNAL_CONTROLS)
    }

    //update the connected status
    appConnectionUpdate = async (data, state) => {
        const newState = { ...state };
        newState.connectedApps[data.origin] = { isConnected: data.connected }
        return await this._updateStorage(newState, LABELS.EXTERNAL_CONTROLS)
    }


    /************************************ For Transaction Queue *********************/
    //add a new transaction task
    addNewTransaction = async (data, state, options) => {
        const newState = { ...state };
        newState[options.network].txQueue.push(data)
        return await this._updateStorage(newState, LABELS.TRANSACTION_QUEUE);
    }

    //process new transaction
    processQueuedTransaction = async (data, state, options) => {
        const queuedTransaction = state[options.network].txQueue.shift();
        const newState = { ...state, [options.network]: { ...state[options.network], currentTransaction: queuedTransaction ? { ...queuedTransaction, transactionHistoryTrack: { ...queuedTransaction.transactionHistoryTrack, status: STATUS.PENDING } } : null } };
        return await this._updateStorage(newState, LABELS.TRANSACTION_QUEUE)
    }

    //update the transaction track into current processing transaction
    updateHistoryTrack = async (data, state, options) => {
        const newState = { ...state, [options.network]: { ...state[options.network], currentTransaction: { ...state[options.network]?.currentTransaction, transactionHistoryTrack: data } } };
        return await this._updateStorage(newState, LABELS.TRANSACTION_QUEUE)
    }

    //remove the current failed transaction
    removeFailedTx = async (data, state, options) => {
        const newState = { ...state, [options.network]: { ...state[options.network], currentTransaction: null } };
        return await this._updateStorage(newState, LABELS.TRANSACTION_QUEUE)
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
        const currentAccount = {
            evmAddress: newAccount.evmAddress,
            accountName: newAccount.accountName,
            accountIndex: newAccount.accountIndex,
            nativeAddress: newAccount.nativeAddress,
            type: newAccount.type,
        }
        const allAccountsBalance = this._setAccountBalance(state, newAccount);
        const txHistory = this._txProperty(state, newAccount.evmAddress);
        // }
        const newState = { ...state, vault, isLogin: true, currentAccount, txHistory, allAccountsBalance };


        // if (state?.oldAccounts) {
        //     const index = state.oldAccounts.findIndex(e => e?.evmAddress === newAccount?.evmAddress);
        //     const account = state.oldAccounts[index];

        //     console.log("Account in cretate ::: ", account);
        //     const oldtxHistory = [];

        //     for (let i = 0; i < account.txHistory.length; i++) {
        //         const tx = {
        //             ...account.txHistory[i],
        //             args: null,
        //             gasUsed: "",
        //             method: null,
        //             timeStamp: account.txHistory[i].dateTime,
        //             txHash: account.txHistory[i].txHash?.mainHash,
        //             intermidateHash: account.txHistory[i].txHash?.hash,
        //         }
        //         oldtxHistory.push(tx);
        //     }

        //     txHistory = this._txProperty(state, newAccount.evmAddress, oldtxHistory);

        //     if (state?.oldAccounts?.length === index + 1) delete newState.oldAccounts
        //     delete newState.pass;
        // }

        // newState.txHistory = txHistory;

        // console.log("newState in Create: ", newState);

        this._updateSession(LABELS.ISLOGIN, true);
        return await this._updateStorage(newState);
    };


    forgotPassByMnemonic = async (message, state) => {
        const { vault, newAccount, type } = message;

        const currentAccount = {
            evmAddress: newAccount.evmAddress,
            accountName: newAccount.accountName,
            accountIndex: newAccount.accountIndex,
            nativeAddress: newAccount.nativeAddress,
            type: newAccount.type
        }
        let txHistory = {};

        if (state?.txHistory?.hasOwnProperty(newAccount.evmAddress))
            txHistory[newAccount?.evmAddress] = state.txHistory[newAccount.evmAddress];
        else
            txHistory = this._txProperty({ txHistory: {} }, newAccount.evmAddress);

        const allAccountsBalance = this._setAccountBalance(state, newAccount);
        const newState = { ...state, vault, txHistory, currentAccount, allAccountsBalance, isLogin: true };
        this._updateSession(LABELS.ISLOGIN, true);
        return await this._updateStorage(newState);
    };

    //import account by mnemonic
    importAccountByMnemonics = async (message, state) => {
        const { newAccount, vault } = message;
        const txHistory = this._txProperty(state, newAccount.evmAddress);
        const allAccountsBalance = this._setAccountBalance(state, newAccount);
        const newState = { ...state, vault, txHistory, currentAccount: newAccount, allAccountsBalance }
        return await this._updateStorage(newState);
    };


    //add hd account
    addAccount = async (message, state) => {
        const { vault, newAccount } = message;
        const currentAccount = {
            evmAddress: newAccount.evmAddress,
            accountName: newAccount.accountName,
            accountIndex: newAccount.accountIndex,
            nativeAddress: newAccount.nativeAddress,
            type: newAccount.type,
        }
        const txHistory = this._txProperty(state, newAccount.evmAddress);
        const allAccountsBalance = this._setAccountBalance(state, newAccount);
        const newState = { ...state, vault, currentAccount, txHistory, allAccountsBalance };
        return await this._updateStorage(newState);
    };

    //Lock the wallet
    lock = async (message, state) => {
        const newState = { ...state, isLogin: message.isLogin };
        return await this._updateStorage(newState);
    }


    // remove specific account 
    removeAccount = async (message, state) => {
        const { removedAccountAddress, vault, accounts } = message;

        const newState = { ...state, vault };
        if (newState?.txHistory.hasOwnProperty(removedAccountAddress)) {
            delete newState.txHistory[removedAccountAddress];
        }
        if (newState?.allAccountsBalance.hasOwnProperty(removedAccountAddress)) {
            delete newState.allAccountsBalance[removedAccountAddress];
        }
        if (message?.isInitialAccount) {
            newState.isLogin = false;
            newState.currentAccount = userState.currentAccount;
        }

        newState.currentAccount = accounts[accounts.length - 1];

        return await this._updateStorage(newState);
    }

    //Todo 
    recoverOldStateAccounts = async (message, state) => {

        const { vault, currentAccount } = message;
        const newState = { ...state, vault, isLogin: true };

        if (state?.oldAccounts) {
            const txHistory = {};
            for (let i = 0; i < state?.oldAccounts.length; i++) {
                const account = state?.oldAccounts[i];
                txHistory[account.evmAddress] = [];

                for (let j = 0; j < account.txHistory?.length; j++) {
                    const oldTx = account.txHistory[j];
                    const tx = {
                        ...oldTx,
                        args: null,
                        gasUsed: "",
                        method: null,
                        timeStamp: oldTx?.dateTime,
                        txHash: oldTx?.txHash?.mainHash ? oldTx?.txHash?.mainHash : oldTx?.txHash ? oldTx?.txHash : "",
                        intermidateHash: oldTx?.txHash?.hash,
                    }

                    txHistory[account.evmAddress].push(tx);
                }
            }

            newState.txHistory = txHistory;
            newState.currentAccount = {
                evmAddress: currentAccount.evmAddress,
                accountName: currentAccount.accountName,
                accountIndex: currentAccount.accountIndex,
                nativeAddress: currentAccount.nativeAddress,
                type: currentAccount.type,

            };
            delete newState.oldAccounts;
            delete newState.pass;

        }

        await this._updateSession(LABELS.ISLOGIN, true);
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

    _txProperty = (state, accountName, oldHistory) => {
        return {
            ...state.txHistory,
            [accountName]: oldHistory ? oldHistory : []
        };
    }

    _setAccountBalance = (state, acc) => {
        const obj = {};

        Object.values(NETWORK).forEach((e) => {
            obj[e.toLowerCase()] = {
                evmBalance: 0,
                nativeBalance: 0,
                // totalBalance: 0
            }
        });

        return {
            ...state.allAccountsBalance,
            [acc.evmAddress]: { ...obj }
        };

    }

    // _setAccountBalance = (state, acc) => {
    //     return {
    //         ...state.allAccountsBalance,
    //         [acc.evmAddress]: {
    //             evmBalance: 0,
    //             nativeBalance: 0,
    //             totalBalance: 0
    //         }
    //     };
    // }



}