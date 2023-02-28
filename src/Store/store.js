/* global chrome */

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userSlice from "./reducer/auth";

// import logger from "redux-logger";

const rootReducer = combineReducers({
  auth: userSlice,
});

const store = configureStore({
  reducer: rootReducer,
  // middleware: [logger],
});

export default store;
