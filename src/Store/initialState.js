import { NETWORK } from "../Constants";

export const userState = {
  vault: null,

  txHistory: {},

  isLogin: false,

  eth_accounts: "",

  // currentNetwork: "QA",
  currentNetwork: NETWORK.QA_NETWORK,

  allAccountsBalance: {},

  currentAccount: {
    evmAddress: "",
    accountName: "",
    accountIndex: "",
    nativeAddress: ""
  },

  pendingTransactionBalance: {},

  tokens: {}
};

export const externalControls = {
  connectedApps: {},
  activeSession: null,
  connectionQueue: []
};

export const newAccountInitialState = {
  mnemonic: "",
  evmAddress: "",
  accountName: "",
  accountIndex: "",
  nativeAddress: "",
  evmPrivateKey: ""
};

//initial state for external native transaction
export const initialExternalNativeTransaction = {
  method: "",
  fee: "",
  args: "",
  txHash: ""
};

//initial state for current active window and active tab
export const windowAndTabState = {
  windowId: 0,
  tabDetails: {
    origin: "",
    url: "",
    tabId: 0
  }
};

// initial state for transaction queue
export const transactionQueue = (() => {
  const queues = {};
  Object.values(NETWORK).forEach((item) => {
    queues[item.toLowerCase()] = {
      txQueue: [],
      currentTransaction: null
    };
  });
  return queues;
})();
