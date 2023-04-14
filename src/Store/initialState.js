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

    // newAccount: null,

    uiData: {},

    balance: {
        evmBalance: "",
        nativeBalance: "",
        totalBalance: ""
    },

    currentNetwork: "QA",

    eth_accounts: '',

    isLogin: false,

    connectedSites: [],

    isLoading: false,

}

export const newAccountInitialState = {
    mnemonic: "",
    evmPrivateKey: "",
    evmAddress: "",
    nativeAddress: "",
    accountName:"",
    accountIndex:""
}