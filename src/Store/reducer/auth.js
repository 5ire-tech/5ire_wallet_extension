import { createSlice, current } from "@reduxjs/toolkit";

export const userState = {
  pass: null,

  accounts: [],

  currentAccount: {
    accountName: "",
    temp1m: "",
    evmAddress: "",
    nativeAddress: "",
    txHistory: [],
  },
  newAccount: null,

  uiData: {},

  httpEndPoints: {
    qa: "https://qa-http-nodes.5ire.network",
    testnet: "https://rpc-testnet.5ire.network"
  },

  wsEndPoints: {
    qa: "wss://qa-wss-nodes.5ire.network",
    testnet: "wss://wss-testnet.5ire.network"
  },

  balance: {
    evmBalance: "",
    nativeBalance: "",
    totalBalance: ""
  },

  currentNetwork: "Testnet",
  // currentNetwork: "QA",

  accountName: "",

  "eth_accounts": '',

  isLogin: false,

  // passError: false,

  connectedSites: [],
  isLoading: false,
  
  // isApiReady:false,
  
};

export const userSlice = createSlice({
  name: "auth",
  initialState: userState,
  reducers: {
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
      state.accounts.push(action.payload);
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
  
    // setBalance: (state, action) => {
    //   if (action.payload.of === "evm")
    //     state.balance.evmBalance = action.payload.balance;
    //   else if (action.payload.of === "native")
    //     state.balance.nativeBalance = action.payload.balance;
    // },
    
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
      state.accounts[action.payload.index].txHistory.push(action.payload.data);
      state.currentAccount.txHistory.push(action.payload.data);
    },

    updateTxHistory: (state, action) => {

     const currentTx =  state.currentAccount.txHistory.find((item) => {
      if(action.payload.isSwap) return item.txHash.mainHash === action.payload.txHash && item.isEvm;
      return item.txHash === action.payload.txHash && item.isEvm
     });
     const otherAcc = state.accounts.find(item => item.accountName === action.payload.accountName)
     const otherTx = otherAcc.txHistory.find((item) => {
      if(action.payload.isSwap) return item.txHash.mainHash === action.payload.txHash && item.isEvm;
      return item.txHash === action.payload.txHash && item.isEvm
     })

     if(currentTx) currentTx.status = action.payload.status ? "Success": "Failed";
     if(otherTx) otherTx.status = action.payload.status ? "Success": "Failed";

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
        // state.connectedSites.splice(siteIndex,1,action.payload)
      }
    },
    toggleLoader: (state, action) => {
      state.isLoading = action.payload;
    },

    // setApiReady : (state, action) => {
    //   state.isApiReady = action.payload;
    // }
  },
});

// Action creators are generated for each case reducer function
export const {
  setPassword,
  setCurrentAcc,
  setLogin,
  setAccountName,
  setAccounts,
  setCurrentNetwork,
  // setPassError,
  setUIdata,
  setBalance,
  setTxHistory,
  setSite,
  toggleSite,
  toggleLoader,
  pushAccounts,
  setNewAccount,
  resetBalance,
  updateTxHistory,
  // setApiReady
} = userSlice.actions;

export default userSlice.reducer;
