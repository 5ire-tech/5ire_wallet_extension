import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import Context from "./Store";
import browser from "webextension-polyfill";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Browser from "webextension-polyfill";
import { CONNECTION_NAME } from "./Constants";

//For Dev Enviroment Check
const isDev = process.env.NODE_ENV === "development";

// eslint-disable-next-line no-extend-native
Number.prototype.noExponents = function () {
  try {
    var data = String(this).split(/[eE]/);
    if (data.length === 1) return data[0];
    var z = "",
      sign = this < 0 ? "-" : "",
      str = data[0].replace(".", ""),
      mag = Number(data[1]) + 1;
    if (mag < 0) {
      z = sign + "0.";
      while (mag++) z += "0";
      // eslint-disable-next-line no-useless-escape
      return z + str.replace(/^\-/, "");
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
  const res = await Browser.storage.local.get("popupRoute");

    browser.runtime.connect({ name: CONNECTION_NAME });
  
    //Listen for the context data is ready in state
    browser.runtime.onMessage.addListener((req) => {
      if (req.type === "APP_READY") {
        // Initializes the popup logic
        initApp(req.data);
      }});

  } catch (err) {
    console.log("Error in the initlization of main app: ", err);
    root.render(
      <div>Something Bad Happend 😟</div>
    );
  }
})();