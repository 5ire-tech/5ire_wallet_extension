export const EVM = "Evm";
export const EMTY_STR = "";
export const CURRENCY = "5ire";
export const NATIVE = "Native";
export const TEMP2P = "temp2p";
export const TEMP1M = "temp1m";
export const COPIED = "Copied!";
export const WINDOW_WIDTH = 400;
export const WINDOW_HEIGHT = 620;
export const DECIMALS = 10 ** 18;
export const CONNECTION_NAME = "5IRE_EXT";
export const PORT_NAME = "WEBEXT_REDUX_TEST";
export const UI_CONNECTION_NAME = "5IRE_EXT_UI";
export const ACCOUNT_CHANGED_EVENT = 'accountChanged';
export const AUTO_BALANCE_UPDATE_TIMER = 8000;


/* Regular expressions */
export const REGEX = {
    MIN_LENGTH: /.{8,}/,
    DIGITS: /(?=.*?[0-9])/,
    LOWERCASE: /(?=.*?[a-z])/,
    UPPERCASE: /(?=.*?[A-Z])/,
    WALLET_NAME: /^[a-z0-9\s]+$/i,
    SPECIAL_CHAR: /(?=.*?[#?!@$%^&*-])/

}

export const STORAGE = {
    LOCAL: "local",
    SESSION: "session"
}

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
    ERR_OCCURED: "Error occured.",
    LOGOUT_ERR: "Error while logging out",
    INVALID_MNEMONIC: "Invalid mnemonic.",
    INCORRECT_PASS: "Incorrect password.",
    INCORRECT_ADDRESS: "Incorrect address.",
    INPUT_REQUIRED: "This field is required.",
    PASS_DONT_MATCH: "Passwords do not match.",
    INSUFFICENT_BALANCE: "Insufficent Balance.",
    UNDEF_PROPERTY: "Object not has given property",
    AMOUNT_CANT_BE_0: "Amount can't be 0 or less then 0",
    ENTER_AMOUNT_CORRECTLY: "Please enter amount correctly.",
    WALLET_NAME_ALREADY_EXISTS: "Wallet name already exists.",
    NOT_VALID_JSON_RPC_METHOD: "JSON-RPC method is not valid.",
    PASS_CREATED_SUCCESS: "Successfully created password for user.",
    ALPHANUMERIC_CHARACTERS: "Please enter alphanumeric characters only.",
    MNEMONICS_ALREADY_EXISTS: "Wallet with this mnemonic already exists.",
    NOT_YOUR_OWN_ADDRESS: "Recipient address should not be your own address.",
    CREATE_PASS_MSG: "Password must have at least 8 characters, combination of Mixed case, 1 Special Character and 1 Number.",

    INVALID_PROPERTY: "Invalid property.",
    UNDEF_DATA: "Value is null or undefined.",
    INVALID_TYPE: "argument type is invalid.",
    NETWORK_REQUEST: "Network error try after sometime",
    TX_FAILED: "Transaction failed. some wrong happend.",
    INVAILD_ERROR_MESSAGE: "Error message must be an object.",
    INVALID_RPC_OPERATION: "Message is not the part of rpc call system",
    INVALID_ERROR_PAYLOAD: "Error payload is invalid, (missing required properties).",
    INPUT_BETWEEN_2_TO_18: "Please input account name between " + 2 + " and " + 18 + " characters.",
};

export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: "Login successfully.",
    LOGOUT_SUCCESS: "Logout successfully",
    PASS_CREATED_SUCCESS: "Successfully created password for user.",
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
    SUCCESS: "success",

    STATE: "state",
    ISLOGIN: "isLogin",
    BALANCE: "balance",
    TX_HISTORY: "txHistory",
    NEW_ACCOUNT: "newAccount",
    ALL_ACCOUNTS: "allAccounts",
    ACCOUNT_NAME: "accountName",
    CURRENT_NETWORK: "currentNetwork",
    CURRENT_ACCOUNT: "currentAccount",

    ERRCODE: "errCode",
    ERRMESSAGE: "errMessage",
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


export const MESSAGE_EVENT_LABELS = {
    NV_TX: "nvTx",
    NV_FEE: "nvTx",
    EVM_FEE: "evmFee",
    EVM_TX: "evmTransfer",
    BALANCE: "getBalance",
    NATIVE_FEE: "nativeFee",
    LOGIN_UPDATE: "loginUpdate",
    NATIVE_TX: "nativeTransfer",
    NOTIFICATION: "notification",
    UPDATE_TX_HISTORY: "txupdatehistory",
    EVM_TO_NATIVE_SWAP: "evmToNativeSwap",
    NATIVE_TO_EVM_SWAP: "nativeToEvmSwap",
}

export const INTERNAL_EVENT_LABELS = {
    CONNECTION: "connection",
    BALANCE_FETCH: "balanceFetch"
}

export const STATE_CHANGE_ACTIONS = {
    BALANCE: "updateBalance",
    TX_HISTORY: "addNewTxHistory",
    TX_HISTORY_UPDATE: "updateTxHistory",
    CHANGE_NETWORK: "changeNetwork",
    CHANGE_ACCOUNT: "changeAccount"
}

export const ERROR_EVENTS_LABELS = {
    NETWORK_ERROR: "networkError",
    INSUFFICENT_BALANCE: "insufficentBalance",
    CONNFAILED: "connfailed",
    ERROR_BALANCE_FETCH: "balance_fetch_error"
}

export const MESSAGE_TYPE_LABELS = {
    EXTENSION_UI: "extensionUi",
    EXTENSION_BACKGROUND: "extensionBackground"
}

//need to remove
// export const ACTIONS = {
//     setSite: "setSite",
//     setLogin: "setLogin",
//     setUIdata: "setUIdata",
//     setTxPopup: "setTxPopup",
//     toggleSite: "toggleSite",
//     setBalance: "setBalance",
//     setPassword: "setPassword",
//     pushAccounts: "pushAccounts",
//     resetBalance: "resetBalance",
//     setTxHistory: "setTxHistory",
//     toggleLoader: "toggleLoader",
//     setCurrentAcc: "setCurrentAcc",
//     setNewAccount: "setNewAccount",
//     setAllAccounts: "setAllAccounts",
//     setAccountName: "setAccountName",
//     updateTxHistory: "updateTxHistory",
//     setCurrentNetwork: "setCurrentNetwork",
// }