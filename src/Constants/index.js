export const EVM = "EVM";
export const EMTY_STR = "";
export const ZERO_CHAR = '0';
export const CURRENCY = "5ire";
export const NATIVE = "Native";
export const COPIED = "Copied!";
export const MNEMONIC = "mnemonic";
export const PVT_KEY = "privateKey";
export const CONNECTION_NAME = "5IRE_EXT";
export const MAIN_POPUP = "MAIN_POPUP";
export const PORT_NAME = "WEBEXT_REDUX_TEST";
export const UI_CONNECTION_NAME = "5IRE_EXT_UI";

export const EXTRA_FEE = 1;
export const WINDOW_WIDTH = 400;
export const DECIMALS = 10 ** 18;
export const WINDOW_HEIGHT = 620;
export const ONE_ETH_IN_GWEI = 1000000000;
export const AUTO_BALANCE_UPDATE_TIMER = 8000;
export const TRANSACTION_STATUS_CHECK_TIMER = 4000;
export const EXISTENTIAL_DEPOSITE = 1;
export const WEI_IN_ONE_ETH = 1000000000000000000;



//tabs event
export const TABS_EVENT = {
    ACCOUNT_CHANGE_EVENT: "accountChange",
    NETWORK_CHANGE_EVENT: "networkChange",
    WALLET_CONNECTED_EVENT: "walletConnected",
    WALLET_DISCONNECTED_EVEN: "walletDisconnected"
}


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
    SWAP: "Swap",
    CONTRACT_EXECUTION: "Contract Execution",
    CONTRACT_DEPLOYMENT: "Contract Deployement",
    NATIVE_SIGNER: "Native Signer"
};

export const NETWORK = {
    QA_NETWORK: "QA",
    TEST_NETWORK: "Testnet",
    UAT: "UAT"
};

export const STATUS = {
    FAILED: "Failed",
    PENDING: "Pending",
    SUCCESS: "Success",
    QUEUED: "Queued"
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
    ETH_ACCOUNTS: "eth_accounts",
    GET_TX_RECIPT: "eth_getTransactionReceipt",
    ETH_REQUEST_ACCOUNT: "eth_requestAccounts",
};

export const SIGNER_METHODS = {
    SIGN_PAYLOAD: "signPayload",
    SIGN_RAW: "signRaw"
};

export const ERROR_MESSAGES = {
    ERR_OCCURED: "Error occured.",
    LOGOUT_ERR: "Error while logging out",
    INVALID_MNEMONIC: "Invalid mnemonic.",
    INCORRECT_PASS: "Incorrect password.",
    INCORRECT_ADDRESS: "Invalid address.",
    INPUT_REQUIRED: "This field is required.",
    PASS_DONT_MATCH: "Passwords do not match.",
    INSUFFICENT_BALANCE: "Insufficent Balance.",
    UNDEF_PROPERTY: "Object not has given property",
    AMOUNT_CANT_BE_0: "Amount can't be 0 or less than 0",
    AMOUNT_CANT_LESS_THEN_ONE: "Amount can't be less than 1",
    ENTER_AMOUNT_CORRECTLY: "Please enter amount correctly.",
    WALLET_NAME_ALREADY_EXISTS: "Wallet name already exists.",
    NOT_VALID_JSON_RPC_METHOD: "JSON-RPC method is not valid.",
    PASS_CREATED_SUCCESS: "Successfully created password for user.",
    ALPHANUMERIC_CHARACTERS: "Please enter alphanumeric characters only.",
    MNEMONICS_ALREADY_EXISTS: "Wallet with this mnemonic already exists.",
    NOT_YOUR_OWN_ADDRESS: "Recipient address should not be your own address.",
    CREATE_PASS_MSG: "Password must have at least 8 characters, combination of Mixed case, 1 Special Character and 1 Number.",
    ACCESS_NOT_GRANTED: "The requested method has not been authorized by the user",
    ACCOUNT_ACCESS_NOT_GRANTED: "The requested account has not been authorized by the user",
    SINGER_ERROR: "Error while signing the the raw/payload",
    EXTERNAL_NATIVE_TRANSACTION_ERROR: "Error while external native transaction.",
    ERROR_WHILE_TRANSACTION: "Transaction failed, error occured during transaction processing",
    ERROR_WHILE_GAS_ESTIMATION: "Gas Estimation Failed, something wrong happend while gas estimation",
    INTERNAL_ERROR: "Something wrong happend, please try again",


    INVALID_PROPERTY: "Invalid property.",
    UNDEF_DATA: "Value is null or undefined.",
    INVALID_TYPE: "argument type is invalid.",
    REJECTED_BY_USER: "Session is rejected by user.",
    UNABLE_TO_REMOVE_ACC: "Unable to remove the account.",
    NETWORK_REQUEST: "Network error try after sometime",
    TX_FAILED: "Transaction failed. some wrong happend.",
    INVALID_METHOD: "Method is not the part of system.",
    INVAILD_ERROR_MESSAGE: "Error message must be an object.",
    INVALID_RPC_OPERATION: "RPC is not the part of rpc call system",
    INVALID_NON_RPC_TASK: "Task is not defined in non-rpc task handler class",
    INVALID_ERROR_PAYLOAD: "Error payload is invalid, (missing required properties).",
    INPUT_BETWEEN_2_TO_18: "Please input account name between " + 2 + " and " + 18 + " characters.",
};

