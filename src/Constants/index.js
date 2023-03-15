export const EVM = "Evm";
export const NATIVE = "Native";
export const TEMP2P = "temp2p";
export const TEMP1M = "temp1m";
export const COPIED = "Copied!"
export const CONNECTION_NAME = "5IRE_EXT";
export const PORT_NAME = "WEBEXT_REDUX_TEST";
export const UI_CONNECTION_NAME = "5IRE_EXT_UI";
export const REGEX_WALLET_NAME = /^[a-z0-9\s]+$/i;


export const TX_TYPE = {
    SEND: "Transfer",
    SWAP: "Swap"
}
export const NETWORK = {
    QA_NETWORK: "QA",
    TEST_NETWORK: "Testnet"
}
export const STATUS = {
    FAILED: "Failed",
    PENDING: "Pending",
    SUCCESS: "Success",
}

export const INPUT = {
    REQUIRED: "This field is required.",
}

export const HTTP_METHODS = {
    PUT: "PUT",
    GET: "GET",
    POST: "POST",
    PATCH: "PATCH",
    DELETE: "DELETE"
}

export const HTTP_CONTENT_TYPE = {
    JSON: "application/json"
}

export const EVM_JSON_RPC_METHODS = {
    GET_TX_RECIPT: "eth_getTransactionReceipt"
}

export const ERROR_MESSAGES = {
    INSUFFICENT_BALANCE: "Insufficent Balance.",
    UNDEF_PROPERTY: "Object not has given property",
    NOT_VALID_JSON_RPC_METHOD: "JSON-RPC method is not valid.",
}


export const REDUX_ACTIONS = {
    setSite: "setSite",
    setLogin: "setLogin",
    setUIdata: "setUIdata",
    setTxPopup: "setTxPopup",
    toggleSite: "toggleSite",
    setBalance: "setBalance",
    setAccounts: "setAccounts",
    setPassword: "setPassword",
    pushAccounts: "pushAccounts",
    resetBalance: "resetBalance",
    setTxHistory: "setTxHistory",
    toggleLoader: "toggleLoader",
    setCurrentAcc: "setCurrentAcc",
    setNewAccount: "setNewAccount",
    setAccountName: "setAccountName",
    updateTxHistory: "updateTxHistory",
    setCurrentNetwork: "setCurrentNetwork",
}


export const LABELS = {
    Failed: "failed",
    Success: "success",
}