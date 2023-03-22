import "./index.scss";
import App from "./App";
import { useContext } from "react";
import Context from "./Store";
import { Provider } from "react-redux";
import reduxStore from "./Store/store";
import ReactDOM from "react-dom/client";
import browser from "webextension-polyfill";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { CONNECTION_NAME, PORT_NAME } from "./Constants";
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
  // const store = new Store({ portName: PORT_NAME });

  // const {setState} = useContext();

  const root = ReactDOM.createRoot(document.getElementById("root"));

  // //fix for redux v8 in webext
  // Object.assign(store, {
  //   dispatch: store.dispatch.bind(store),
  //   getState: store.getState.bind(store),
  //   subscribe: store.subscribe.bind(store),
  // });
  // const unsubscribe = store.subscribe(() => {
  //   unsubscribe()

  // The store implements the same interface as Redux's store
  // so you can use tools like `react-redux` no problem!
  root.render(
    // <Provider store={store}>
    <Context>
      <MemoryRouter>
        {/* <React.StrictMode> */}
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
        {/* </React.StrictMode> */}
      </MemoryRouter>
    </Context>
    // </Provider>
  );
  // });

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
      initApp(req.data);

    }
  });
} else {

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <Provider store={reduxStore}>
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
    </Provider>
  );
  // reportWebVitals();
}
