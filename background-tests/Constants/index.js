"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ZERO_CHAR = exports.WS_END_POINTS = exports.WINDOW_WIDTH = exports.WINDOW_HEIGHT = exports.WEI_IN_ONE_ETH = exports.WALLET_TYPES = exports.WALLET_METHODS = exports.VERSION = exports.VALIDATOR_NOMINATOR_METHOD = exports.VALIDATION_METHODS_VD_NM = exports.UI_CONNECTION_NAME = exports.TX_TYPE = exports.TRANSACTION_STATUS_CHECK_TIMER = exports.THRID_PARTY_APIS = exports.TABS_EVENT = exports.SUCCESS_MESSAGES = exports.STREAM_CHANNELS = exports.STORAGE = exports.STATUS = exports.STATE_CHANGE_ACTIONS = exports.SOCIAL_LINKS = exports.SIGNER_METHODS = exports.ROUTE_FOR_APPROVAL_WINDOWS = exports.RESTRICTED_URLS = exports.RESTRICTED_METHODS = exports.RESTRICTED_FOR_CONTENT_SCRIPT = exports.RESTRICTED_ETHEREUM_METHODS = exports.RELOAD_ID = exports.REGEX = exports.PVT_KEY = exports.PORT_NAME = exports.ONE_ETH_IN_GWEI = exports.NETWORK = exports.NATIVE = exports.MNEMONIC = exports.MESSAGE_TYPE_LABELS = exports.MESSAGE_EVENT_LABELS = exports.MESSAGES = exports.MAIN_POPUP = exports.LAPSED_TRANSACTION_CHECKER_TIMER = exports.LABELS = exports.KEYRING_EVENTS = exports.INTERNAL_EVENT_LABELS = exports.HTTP_METHODS = exports.HTTP_END_POINTS = exports.HTTP_CONTENT_TYPE = exports.EXTRA_FEE = exports.EXPLORERS = exports.EXISTENTIAL_DEPOSITE = exports.EVM_JSON_RPC_METHODS = exports.EVM = exports.ERROR_MESSAGES = exports.ERROR_EVENTS_LABELS = exports.ERRCODES = exports.EMTY_STR = exports.DECIMALS = exports.CURRENCY = exports.COPIED = exports.CONNECTION_NAME = exports.CONNECTION_METHODS = exports.AUTO_BALANCE_UPDATE_TIMER = exports.API = void 0;
const EMTY_STR = "";
exports.EMTY_STR = EMTY_STR;
const ZERO_CHAR = "0";
exports.ZERO_CHAR = ZERO_CHAR;
const CURRENCY = "5ire";
exports.CURRENCY = CURRENCY;
const EVM = "EVM";
exports.EVM = EVM;
const NATIVE = "Native";
exports.NATIVE = NATIVE;
const COPIED = "Copied!";
exports.COPIED = COPIED;
const MNEMONIC = "mnemonic";
exports.MNEMONIC = MNEMONIC;
const PVT_KEY = "privateKey";
exports.PVT_KEY = PVT_KEY;
const MAIN_POPUP = "MAIN_POPUP";
exports.MAIN_POPUP = MAIN_POPUP;
const CONNECTION_NAME = "5IRE_EXT";
exports.CONNECTION_NAME = CONNECTION_NAME;
const PORT_NAME = "WEBEXT_REDUX_TEST";
exports.PORT_NAME = PORT_NAME;
const UI_CONNECTION_NAME = "5IRE_EXT_UI";
exports.UI_CONNECTION_NAME = UI_CONNECTION_NAME;
const RESTRICTED_FOR_CONTENT_SCRIPT = "chrome-extension://";
exports.RESTRICTED_FOR_CONTENT_SCRIPT = RESTRICTED_FOR_CONTENT_SCRIPT;
const EXTRA_FEE = 0.001;
exports.EXTRA_FEE = EXTRA_FEE;
const WINDOW_WIDTH = 400;
exports.WINDOW_WIDTH = WINDOW_WIDTH;
const DECIMALS = 10 ** 18;
exports.DECIMALS = DECIMALS;
const WINDOW_HEIGHT = 620;
exports.WINDOW_HEIGHT = WINDOW_HEIGHT;
const EXISTENTIAL_DEPOSITE = 1;
exports.EXISTENTIAL_DEPOSITE = EXISTENTIAL_DEPOSITE;
const ONE_ETH_IN_GWEI = 1000000000;
exports.ONE_ETH_IN_GWEI = ONE_ETH_IN_GWEI;
const AUTO_BALANCE_UPDATE_TIMER = 8000;
exports.AUTO_BALANCE_UPDATE_TIMER = AUTO_BALANCE_UPDATE_TIMER;
const LAPSED_TRANSACTION_CHECKER_TIMER = 25 * 1000;
exports.LAPSED_TRANSACTION_CHECKER_TIMER = LAPSED_TRANSACTION_CHECKER_TIMER;
const WEI_IN_ONE_ETH = 1000000000000000000;
exports.WEI_IN_ONE_ETH = WEI_IN_ONE_ETH;
const TRANSACTION_STATUS_CHECK_TIMER = 1000;
exports.TRANSACTION_STATUS_CHECK_TIMER = TRANSACTION_STATUS_CHECK_TIMER;
const VERSION = "0.1.4";
exports.VERSION = VERSION;
const RELOAD_ID = "RELOAD_PAGE";

