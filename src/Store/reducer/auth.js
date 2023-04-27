import { STATUS } from "../../Constants";
import { hasProperty } from "../../Utility/utility";

//initial state
export const userState = {
  pass: null,

  accounts: [],

  popupChecks: {
    txApprove: false
  },

  currentAccount: {
    accountName: "",
    temp1m: "",
    evmAddress: "",
    nativeAddress: "",
    txHistory: [],
  },
  newAccount: null,

  uiData: {},

  // httpEndPoints: {
  //   qa: "https://qa-http-nodes.5ire.network",
  //   testnet: "https://rpc-testnet.5ire.network"
  //   // testnet: "http://52.15.41.233:9933"
  // },

  // api: {
  //   testnet: "https://explorer-api.5ire.network/api/firechain/explorer/get-transaction-by-hash/",
  //   qa: "https://qa-api-exp.5ire.network/api/firechain/explorer/get-transaction-by-hash/"
  // },

  // wsEndPoints: {
  //   qa: "wss://qa-wss-nodes.5ire.network",
  //   testnet: "wss://wss-testnet.5ire.network"
  //   // testnet: "ws://52.15.41.233:9944"
  // },

  balance: {
    evmBalance: "",
    nativeBalance: "",
    totalBalance: ""
  },

  // currentNetwork: "Testnet",
  currentNetwork: "QA",

  accountName: "",

  "eth_accounts": '',

  isLogin: false,

  connectedSites: [],

  isLoading: false,

};
export const OlState = {

  auth: {

    accountName: "qwert",

    accounts: [
      {
        accountName: "qwert",
        evmAddress: "0xb2141453Bcd544C63Bf129B5feee4F0C19D4e9B4",
        id: 1,
        nativeAddress: "5CdNHTUhpyPUswwg4cFEvtKmcvWtm9wBsTd85DmojvYPmbqa",
        temp1m: "e293d2b42ce3d8785890489479f13bb7:03ca1c869ca1fb99717685387a28424dce18be7ba6c6a3c30bc0893ccd4459772bc08859a02883ecc219dc2bee832a77d983685d0c79116b1c715a5dfc8c6d32c8823a4254de7c22a1",
        temp2p: null,
        txHistory: []
      }
    ],
    
    pass: "$2a$10$HdSn8LumIuk4DsHIBMd1s.V2elQtA0tErFc6k8sfRSY2tlkqHkW36",


    balance: { evmBalance: '0', nativeBalance: '0', totalBalance: '0' },

    connectedSites: [],

    currentAccount: {
      accountName: 'qwert',
      evmAddress: '0xb2141453Bcd544C63Bf129B5feee4F0C19D4e9B4',
      id: 1,
      nativeAddress: '5CdNHTUhpyPUswwg4cFEvtKmcvWtm9wBsTd85DmojvYPmbqa',
      temp1m: 'e293d2b42ce3d8785890489479f13bb7:03ca1c869ca1fb997…983685d0c79116b1c715a5dfc8c6d32c8823a4254de7c22a1',
      temp2p: null
    },

    currentNetwork: "Testnet",
    api: { native: 'https://explorer-api.5ire.network/api/firechain/explorer/get-transaction-by-hash/' },

    eth_accounts: "",

    httpEndPoints: {
      qa: 'https://qa-http-nodes.5ire.network',
      testnet: 'https://rpc-testnet.5ire.network'
    },

    isLoading: false,

    isLogin: true,

    newAccount: null,

    popupChecks: { txApprove: false },

    uiData: {},

    wsEndPoints: {
      qa: 'wss://qa-wss-nodes.5ire.network',
      testnet: 'wss://wss-testnet.5ire.network'
    }
  }

}
//all reducers methods
const reducers = {

  setTxPopup: (state, action) => {
    state.popupChecks.txApprove = action.payload
  },

  setPassword: (state, action) => {
    state.pass = action.payload;
  },

  setCurrentAcc: (state, action) => {
    state.currentAccount = action.payload;
  },

  setAccounts: (state, action) => {
    state.accounts = action.payload;
  },

  pushAccounts: (state, action) => {
    let accounts = state.accounts;

    if (accounts.length > 0) {
      let res = accounts.find(acc => acc.accountName === action.payload.accountName);

      if (!res) {
        state.accounts.push(action.payload);
      }

    } else {
      state.accounts.push(action.payload);
    }
  },

  setLogin: (state, action) => {
    state.isLogin = action.payload;
  },

  setUIdata: (state, action) => {
    state.uiData = action.payload;
  },

  setAccountName: (state, action) => {
    state.accountName = action.payload;
  },

  setNewAccount: (state, action) => {
    state.newAccount = action.payload;
  },

  setCurrentNetwork: (state, action) => {
    state.currentNetwork = action.payload;
  },


  setBalance: (state, action) => {
    state.balance.evmBalance = action.payload.evmBalance;
    state.balance.nativeBalance = action.payload.nativeBalance;
    state.balance.totalBalance = action.payload.totalBalance;
  },

  resetBalance: (state) => {
    state.balance = {
      evmBalance: "",
      nativeBalance: "",
    }
  },

  setTxHistory: (state, action) => {
    const isSwap = action.payload.data.type.toLowerCase() === "swap";
    let txData = null, txData1 = null;
    if (isSwap) {
      txData1 = state.currentAccount.txHistory.find(item => item.txHash.mainHash === action.payload.data.txHash.mainHash)
      txData = state.accounts[action.payload.index].txHistory.find(item => item.txHash.mainHash === action.payload.data.txHash.mainHash)

    } else {
      txData = state.accounts[action.payload.index].txHistory.find(item => item.txHash === action.payload.data.txHash)
      txData1 = state.currentAccount.txHistory.find(item => item.txHash === action.payload.data.txHash)
    }

    if (!txData) {
      state.accounts[action.payload.index].txHistory.push(action.payload.data);
    }
    if (!txData1) {
      state.currentAccount.txHistory.push(action.payload.data);
    }

  },

  updateTxHistory: (state, action) => {

    const currentTx = state.currentAccount.txHistory.find((item) => {
      if (action.payload.isSwap) return item.txHash.mainHash === action.payload.txHash;
      return item.txHash === action.payload.txHash
    });

    const otherAcc = state.accounts.find(item => item.accountName === action.payload.accountName);

    const otherTx = otherAcc.txHistory.find((item) => {
      if (action.payload.isSwap) return item.txHash.mainHash === action.payload.txHash
      return item.txHash === action.payload.txHash
    })

    if (currentTx) currentTx.status = typeof (action.payload.status) === "string" ? action.payload.status : action.payload.status ? STATUS.SUCCESS : STATUS.FAILED;
    if (otherTx) otherTx.status = typeof (action.payload.status) === "string" ? action.payload.status : action.payload.status ? STATUS.SUCCESS : STATUS.FAILED;

  },

  setSite: (state, action) => {
    state?.connectedSites.push(action.payload);
  },

  toggleSite: (state, action) => {
    const siteIndex = state?.connectedSites.findIndex(
      (st) => (st.origin = action.payload.origin)
    );
    if (siteIndex > -1) {
      state.connectedSites[siteIndex].isConnected =
        action.payload.isConnected;
    }
  },
  toggleLoader: (state, action) => {
    state.isLoading = action.payload;
  },
}

//main reducer
export const mainReducer = (state = userState, action) => {
  try {
    const isFound = hasProperty(reducers, action.type);


    if (isFound) {

      const copyState = { ...state }
      if (!(JSON.stringify(state.balance) === JSON.stringify(action.payload))) {
        reducers[action.type](copyState, action);
      }
      return copyState;
    } return state
  } catch (err) {
    console.log("Error in Reducer: ", err);
    return state
  }
}
