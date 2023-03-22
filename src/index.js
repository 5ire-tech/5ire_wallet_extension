import React, {useState} from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
// import reportWebVitals from "./reportWebVitals";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Store } from "./Scripts/webext-redux/dist/webext-redux";
import { CONNECTION_NAME, PORT_NAME } from "./Constants";
import reduxStore from "./Store/store";
import browser from "webextension-polyfill";
import { ToastContainer } from "react-toastify";
import Browser from "webextension-polyfill";
import { closeBoth } from "./Utility/window.helper";
import { log } from "./Utility/utility";
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


//init the main app when store is synced with local storage
const initApp = (popupRoute) => {

  const store = new Store({ portName: PORT_NAME });

  const root = ReactDOM.createRoot(document.getElementById("root"));

  //fix for redux v8 in webext
  Object.assign(store, {
    dispatch: store.dispatch.bind(store),
    getState: store.getState.bind(store),
    subscribe: store.subscribe.bind(store),
  });
  const unsubscribe = store.subscribe(() => {
    unsubscribe()

    // The store implements the same interface as Redux's store
    // so you can use tools like `react-redux` no problem!
    root.render(
      <Provider store={store}>
        <MemoryRouter>
          {/* <React.StrictMode> */}
          <App popupRoute={popupRoute}/>
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
          {/* </React.StrictMode> */}
        </MemoryRouter>
      </Provider>
    );
  });

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  // reportWebVitals();
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
          initApp(res.popupRoute);
        } else if(req.type === "CLOSEMAIN") closeBoth(true)
      });

    } else {
      const root = ReactDOM.createRoot(document.getElementById("root"));
      root.render(
        <Provider store={reduxStore}>
          <MemoryRouter>
            {/* <React.StrictMode> */}
            <App popupRoute={res.popupRoute} />
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
            {/* </React.StrictMode> */}
          </MemoryRouter>
        </Provider>
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