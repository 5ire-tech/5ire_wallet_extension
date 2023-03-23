import "./index.scss";
import App from "./App";
import React from "react";
import Context from "./Store";
import ReactDOM from "react-dom/client";
import { localStorage } from "./Storage";
import Browser from "webextension-polyfill";
import browser from "webextension-polyfill";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { CONNECTION_NAME, EMTY_STR} from "./Constants";
import {getDataLocal} from "../src/Storage/loadstore"

//For Dev Enviroment Check
const isDev = process.env.NODE_ENV === "development";

// eslint-disable-next-line no-extend-native
Number.prototype.noExponents = function () {
  try {
    var data = String(this).split(/[eE]/);
    if (data.length === 1) return data[0];
    var z = EMTY_STR,
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

  }
};

//find the root element for component injection
const root = ReactDOM.createRoot(document.getElementById("root"));

//init the main app
const initApp = (data) => {
  root.render(
    <Context>
      <MemoryRouter>
        <App data={data} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </MemoryRouter>
    </Context>
  );
};

(async () => {
  try {
  const res = await localStorage.get("popupRoute");
  browser.runtime.connect({ name: CONNECTION_NAME });

  //inject the current state into main app
  const currentLocalState = await getDataLocal("state");
  console.log("Current local state : ",currentLocalState);
  initApp(currentLocalState);

  } catch (err) {
    console.log("Error in the initlization of main app: ", err);
    root.render(
      <div>Something Bad Happend 😟</div>
    );
  }
})();