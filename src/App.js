import "./App.scss";
import Send from "./Pages/Send/Send";
import Swap from "./Pages/Swap/Swap";
import { AuthContext } from "./Store";
import {EMTY_STR} from "./Constants/index";
import Loader from "./Pages/Loader/Loader";
import Wallet from "./Pages/Wallet/Wallet";
import NativeTx from "./Components/NativeTx";
import { useEffect, useContext } from "react";
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
  if (!results[2]) return EMTY_STR;
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function App(props) {
  const navigate = useNavigate();
  const { state, setState } = useContext(AuthContext);
  const { allAccounts, isLogin, pass } = state;

  useEffect(()=> {
    setState(props.data);
  },[])

  useEffect(() => {

    if (props.popupRoute && props.popupRoute?.length > 0 && isLogin) {
      navigate(`/${props.popupRoute}`);
      return;
    }

    const route = getParameterByName("route");

    if (route) {
      navigate("/" + route);
    } else {
      navigate("/");
    }

    // console.log("isLogin : ", isLogin, "all accounts length : ",allAccounts.length, " pass : ",pass);

    if (!isLogin && allAccounts?.length > 0 && pass) {
      navigate("/unlockWallet", {
        state: {
          redirectRoute: route ? "/" + route : EMTY_STR,
        },
      });
    } else if (allAccounts.length <= 0) {
      navigate("/");
    } else if (route) {
      navigate("/" + route);
    } else if (isLogin) {
      navigate("/wallet");
    } else {
      navigate("/");
    }

  }, [isLogin, pass, allAccounts.length]);


  return (
    <div className="App">
      <Routes>
        {!isLogin ? (
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
              element={<NativeTx api={api} />}
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
