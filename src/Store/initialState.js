import { NETWORK } from "../Constants";

export const userState = {
  vault: null,

  txHistory: {},

  isLogin: false,

  eth_accounts: "",

  currentNetwork: "Testnet",

  allAccountsBalance: {},

  currentAccount: {
    evmAddress: "",
    accountName: "",
    accountIndex: "",
    nativeAddress: ""
  },

  pendingTransactionBalance: {}
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
