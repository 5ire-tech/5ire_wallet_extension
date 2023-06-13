import "./index.scss";
import App from "./App";
import React from "react";
import Context from "./Store";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { MemoryRouter } from "react-router-dom";
import { EMTY_STR, LABELS } from "./Constants";
import { getDataLocal } from "../src/Storage/loadstore";
import { sessionStorage } from "../src/Storage/index";
import { MessageOverStream } from "./Utility/message_helper";
// import Browser from "webextension-polyfill";

// eslint-disable-next-line no-extend-native
Number.prototype.noExponents = function () {
  try {
    let data = String(this).split(/[eE]/);
    if (data.length === 1) return data[0];
    let z = EMTY_STR,
      sign = this < 0 ? "-" : EMTY_STR,
      str = data[0].replace(".", EMTY_STR),
      mag = Number(data[1]) + 1;
    if (mag < 0) {
      z = sign + "0.";
      while (mag++) z += "0";
      // eslint-disable-next-line no-useless-escape
      return z + str.replace(/^\-/, EMTY_STR);
    }
    mag -= str.length;
    while (mag--) z += "0";
    return str + z;
  } catch (error) {
    console.log("Error in no exponent", error);
  }
};

//find the root element for component injection
const root = ReactDOM.createRoot(document.getElementById("root"));

//init the main app
const initApp = (data, externalControlsState, windowAndTabState) => {
  root.render(
    <MemoryRouter>
      <Context>
        <App
          data={data}
          externalControlsState={externalControlsState}
          windowAndTabState={windowAndTabState}
        />
        <Toaster />
      </Context>
    </MemoryRouter>
  );
};

(async () => {
  try {
    //connect to the background script using port longlive connection
    MessageOverStream.setupStream();

    //inject the current state into main app
    const currentLocalState = await getDataLocal(LABELS.STATE);
    const externalControlsState = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    const windowAndTabState = await getDataLocal(LABELS.WINDOW_AND_TAB_STATE);

    //created the transaction queue
    await getDataLocal(LABELS.TRANSACTION_QUEUE);

    const loginState = await sessionStorage.get(LABELS.ISLOGIN);
    currentLocalState.isLogin = !loginState?.isLogin ? false : currentLocalState?.isLogin;
    initApp(currentLocalState, externalControlsState, windowAndTabState);
  } catch (err) {
    console.log("Error in the initlization of main app: ", err);
    root.render(
      <div className="errPage">
        <center>
          <h2>Something Bad Happend 😟</h2>
        </center>
      </div>
    );
  }
})();
