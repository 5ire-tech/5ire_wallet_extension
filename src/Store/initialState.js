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

    currentNetwork: "Testnet",

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