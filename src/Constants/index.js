export const EVM = "Evm";
export const NATIVE = "Native";
export const TEMP2P = "temp2p";
export const TEMP1M = "temp1m";
export const COPIED = "Copied!";
export const DECIMALS = 10 ** 18;
export const CONNECTION_NAME = "5IRE_EXT";
export const PORT_NAME = "WEBEXT_REDUX_TEST";
export const UI_CONNECTION_NAME = "5IRE_EXT_UI";
export const WINDOW_HEIGHT = 620;
export const WINDOW_WIDTH = 400;
export const REGEX_WALLET_NAME = /^[a-z0-9\s]+$/i;
export const ACCOUNT_CHANGED_EVENT = 'accountChanged';


export const TX_TYPE = {
    SEND: "Transfer",
    SWAP: "Swap"
};

export const NETWORK = {
    QA_NETWORK: "QA",
    TEST_NETWORK: "Testnet"
};

export const STATUS = {
    FAILED: "Failed",
    PENDING: "Pending",
    SUCCESS: "Success",
};

export const INPUT = {
    REQUIRED: "This field is required.",
};

export const HTTP_METHODS = {
    PUT: "PUT",
    GET: "GET",
    POST: "POST",
    PATCH: "PATCH",
    DELETE: "DELETE"
};

export const HTTP_CONTENT_TYPE = {
    JSON: "application/json"
};

export const EVM_JSON_RPC_METHODS = {
    GET_TX_RECIPT: "eth_getTransactionReceipt"
};

export const ERROR_MESSAGES = {
    INCORRECT_ADDRESS: "Incorrect address.",
    INSUFFICENT_BALANCE: "Insufficent Balance.",
    UNDEF_PROPERTY: "Object not has given property",
    ENTER_AMOUNT_CORRECTLY: "Please enter amount correctly.",
    AMOUNT_CANT_BE_0: "Amount can't be 0 or less then 0",
    WALLET_NAME_ALREADY_EXISTS: "Wallet name already exists.",
    NOT_VALID_JSON_RPC_METHOD: "JSON-RPC method is not valid.",
    ALPHANUMERIC_CHARACTERS: "Please enter alphanumeric characters only.",
    MNEMONICS_ALREADY_EXISTS: "Wallet with this mnemonic already exists.",
    INPUT_BETWEEN_2_TO_18: "Please input account name between " + 2 + " and " + 18 + " characters.",
    INVAILD_ERROR_MESSAGE: "Error message must be an object.",
    INVALID_ERROR_PAYLOAD: "Error payload is invalid, (missing required properties).",
    INVALID_PROPERTY: "Invalid property.",
    INVALID_RPC_OPERATION: "Message is not the part of rpc call system",
    UNDEF_DATA: "Value is null or undefined.",
    TX_FAILED: "Transaction failed. some wrong happend.",
    NETWORK_REQUEST: "Network error try after sometime",
    INVALID_TYPE: "argument type is invalid"
};

export const ERRCODES = {
    INTERNAL: 1,
    CHECK_FAIL: 2,
    INVALID_INPUT: 3,
    NULL_UNDEF: 4,
    NETWORK_REQUEST: 5,
    TX_FAILED: 6,
    INVALID_ARGU_TYPE: 7
}


export const LABELS = {
    PASS: "pass",
    ENTER: "Enter",
    FAILED: "failed",
    ISLOGIN: "isLogin",
    SUCCESS: "success",
    BALANCE: "balance",
    ALL_ACCOUNTS: "allAccounts",
    ACCOUNT_NAME: "accountName",
    NEW_ACCOUNT: "newAccount",
    CURRENT_ACCOUNT: "currentAccount",
    EXTENSIONUI: "extensionui",

    ERRCODE: "errCode",
    ERRMESSAGE: "errMessage",
    STATE: "state"
};

export const HTTP_END_POINTS = {
    QA: "https://qa-http-nodes.5ire.network",
    TESTNET: "https://rpc-testnet.5ire.network"
};

export const API = {
    TESTNET: "https://explorer-api.5ire.network/api/firechain/explorer/get-transaction-by-hash/",
    QA: "https://qa-api-exp.5ire.network/api/firechain/explorer/get-transaction-by-hash/"
};

export const WS_END_POINTS = {
    QA: "wss://qa-wss-nodes.5ire.network",
    TESTNET: "wss://wss-testnet.5ire.network"
};

export const ACTIONS = {
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

export const MESSAGE_EVENT_LABELS = {
    EVM_FEE: "evmFee",
    EVM_TX: "evmTransfer",
    EVM_TO_NATIVE_SWAP: "evmToNativeSwap",
    NATIVE_FEE: "nativeFee",
    NATIVE_TX: "nativeTransfer",
    NATIVE_TO_EVM_SWAP: "nativeToEvmSwap",
    NV_FEE: "nvTX",
    NV_TX: "nvTx",
    BALANCE: "getBalance",
    UPDATE_TX_HISTORY: "txupdatehistory",
    NOTIFICATION: "notification"
}

export const INTERNAL_EVENT_LABELS = {
    CONNECTION: "connection",
    ERROR_BALANCE_FETCH: "balance_fetch_error"
}

export const STATE_CHANGE_ACTIONS = {
    BALANCE: "balance",
    TX_HISTORY: "txHistory",
    TX_HISTORY_UPDATE: "txHistoryUpdate"
}

export const ERROR_EVENTS_LABELS = {
    NETWORK_ERROR: "networkError",
    INSUFFICENT_BALANCE: "insufficentBalance",
    CONNFAILED: "connfailed"
}