export const SUCCESS_MESSAGES = {
    DISCONNECTED: "Disconnected.",
    LOGIN_SUCCESS: "Login successfully.",
    LOGOUT_SUCCESS: "Logout successfully",
    HASH_COPIED: "Transacion hash copied.",
    PASS_CREATED_SUCCESS: "Successfully created password for user.",
};

export const ERRCODES = {
    INTERNAL: 1,
    CHECK_FAIL: 2,
    INVALID_INPUT: 3,
    NULL_UNDEF: 4,
    NETWORK_REQUEST: 5,
    TX_FAILED: 6,
    INVALID_ARGU_TYPE: 7,
    FAILED_TO_CONNECT_NETWORK: 8,
    INSUFFICENT_BALANCE: 9,
    SIGNER_ERROR: 10,
    ERROR_WHILE_TRANSACTION: 11,
    ERROR_WHILE_BALANCE_FETCH: 12,
    ERROR_WHILE_GETTING_ESTIMATED_FEE: 13,
    KEYRING_SECTION_ERROR: 14,
    RUNTIME_MESSAGE_SECTION_ERROR: 15
}



export const LABELS = {
    KEY: "key",
    SEED: "seed",
    PASS: "pass",
    ENTER: "Enter",
    ACTIVE: "Active",
    CREATE: "create",
    IMPORT: "import",
    FAILED: "failed",
    AMOUNT: "amount",
    SUCCESS: "success",
    NOT_ACTIVE: "Not Active",

    CONNECTED: "Connected",
    NOT_CONNECTED: "Not Connected",

    STATE: "state",
    EXTERNAL_CONTROLS: "externalControls",
    TRANSACTION_QUEUE: "transactionQueue",

    VAULT: "vault",
    ISLOGIN: "isLogin",
    BALANCE: "balance",
    ACCOUNTS: "accounts",
    TX_HISTORY: "txHistory",
    NEW_ACCOUNT: "newAccount",
    ACCOUNT_NAME: "accountName",
    ALL_ACCOUNTS: "allAccounts",
    CURRENT_NETWORK: "currentNetwork",
    CURRENT_ACCOUNT: "currentAccount",

    ERRCODE: "errCode",
    ERRMESSAGE: "errMessage",

    CONTRACT: "Contract",
    EVM_TO_NATIVE: "EVM to Native",
    NATIVE_TO_EVM: "Native to EVM"

};

export const HTTP_END_POINTS = {
    QA: "https://qa-http-nodes.5ire.network",
    TESTNET: "https://rpc-testnet.5ire.network"
};

export const SOCIAL_LINKS = {
    POLICY: "https://5ire-wallet-extension.s3.amazonaws.com/5ire-wallet-extension-privacy-policy.pdf",
    LINKDIN: "https://www.linkedin.com/company/5irechain/",
    INSTAGRAM: "https://www.instagram.com/5irechain/",
    FACEBOOK: "https://www.facebook.com/5irechain/",
}

export const API = {
    TESTNET: "https://explorer-api.5ire.network/api/firechain/explorer/get-transaction-by-hash/",
    QA: "https://qa-api-exp.5ire.network/api/firechain/explorer/get-transaction-by-hash/",
    UAT: "https://uat-api-exp.5ire.network/api/firechain/explorer/get-transaction-by-hash/",
};

export const EXPLORERS = {
    TESTNET: "https://explorer.5ire.network",
    QA: "https://qa-web-exp.5ire.network",
    UAT: "https://uat-http-nodes.5ire.network",

}

export const WS_END_POINTS = {
    QA: "wss://qa-wss-nodes.5ire.network",
    TESTNET: "wss://wss-testnet.5ire.network",
    UAT: "wss://uat-wss-nodes.5ire.network",

};


