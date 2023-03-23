import React, {useState} from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import Context from "./Store";
import browser from "webextension-polyfill";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Browser from "webextension-polyfill";
import { log } from "./Utility/utility";
import { CONNECTION_NAME } from "./Constants";
// import { Store } from "./Scripts/webext-redux/dist/webext-redux";

const isDev = process.env.NODE_ENV === "development";
// import reportWebVitals from "./reportWebVitals";

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

const initApp = (data) => {
  
  const root = ReactDOM.createRoot(document.getElementById("root"));

  
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
  
  log("here the route: ", res, window);

  if (!isDev) {
    browser.runtime.connect({ name: CONNECTION_NAME });
  
    // Listens for when the store gets initialized
    browser.runtime.onMessage.addListener((req) => {
      if (req.type === "STORE_INITIALIZED") {
        // Initializes the popup logic
        initApp(req.data);
      }});
  } else {
  
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
        <Context>
          <MemoryRouter>
            <App />
            <ToastContainer
              position="top-right"
              autoClose={4000}
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
    // reportWebVitals();
  }
  


  } catch (err) {
    console.log("Error in the initlization of main app: ", err);
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <div>Something Bad Happend 😟</div>
    );
  }
})();