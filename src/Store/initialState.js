export const userState = {
    pass: null,

    allAccounts: [],

    txHistory: {},

    popupChecks: {
        txApprove: false
    },

    currentAccount: {
        accountName: "",
        index: ""
    },

    newAccount: null,

    balance: {
        evmBalance: "",
        nativeBalance: "",
        totalBalance: ""
    },

    currentNetwork: "QA",

    accountName: "",

    eth_accounts: '',

    isLogin: false

}

export const externalControls = {
    activeSession: null,
    connectedApps: {},
    connectionQueue: [],
    txQueue: []
}

export const transactionQueue = {
    txQueue: [],
    currentTransaction: null
}