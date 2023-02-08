import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.scss";
import FixWidthLayout from "./Layout/FixWidthLayout";
import OnlyContent from "./Layout/OnlyContent";
import WelcomeLayout from "./Layout/WelcomeLayout";
import Send from "./Pages/Send/Send";
import Wallet from "./Pages/Wallet/Wallet";
import SetPasswordScreen from "./Pages/WelcomeScreens/SetPasswordScreen";
import WelcomeScreen from "./Pages/WelcomeScreens/WelcomeScreen";
import Swap from "./Pages/Swap/Swap";
import CreateNewWallet from "./Pages/WelcomeScreens/CreateNewWallet";
import Beforebegin from "./Pages/WelcomeScreens/Beforebegin";
import CreateWalletChain from "./Pages/WelcomeScreens/CreateWalletChain";
import ImportWallet from "./Pages/WelcomeScreens/ImportWallet";
import { useSelector } from "react-redux";
import ManageWallet from "./Components/Setting/ManageWallet.jsx";
import EnterPassword from "./Components/Setting/EnterPassword";
import SwapApprove from "./Pages/Swap/SwapApprove/SwapApprove";
import PrivateKey from "./Components/Setting/PrivateKey";
import UnlockWelcome from "./Pages/WelcomeScreens/UnlockWelcome";
import ApproveTx from "./Pages/RejectNotification/RejectNotification";
import Loader from "./Pages/Loader/Loader";
import LoginApprove from "./Pages/WelcomeScreens/LoginApprove";

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function App() {
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const route = getParameterByName("route");

    if (!auth?.isLogin && auth.accounts.length > 0 && auth.pass) {
      navigate("/unlockWallet", {
        state: {
          redirectRoute: route ? "/" + route : "",
        },
      });
    } else if (auth.accounts.length <= 0) {
      navigate("/");
    } else if (route) {
      navigate("/" + route);
    } else if (auth?.isLogin) {
      navigate("/wallet");
    } else {
      navigate("/");
    }
    // fetchLogin();
  }, [auth?.login]);

  return (
    <div className="App">
      <Routes>
        {!auth?.isLogin ? (
          <>
            <Route
              index
              path="/"
              element={<WelcomeLayout children={<WelcomeScreen />} />}
            />
            <Route
              path="/setPassword"
              element={<WelcomeLayout children={<SetPasswordScreen />} />}
            />

            <Route
              path="/unlockWallet"
              element={<WelcomeLayout children={<UnlockWelcome />} />}
            />
          </>
        ) : (
          <>
            <Route
              index
              path="/wallet"
              element={<FixWidthLayout children={<Wallet />} />}
            />
            <Route
              index
              path="/swapapprove"
              element={<FixWidthLayout children={<SwapApprove />} />}
            />
            <Route
              index
              path="/enterPassword"
              element={<OnlyContent children={<EnterPassword />} />}
            />
            <Route
              index
              path="/send"
              element={<OnlyContent children={<Send />} />}
            />
            <Route
              index
              path="/swap"
              element={<OnlyContent children={<Swap />} />}
            />
            <Route
              index
              path="/manageWallet"
              element={<OnlyContent children={<ManageWallet />} />}
            />
            <Route
              index
              path="/privateKey"
              element={<OnlyContent children={<PrivateKey />} />}
            />
            <Route
              index
              path="/approveTx"
              element={<FixWidthLayout children={<ApproveTx />} />}
            />
            <Route
              path="/loginApprove"
              element={<WelcomeLayout children={<LoginApprove />} />}
            />
          </>
        )}
        <Route
          path="/importWallet"
          element={<WelcomeLayout children={<ImportWallet />} />}
        />
        <Route
          path="/createwalletchain"
          element={<WelcomeLayout children={<CreateWalletChain />} />}
        />
        <Route
          path="/beforebegin"
          element={<WelcomeLayout children={<Beforebegin />} />}
        />

        <Route
          path="/createNewWallet"
          element={<WelcomeLayout children={<CreateNewWallet />} />}
        />
      </Routes>
      <Loader />
    </div>
  );
}

export default App;