//tabs event
exports.RELOAD_ID = RELOAD_ID;
const TABS_EVENT = {
  ACCOUNT_CHANGE_EVENT: "accountsChanged",
  NETWORK_CHANGE_EVENT: "networkChanged",
  WALLET_CONNECTED_EVENT: "connect",
  WALLET_DISCONNECTED_EVENT: "disconnect",
  PROVIDER_CONFIG: "providerConfig"
};

/* Regular expressions */
exports.TABS_EVENT = TABS_EVENT;
const REGEX = {
  MIN_LENGTH: /.{8,}/,
  DIGITS: /(?=.*?[0-9])/,
  LOWERCASE: /(?=.*?[a-z])/,
  UPPERCASE: /(?=.*?[A-Z])/,
  WALLET_NAME: /^[a-z0-9\s]+$/i,
  SPECIAL_CHAR: /(?=.*?[#?!@$%^&*-])/
};
exports.REGEX = REGEX;
const STORAGE = {
  LOCAL: "local",
  SESSION: "session"
};
exports.STORAGE = STORAGE;
const TX_TYPE = {
  SWAP: "Swap",
  SEND: "Transfer",
  NATIVE_APP: "Native App",
  NATIVE_SIGNER: "Native Signer",
  CONTRACT_EXECUTION: "Contract Execution",
  CONTRACT_DEPLOYMENT: "Contract Deployment"
};
exports.TX_TYPE = TX_TYPE;
const NETWORK = {
  UAT: "UAT",
  QA_NETWORK: "QA",
  TEST_NETWORK: "Testnet"
};
exports.NETWORK = NETWORK;
const STATUS = {
  FAILED: "Failed",
  QUEUED: "Queued",
  PENDING: "Pending",
  SUCCESS: "Success"
};
exports.STATUS = STATUS;
const HTTP_METHODS = {
  PUT: "PUT",
  GET: "GET",
  POST: "POST",
  PATCH: "PATCH",
  DELETE: "DELETE"
};
exports.HTTP_METHODS = HTTP_METHODS;
const HTTP_CONTENT_TYPE = {
  JSON: "application/json"
};
exports.HTTP_CONTENT_TYPE = HTTP_CONTENT_TYPE;
const EVM_JSON_RPC_METHODS = {
  ETH_ACCOUNTS: "eth_accounts",
  GET_TX_RECIPT: "eth_getTransactionReceipt",
  ETH_REQUEST_ACCOUNT: "eth_requestAccounts",
  ETH_CHAINID: "eth_chainId"
};
exports.EVM_JSON_RPC_METHODS = EVM_JSON_RPC_METHODS;
const ERROR_MESSAGES = {
  ERR_OCCURED: "Error occured.",
  PASS_REQUIRED: "Password required.",
  INVALID_AMOUNT: "Amount is invalid.",
  NO_ROOT_ACC: "No root account exists",
  INVALID_QUERY: "Query key is invalid",
  LOGOUT_ERR: "Error while logging out",
  INVALID_MNEMONIC: "Invalid mnemonic.",
  INCORRECT_PASS: "Incorrect password.",
  INCORRECT_ADDRESS: "Invalid address.",
  INCORRECT_KEYRING: "Invalid keyring.",
  ACCOUNT_EXISTS: "Account already exist",
  INPUT_REQUIRED: "This field is required.",
  PASS_DONT_MATCH: "Password do not match.",
  INVALID_EVENT_LABEL: "Invalid event Label",
  INVALID_TYPE_LABEL: "Invalid type Label",
  INSUFFICENT_BALANCE: "Insufficient Balance.",
  UNDEF_PROPERTY: "Object not has given property",
  AMOUNT_CANT_BE_0: "Amount can't be 0 or less than 0",
  SINGER_ERROR: "Error while signing the the raw/payload",
  ENTER_AMOUNT_CORRECTLY: "Please enter amount correctly.",
  WALLET_NAME_ALREADY_EXISTS: "Wallet name already exists.",
  NOT_VALID_JSON_RPC_METHOD: "JSON-RPC method is not valid.",
  INTERNAL_ERROR: "Something wrong happend, please try again",
  PASS_CREATED_SUCCESS: "Successfully created password for user.",
  AMOUNT_DATA_CHECK: "To or Data is fields is missing from request",
  NO_ACC_EXISTS_WITH_THIS_ADDR: "No account exist with this address.",
  AMOUNT_CANT_LESS_THEN_ONE: "Swap amount can't be less than 1 5ire",
  ALPHANUMERIC_CHARACTERS: "Please enter alphanumeric characters only.",
  MNEMONICS_ALREADY_EXISTS: "Wallet with this mnemonic already exists.",
  NOT_YOUR_OWN_ADDRESS: "Recipient address should not be your own address.",
  EXTERNAL_NATIVE_TRANSACTION_ERROR: "Error while external native transaction.",
  ACCESS_NOT_GRANTED: "The requested method has not been authorized by the user",
  ERROR_WHILE_TRANSACTION_STATUS_CHECK: "Error while fething the transaction recipt.",
  ACCOUNT_ACCESS_NOT_GRANTED: "The requested account has not been authorized by the user",
  ERROR_WHILE_TRANSACTION: "Transaction failed, error occured during transaction processing",
  INSUFFICENT_BALANCE_VD_NM: "Insufficient Funds: Fee + Amount is more than available balance.",
  ERROR_WHILE_GAS_ESTIMATION: "Gas Estimation Failed, something wrong happend while gas estimation",
  INVALID_MSG_ARRAY_AND_OBJECTS_ALLOWED: "Invalid message, (*Only Objects or Arrays are valid value)",
  ERROR_WHILE_NETWORK_CONNECTION: "Network Connection Error, please change network or try again later",
  CREATE_PASS_MSG: "Password must have at least 8 characters, combination of Mixed case, 1 Special Character and 1 Number.",
  INVALID_PROPERTY: "Invalid property.",
  UNDEF_DATA: "Value is null or undefined.",
  INVALID_TYPE: "argument type is invalid.",
  REJECTED_BY_USER: "Request rejected by user.",
  NETWORK_REQUEST: "Network error try after sometime",
  UNABLE_TO_REMOVE_ACC: "Unable to remove the account.",
  TX_FAILED: "Transaction failed. some wrong happend.",
  INVALID_METHOD: "Method is not the part of system.",
  INVAILD_ERROR_MESSAGE: "Error message must be an object.",
  INVALID_RPC_OPERATION: "RPC is not the part of rpc call system",
  INVALID_NON_RPC_TASK: "Task is not defined in non-rpc task handler class",
  INVALID_ERROR_PAYLOAD: "Error payload is invalid, (missing required properties).",
  INPUT_BETWEEN_2_TO_18: "Please input account name between " + 2 + " and " + 18 + " characters."
};
exports.ERROR_MESSAGES = ERROR_MESSAGES;
const SUCCESS_MESSAGES = {
  DISCONNECTED: "Disconnected.",
  LOGIN_SUCCESS: "Login successfully.",
  LOGOUT_SUCCESS: "Logout successfully",
  HASH_COPIED: "Transacion hash copied.",
  PASS_CREATED_SUCCESS: "Successfully created password for user."
};
exports.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
const MESSAGES = {
  ED: "5ireChain requires a minimum of 1 5ire to keep your wallet active",
  WALLET_CREATED: "Your wallet has been created"
};
exports.MESSAGES = MESSAGES;
const ERRCODES = {
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
  RUNTIME_MESSAGE_SECTION_ERROR: 15,
  ERROR_WHILE_TRANSACTION_STATUS_CHECK: 16
};
exports.ERRCODES = ERRCODES;
const LABELS = {
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
  WINDOW_AND_TAB_STATE: "windowAndTabState",
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
  CONTRACT: "Contract Deployment",
  EVM_TO_NATIVE: "EVM to Native",
  NATIVE_TO_EVM: "Native to EVM",
  //for section and method's
  STACKING_REWARD: "staking.Rewarded"
};
exports.LABELS = LABELS;
const HTTP_END_POINTS = {
  QA: "https://qa-http-nodes.5ire.network",
  UAT: "https://uat-http-nodes.5ire.network",
  TESTNET: "https://rpc-testnet.5ire.network"
};
exports.HTTP_END_POINTS = HTTP_END_POINTS;
const SOCIAL_LINKS = {
  FACEBOOK: "https://www.facebook.com/5irechain/",
  INSTAGRAM: "https://www.instagram.com/5irechain/",
  LINKDIN: "https://www.linkedin.com/company/5irechain/",
  POLICY: "https://5ire-wallet-extension.s3.amazonaws.com/5ire-wallet-extension-privacy-policy.pdf"
};
exports.SOCIAL_LINKS = SOCIAL_LINKS;
const API = {
  QA: "https://qa-api-exp.5ire.network/api/firechain/explorer/get-transaction-by-hash/",
  UAT: "https://uat-api-exp.5ire.network/api/firechain/explorer/get-transaction-by-hash/",
  TESTNET: "https://explorer-api.5ire.network/api/firechain/explorer/get-transaction-by-hash/"
};
exports.API = API;
const EXPLORERS = {
  QA: "https://qa-web-exp.5ire.network",
  UAT: "https://uat-web-exp.5ire.network",
  TESTNET: "https://explorer.5ire.network"
};
exports.EXPLORERS = EXPLORERS;
const WS_END_POINTS = {
  QA: "wss://qa-wss-nodes.5ire.network",
  UAT: "wss://uat-wss-nodes.5ire.network",
  TESTNET: "wss://wss-testnet.5ire.network"
};
exports.WS_END_POINTS = WS_END_POINTS;
const MESSAGE_EVENT_LABELS = {
  NATIVE_SIGNER: "nativeSigner",
  VALIDATOR_NOMINATOR_FEE: "validatorNominatorFee",
  VALIDATOR_NOMINATOR_TRANSACTION: "validatorNominatorTransaction",
  EXTERNAL_NATIVE_TRANSACTION_ARGS_AND_GAS: "externalNativeTransactionArgsAndGas",
  TX_HASH: "txHash",
  EVM_FEE: "evmFee",
  EVM_TX: "evmTransfer",
  BALANCE: "getBalance",
  NATIVE_FEE: "nativeFee",
  NATIVE_TX: "nativeTransfer",
  LOGIN_UPDATE: "loginUpdate",
  NOTIFICATION: "notification",
  BACKGROUND_ERROR: "backgroundError",
  UPDATE_TX_HISTORY: "txupdatehistory",
  EVM_TO_NATIVE_SWAP: "evmToNativeSwap",
  NATIVE_TO_EVM_SWAP: "nativeToEvmSwap",
  CLOSE_POPUP_SESSION: "closePopupSession",
  LOCK: "lock",
  UNLOCK: "unlock",
  ADD_ACCOUNT: "addAccount",
  GET_ACCOUNTS: "getAccounts",
  REMOVE_ACCOUNT: "removeAccount",
  FORGOT_PASS: "forgotPassByMnemonic",
  CREATE_OR_RESTORE: "createOrRestore",
  EXPORT_PRIVATE_KEY: "exportPrivatekey",
  EXPORT_SEED_PHRASE: "exportSeedPhrase",
  RECOVER_OLD_ACCOUNTS: "recoverOldStateAccounts",
  VERIFY_USER_PASSWORD: "verifyUserPassword",
  IMPORT_BY_MNEMONIC: "importAccountByMnemonics",
  //network related events
  NETWORK_CONNECTION_ERROR: "networkConnectionError",
  NETWORK_CHANGE: "networkChange",
  NETWORK_CHECK: "networkCheck"
};
exports.MESSAGE_EVENT_LABELS = MESSAGE_EVENT_LABELS;
const INTERNAL_EVENT_LABELS = {
  ERROR: "error",
  CONNECTION: "connection",
  CHECK_NETWORK_CONNECTION: "checkNetworkConnection",
  BALANCE_FETCH: "balanceFetch",
  NEW_TRANSACTION_INQUEUE: "newTransactionInQueue",
  NEW_NATIVE_SIGNER_TRANSACTION_INQUEUE: "newNativeSignerTransactionInQueue",
  LAPSED_TRANSACTION_CHECK: "lapsedTransactionCheck"
};
exports.INTERNAL_EVENT_LABELS = INTERNAL_EVENT_LABELS;
const STATE_CHANGE_ACTIONS = {
  BALANCE: "updateBalance",
  UPDATE_PENDING_TRANSACTION_BALANCE: "updatePendingTransactionBalance",
  TX_HISTORY: "addNewTxHistory",
  CHANGE_NETWORK: "changeNetwork",
  CHANGE_ACCOUNT: "changeAccount",
  TX_HISTORY_UPDATE: "updateTxHistory",
  SAVE_ERRORED_FAILED_TRANSACTION: "saveErroredFailedTransaction",
  //external controls state
  ADD_NEW_TX_TASK: "addNewTxTask",
  CHANGE_ACTIVE_SESSION: "changeActiveSession",
  APP_CONNECTION_UPDATE: "appConnectionUpdate",
  UPDATE_CURRENT_SESSION: "updateCurrentSession",
  ADD_NEW_CONNECTION_TASK: "addNewConnectionTask",
  CLEAR_ALL_EXTERNAL_REQUESTS: "clearAllExternalRequests",
  //transaction queue state
  REMOVE_FAILED_TX: "removeFailedTx",
  ADD_NEW_TRANSACTION: "addNewTransaction",
  UPDATE_HISTORY_TRACK: "updateHistoryTrack",
  PROCESS_QUEUE_TRANSACTION: "processQueuedTransaction",
  CLEAR_TRANSACTION_QUEUE: "clearTransactionQueue",
  //window and tabs state
  SAVE_TAB_AND_WINDOW_STATE: "saveTabAndWindowState"
};
exports.STATE_CHANGE_ACTIONS = STATE_CHANGE_ACTIONS;
const ERROR_EVENTS_LABELS = {
  CONNFAILED: "connfailed",
  NETWORK_ERROR: "networkError",
  INSUFFICENT_BALANCE: "insufficentBalance",
  ERROR_BALANCE_FETCH: "balance_fetch_error"
};
exports.ERROR_EVENTS_LABELS = ERROR_EVENTS_LABELS;
const MESSAGE_TYPE_LABELS = {
  EXTENSION_UI: "extensionUi",
  INTERNAL_TX: "internalTx",
  FEE_AND_BALANCE: "feeAndBalance",
  NETWORK_HANDLER: "networkHandler",
  EXTERNAL_TX_APPROVAL: "externalTxApproval",
  EXTENSION_UI_KEYRING: "extensionUiKeyring",
  EXTENSION_BACKGROUND: "extensionBackground",
  VALIDATOR_NOMINATOR_HANDLER: "validatorNominatorHandler"
};
exports.MESSAGE_TYPE_LABELS = MESSAGE_TYPE_LABELS;
const ROUTE_FOR_APPROVAL_WINDOWS = {
  NATIVE_TX: "native-tx",
  APPROVE_TX: "approve-tx",
  CONNECTION_ROUTE: "login-approve",
  VALIDATOR_NOMINATOR_TXN: "validator-nomiator-tx"
};
exports.ROUTE_FOR_APPROVAL_WINDOWS = ROUTE_FOR_APPROVAL_WINDOWS;
const WALLET_TYPES = {
  HD: "hd_wallet",
  ETH_SIMPLE: "eth_simple",
  IMPORTED_NATIVE: "imported_native"
};
exports.WALLET_TYPES = WALLET_TYPES;
const KEYRING_EVENTS = {
  STATE_CHANGED: "valut_state",
  ACCOUNT_ADDED: "account_added"
};

//restricted url
exports.KEYRING_EVENTS = KEYRING_EVENTS;
const RESTRICTED_URLS = ["chrome://extensions"];

//third party url
exports.RESTRICTED_URLS = RESTRICTED_URLS;
const THRID_PARTY_APIS = {
  ESD: "https://www.4byte.directory/api/v1/signatures/?hex_signature="
};
exports.THRID_PARTY_APIS = THRID_PARTY_APIS;
const STREAM_CHANNELS = {
  CONTENTSCRIPT: "Content-Script",
  EXTENSION_UI: "Extension-UI"
};

/*
 * wallet restricted methods */
exports.STREAM_CHANNELS = STREAM_CHANNELS;
const VALIDATOR_NOMINATOR_METHOD = {
  NATIVE_RENOMINATE: "native_renominate",
  NATIVE_ADD_NOMINATOR: "native_add_nominator",
  NATIVE_ADD_VALIDATOR: "native_add_validator",
  NATIVE_STOP_NOMINATOR: "native_stop_nominator",
  NATIVE_STOP_VALIDATOR: "native_stop_validator",
  NATIVE_UNBOND_NOMINATOR: "native_unbond_nominator",
  NATIVE_NOMINATOR_PAYOUT: "native_nominator_payout",
  NATIVE_UNBOND_VALIDATOR: "native_unbond_validator",
  NATIVE_VALIDATOR_PAYOUT: "native_validator_payout",
  NATIVE_RESTART_VALIDATOR: "native_restart_validator",
  NATIVE_NOMINATOR_BONDMORE: "native_nominator_bondmore",
  NATIVE_VALIDATOR_BONDMORE: "native_validator_bondmore",
  NATIVE_WITHDRAW_NOMINATOR: "native_withdraw_nominator",
  NATIVE_WITHDRAW_VALIDATOR: "native_withdraw_validator",
  NATIVE_WITHDRAW_NOMINATOR_UNBONDED: "native_withdraw_nominator_unbonded",
  NATIVE_WITHDRAW_VALIDATOR_UNBONDED: "native_withdraw_validator_unbonded"
};
exports.VALIDATOR_NOMINATOR_METHOD = VALIDATOR_NOMINATOR_METHOD;
const CONNECTION_METHODS = {
  CONNECT: "connect",
  ETH_REQUEST_ACCOUNTS: "eth_requestAccounts",
  ETH_ACCOUNTS: "eth_accounts"
};
exports.CONNECTION_METHODS = CONNECTION_METHODS;
const WALLET_METHODS = {
  DISCONNECT: "disconnect",
  GET_END_POINT: "get_endPoint"
};
exports.WALLET_METHODS = WALLET_METHODS;
const SIGNER_METHODS = {
  SIGN_RAW: "signRaw",
  SIGN_PAYLOAD: "signPayload"
};
exports.SIGNER_METHODS = SIGNER_METHODS;
const RESTRICTED_ETHEREUM_METHODS = {
  ETH_SEND_TRANSACTION: "eth_sendTransaction"
};

//array of all wallet handled method
exports.RESTRICTED_ETHEREUM_METHODS = RESTRICTED_ETHEREUM_METHODS;
const RESTRICTED_METHODS = [...Object.values(VALIDATOR_NOMINATOR_METHOD), ...Object.values(CONNECTION_METHODS), ...Object.values(WALLET_METHODS), ...Object.values(SIGNER_METHODS), ...Object.values(RESTRICTED_ETHEREUM_METHODS)];
exports.RESTRICTED_METHODS = RESTRICTED_METHODS;
const VALIDATION_METHODS_VD_NM = [VALIDATOR_NOMINATOR_METHOD.NATIVE_VALIDATOR_BONDMORE, VALIDATOR_NOMINATOR_METHOD.NATIVE_NOMINATOR_BONDMORE, VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR, VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR, VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_NOMINATOR, VALIDATOR_NOMINATOR_METHOD.NATIVE_WITHDRAW_VALIDATOR];
exports.VALIDATION_METHODS_VD_NM = VALIDATION_METHODS_VD_NM;