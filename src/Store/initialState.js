import { NETWORK } from "../Constants"


const initialPendingBalance = (() => {
    const pBalance = {};
    Object.values(NETWORK).forEach((item) => {
        pBalance[item.toLowerCase()] = {
            evm: 0,
            native: 0
        }
    });
    return pBalance;
})();


export const userState = {

    vault: null,

    txHistory: {},

    isLogin: false,

    eth_accounts: '',

    currentNetwork: "Testnet",

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

    pendingTransactionBalance: initialPendingBalance,

}

export const externalControls = {
    connectedApps: {},
    activeSession: null,
    connectionQueue: []
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
    method: "",
    fee: "",
    args: "",
    txHash: ""
}

// initial state for transaction queue
export const transactionQueue = (() => {
    const queues = {};
    Object.values(NETWORK).forEach((item) => {
        queues[item.toLowerCase()] = {
            txQueue: [],
            currentTransaction: null
        }
    });
    return queues;
})();
