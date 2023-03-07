import { configureStore } from "@reduxjs/toolkit";
import {mainReducer} from "./reducer/auth";
// import logger from "redux-logger";

const store = configureStore({
  reducer: mainReducer,
  // middleware: [logger],
});

export default store;
