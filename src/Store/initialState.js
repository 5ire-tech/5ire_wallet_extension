export const userState = {
    vault: null,

    txHistory: {},

    allAccountsBalance: {},

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

export const transactionQueue = {
    txQueue: [],
    currentTransaction: null
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