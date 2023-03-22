export const EVM = "Evm";
export const NATIVE = "Native";
export const TEMP2P = "temp2p";
export const TEMP1M = "temp1m";
export const COPIED = "Copied!";
export const DECIMALS = 10 ** 18;
export const CONNECTION_NAME = "5IRE_EXT";
export const PORT_NAME = "WEBEXT_REDUX_TEST";
export const UI_CONNECTION_NAME = "5IRE_EXT_UI";
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

};


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