export const MESSAGE_EVENT_LABELS = {
    TX_HASH: "txHash",
    EVM_FEE: "evmFee",
    EVM_TX: "evmTransfer",
    BALANCE: "getBalance",
    NATIVE_FEE: "nativeFee",
    NATIVE_TX: "nativeTransfer",
    LOGIN_UPDATE: "loginUpdate",
    NOTIFICATION: "notification",
    NATIVE_SIGNER: "nativeSigner",
    BACKGROUND_ERROR: "backgroundError",
    UPDATE_TX_HISTORY: "txupdatehistory",
    EVM_TO_NATIVE_SWAP: "evmToNativeSwap",
    NATIVE_TO_EVM_SWAP: "nativeToEvmSwap",
    CLOSE_POPUP_SESSION: "closePopupSession",
    EXTERNAL_NATIVE_TRANSACTION_ARGS_AND_GAS: "externalNativeTransactionArgsAndGas",

    LOCK: "lock",
    UNLOCK: "unlock",
    ADD_ACCOUNT: "addAccount",
    GET_ACCOUNTS: "getAccounts",
    REMOVE_ACCOUNT: "removeAccount",
    FORGOT_PASS: "forgotPassByMnemonic",
    CREATE_OR_RESTORE: "createOrRestore",
    EXPORT_PRIVATE_KEY: "exportPrivatekey",
    EXPORT_SEED_PHRASE: "exportSeedPhrase",
    // RESET_VAULT_AND_PASS: "resetVaultAndPass",
    VERIFY_USER_PASSWORD: "verifyUserPassword",
    IMPORT_BY_MNEMONIC: "importAccountByMnemonics",

    //network related events
    NETWORK_CHANGE: "networkChange"
}

export const INTERNAL_EVENT_LABELS = {
    CONNECTION: "connection",
    BALANCE_FETCH: "balanceFetch",
    NEW_TRANSACTION_INQUEUE: "newTransactionInQueue",
    NEW_NATIVE_SIGNER_TRANSACTION_INQUEUE: "newNativeSignerTransactionInQueue",
    ERROR: "error"
}

export const STATE_CHANGE_ACTIONS = {
    BALANCE: "updateBalance",
    TX_HISTORY: "addNewTxHistory",
    TX_HISTORY_UPDATE: "updateTxHistory",
    CHANGE_NETWORK: "changeNetwork",
    CHANGE_ACCOUNT: "changeAccount",
    REMOVE_HISTORY_ITEM: "removeHistoryItem",

    //external controls state
    ADD_NEW_TX_TASK: "addNewTxTask",
    ADD_NEW_CONNECTION_TASK: "addNewConnectionTask",
    CHANGE_ACTIVE_SESSION: "changeActiveSession",
    APP_CONNECTION_UPDATE: "appConnectionUpdate",
    UPDATE_CURRENT_SESSION: "updateCurrentSession",

    //transaction queue state
    ADD_NEW_TRANSACTION: "addNewTransaction",
    PROCESS_QUEUE_TRANSACTION: "processQueuedTransaction",
    UPDATE_HISTORY_TRACK: "updateHistoryTrack",
    REMOVE_FAILED_TX: "removeFailedTx"
}

export const ERROR_EVENTS_LABELS = {
    CONNFAILED: "connfailed",
    NETWORK_ERROR: "networkError",
    INSUFFICENT_BALANCE: "insufficentBalance",
    ERROR_BALANCE_FETCH: "balance_fetch_error"
}

export const MESSAGE_TYPE_LABELS = {
    FEE_AND_BALANCE: "feeAndBalance",
    INTERNAL_TX: "internalTx",
    EXTENSION_BACKGROUND: "extensionBackground",
    EXTERNAL_TX_APPROVAL: "externalTxApproval",
    EXTENSION_UI: "extensionUi",
    EXTENSION_UI_KEYRING: "extensionUiKeyring",
    NETWORK_HANDLER: "networkHandler"
}

export const ROUTE_FOR_APPROVAL_WINDOWS = {
    APPROVE_TX: "approve-tx",
    CONNECTION_ROUTE: "login-approve",
    NATIVE_TX: "native-tx"
}


export const WALLET_TYPES = {
    HD: "hd_wallet",
    ETH_SIMPLE: "eth_simple",
    IMPORTED_NATIVE: "imported_native"
}

export const CONNECTION_METHODS = ["connect", "eth_requestAccounts", "eth_accounts", "get_endPoint"];

export const KEYRING_EVENTS = {
    STATE_CHANGED: "valut_state",
    ACCOUNT_ADDED: "account_added"
}

//restricted url
export const RESTRICTED_URLS = ["chrome://extensions"]


//third party url
export const THRID_PARTY_APIS = {
    ESD: "https://www.4byte.directory/api/v1/signatures/?hex_signature="
}