import "./App.scss";
import { useEffect } from "react";
import Send from "./Pages/Send/Send";
import Swap from "./Pages/Swap/Swap";
// import { NETWORK } from "./Constants";
import Loader from "./Pages/Loader/Loader";
import Wallet from "./Pages/Wallet/Wallet";
import OnlyContent from "./Layout/OnlyContent";
import WelcomeLayout from "./Layout/WelcomeLayout";
import FixWidthLayout from "./Layout/FixWidthLayout";
import { useSelector } from "react-redux";
import PrivateKey from "./Components/Setting/PrivateKey";
// import { connectionObj } from "./Helper/connection.helper";
import Beforebegin from "./Pages/WelcomeScreens/Beforebegin";
import { Route, Routes, useNavigate } from "react-router-dom";
import EnterPassword from "./Components/Setting/EnterPassword";
import LoginApprove from "./Pages/WelcomeScreens/LoginApprove";
import NativeTx from "./Components/NativeTx";
import SwapApprove from "./Pages/Swap/SwapApprove/SwapApprove";
import ImportWallet from "./Pages/WelcomeScreens/ImportWallet";
import UnlockWelcome from "./Pages/WelcomeScreens/UnlockWelcome";
import ManageWallet from "./Components/Setting/ManageWallet.jsx";
import WelcomeScreen from "./Pages/WelcomeScreens/WelcomeScreen";
import CreateNewWallet from "./Pages/WelcomeScreens/CreateNewWallet";
import ApproveTx from "./Pages/RejectNotification/RejectNotification";
import CreateWalletChain from "./Pages/WelcomeScreens/CreateWalletChain";
import SetPasswordScreen from "./Pages/WelcomeScreens/SetPasswordScreen";

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
  // const { currentNetwork, wsEndPoints } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // useEffect(() => {

  //   if (currentNetwork.toLowerCase() === NETWORK.TEST_NETWORK.toLowerCase()) {
  //     connectionObj.initializeApi(wsEndPoints.testnet).then((res)=>{
  //       console.log("Api initialize for ist time for testnet");
  //     });
  //   }else if(currentNetwork.toLowerCase() === NETWORK.QA_NETWORK.toLowerCase()){
  //     connectionObj.initializeApi(wsEndPoints.qa).then((res)=>{
  //       console.log("Api initialize for ist time for qa");
  //     });
  //   }
  // }, []);


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
    
  }, [auth?.isLogin]);

  
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
              path="/setPassword/:id"
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
              index
              path="/nativeTx"
              element={<NativeTx />}
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
