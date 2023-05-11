import { NETWORK } from "../Constants"

export const userState = {
    vault: null,

    allAccounts: [],

    txHistory: {},

    popupChecks: {
        txApprove: false
    },

    currentAccount: {
        evmAddress: "",
        accountName: "",
        accountIndex: "",
        nativeAddress: "",
    },

    balance: {
        evmBalance: "",
        nativeBalance: "",
        totalBalance: ""
    },

    currentNetwork: "QA",

    eth_accounts: '',

    isLogin: false

}

export const externalControls = {
    activeSession: null,
    connectedApps: {},
    connectionQueue: []
}


export const newAccountInitialState = {
    mnemonic: "",
    evmPrivateKey: "",
    evmAddress: "",
    nativeAddress: "",
    accountName:"",
    accountIndex:""
}

//initial state for external native transaction
export const initialExternalNativeTransaction = {
    method: "",
    fee: "", 
    args: "",
    txHash: ""
}

// initial state for transaction queue
export const transactionQueue = (() => { 
const queues = {}; 
Object.values(NETWORK).forEach((item) => 
{ 
    queues[item.toLowerCase()] = {
    txQueue: [],
    currentTransaction: null 
}});
return queues;
})();