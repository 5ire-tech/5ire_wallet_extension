import "./App.scss";
import Send from "./Pages/Send/Send";
import Swap from "./Pages/Swap/Swap";
import { AuthContext } from "./Store";
// import { NETWORK } from "./Constants";
import { localStorage } from "./Storage";
// import { useSelector } from "react-redux";
import Loader from "./Pages/Loader/Loader";
import Wallet from "./Pages/Wallet/Wallet";
import { useEffect, useContext, useState } from "react";
import NativeTx from "./Components/NativeTx";
import OnlyContent from "./Layout/OnlyContent";
import WelcomeLayout from "./Layout/WelcomeLayout";
import FixWidthLayout from "./Layout/FixWidthLayout";
import PrivateKey from "./Components/Setting/PrivateKey";
import Beforebegin from "./Pages/WelcomeScreens/Beforebegin";
import { Route, Routes, useNavigate } from "react-router-dom";
import EnterPassword from "./Components/Setting/EnterPassword";
import LoginApprove from "./Pages/WelcomeScreens/LoginApprove";
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

function App({ data }) {
  const { setState, state} = useContext(AuthContext);
  const {allAccounts, isLogin, pass} = state;
  const navigate = useNavigate();

  useEffect(()=>{
    setState(data.state);
  },[]);



  useEffect(() => {

    const route = getParameterByName("route");

    if (route) {
      navigate("/" + route);
    }else{
      navigate("/");
    }

    if (!isLogin && allAccounts.length > 0 && pass) {
      navigate("/unlockWallet", {
        state: {
          redirectRoute: route ? "/" + route : "",
        },
      });
    } else if (allAccounts.length <= 0) {
      navigate("/");
    } else if (route) {
      navigate("/" + route);
    } else if (state?.isLogin) {
      navigate("/wallet");
    } else {
      navigate("/");
    }

  }, [state?.isLogin]);


  return (
    <div className="App">
      <Routes>
        {!state.isLogin ? (
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
            {/* 
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
            */}


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
      {/* <Loader /> */}
    </div>
  );
}

export default App;
