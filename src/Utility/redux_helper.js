import { REDUX_ACTIONS } from '../Constants'

export const setTxPopup = (payload) => {
  return {
    type: REDUX_ACTIONS.setTxPopup,
    payload: payload,
  }
}

export const setPassword = (payload) => {
  return {
    type: REDUX_ACTIONS.setPassword,
    payload: payload,
  }
}

export const setCurrentAcc = (payload) => {
  return {
    type: REDUX_ACTIONS.setCurrentAcc,
    payload: payload,
  }
}

export const setAccounts = (payload) => {
  return {
    type: REDUX_ACTIONS.setAccounts,
    payload: payload,
  }
}

export const pushAccounts = (payload) => {
  return {
    type: REDUX_ACTIONS.pushAccounts,
    payload: payload,
  }
}

export const setLogin = (payload) => {
  return {
    type: REDUX_ACTIONS.setLogin,
    payload: payload,
  }
}

export const setUIdata = (payload) => {
  return {
    type: REDUX_ACTIONS.setUIdata,
    payload: payload,
  }
}

export const setAccountName = (payload) => {
  return {
    type: REDUX_ACTIONS.setAccountName,
    payload: payload,
  }
}

export const setNewAccount = (payload) => {
  return {
    type: REDUX_ACTIONS.setNewAccount,
    payload: payload,
  }
}

export const setCurrentNetwork = (payload) => {
  return {
    type: REDUX_ACTIONS.setCurrentNetwork,
    payload: payload,
  }
}

export const setBalance = (payload) => {
  return {
    type: REDUX_ACTIONS.setBalance,
    payload: payload,
  }
}

//duplicate need to be removed
export const resetBalance = () => {
  return {
    type: REDUX_ACTIONS.resetBalance,
  }
}

export const setTxHistory = (payload) => {
  return {
    type: REDUX_ACTIONS.setTxHistory,
    payload: payload,
  }
}

export const updateTxHistory = (payload) => {
  return {
    type: REDUX_ACTIONS.updateTxHistory,
    payload: payload,
  }
}

export const setSite = (payload) => {
  return {
    type: REDUX_ACTIONS.setSite,
    payload: payload,
  }
}

export const toggleSite = (payload) => {
  return {
    type: REDUX_ACTIONS.toggleSite,
    payload: payload,
  }
}

export const toggleLoader = (payload) => {
  return {
    type: REDUX_ACTIONS.toggleLoader,
    payload: payload,
  }
}
