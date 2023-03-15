export const EVM = "Evm";
export const NATIVE = "Native";
export const TEMP2P = "temp2p";
export const TEMP1M = "temp1m";
export const COPIED = "Copied!"
export const CONNECTION_NAME = "5IRE_EXT";
export const PORT_NAME = "WEBEXT_REDUX_TEST";
export const UI_CONNECTION_NAME = "5IRE_EXT_UI";

export const TX_TYPE = {
    SEND: "Transfer",
    SWAP: "Swap"
}
export const NETWORK = {
    QA_NETWORK: "QA",
    TEST_NETWORK: "Testnet",
    UAT: "UAT"
}
export const STATUS = {
    PENDING: "Pending",
    FAILED: "Failed",
    SUCCESS: "Success",
}

export const INPUT = {
    REQUIRED: "This field is required.",
}

export const HTTP_METHODS = {
    POST: "POST",
    GET: "GET",
    PUT: "PUT",
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
    NOT_VALID_JSON_RPC_METHOD: "JSON-RPC method is not valid.",
    INSUFFICENT_BALANCE: "Insufficent Balance.",
    UNDEF_PROPERTY: "Object not has given property"
}


export const REDUX_ACTIONS = {
    setTxPopup: "setTxPopup",
    setPassword: "setPassword",
    setCurrentAcc: "setCurrentAcc",
    setAccounts: "setAccounts",
    pushAccounts: "pushAccounts",
    setLogin: "setLogin",
    setUIdata: "setUIdata",
    setAccountName: "setAccountName",
    setNewAccount: "setNewAccount",
    setCurrentNetwork: "setCurrentNetwork",
    setBalance: "setBalance",
    resetBalance: "resetBalance",
    setTxHistory: "setTxHistory",
    updateTxHistory: "updateTxHistory",
    setSite: "setSite",
    toggleSite: "toggleSite",
    toggleLoader: "toggleLoader"
}


export const LABELS = {
    Success: "success",
    Failed: "failed"
}