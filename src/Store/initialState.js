export const userState = {

    vault: null,

    txHistory: {},

    isLogin: false,

    eth_accounts: '',

    currentNetwork: "QA",
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
    }

}

export const externalControls = {
    connectedApps: {},
    activeSession: null,
    connectionQueue: []
}

export const transactionQueue = {
    txQueue: [],
    currentTransaction: null
}

export const newAccountInitialState = {
    mnemonic: "",
    evmAddress: "",
    accountName: "",
    accountIndex: "",
    nativeAddress: "",
    evmPrivateKey: "",
}

//initial state for external native transaction
export const initialExternalNativeTransaction = {
    fee: "",
    args: "",
    txHash: "",
    method: "",
}