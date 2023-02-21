import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
// import reportWebVitals from "./reportWebVitals";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Store } from "webext-redux";
import { CONNECTION_NAME, PORT_NAME } from "./Constants";
import reduxStore from "./Store/store";
import browser from "webextension-polyfill";
import { ToastContainer } from "react-toastify";
const isDev = process.env.NODE_ENV === "development";

const initApp = () => {
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
          <App />
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



if (!isDev) {
  browser.runtime.connect({ name: CONNECTION_NAME });

  // Listens for when the store gets initialized
  browser.runtime.onMessage.addListener((req) => {
    if (req.type === "STORE_INITIALIZED") {
      // Initializes the popup logic
      initApp();
    }
  });
} else {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <Provider store={reduxStore}>
      <MemoryRouter>
        {/* <React.StrictMode> */}
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
        {/* </React.StrictMode> */}
      </MemoryRouter>
    </Provider>
  );
  // reportWebVitals();
}
