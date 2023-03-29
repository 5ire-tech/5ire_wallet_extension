import "./App.scss";
import { ROUTES } from "./Routes";
import Send from "./Pages/Send/Send";
import Swap from "./Pages/Swap/Swap";
import { AuthContext } from "./Store";
import { EMTY_STR } from "./Constants";
import Wallet from "./Pages/Wallet/Wallet";
import NativeTx from "./Components/NativeTx";
import { useEffect, useContext } from "react";
import Loader from "./Pages/Loader/Loader";
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
import {log} from "./Utility/utility"

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
  const { state, setState, isLoading } = useContext(AuthContext);
  const { allAccounts, isLogin, pass } = state;

  useEffect(() => {
    setState(props.data);
  }, [])

  useEffect(() => {

    if (props.popupRoute && props.popupRoute?.length > 0 && isLogin) {
      navigate(`/${props.popupRoute}`);
      return;
    }

    const route = getParameterByName("route");

    if (route) {
      navigate(ROUTES.DEFAULT + route);
    } else {
      navigate(ROUTES.DEFAULT);
    }

    // console.log("isLogin : ", isLogin, "all accounts length : ",allAccounts.length, " pass : ",pass);

    if (!isLogin && allAccounts?.length > 0 && pass) {
      navigate(ROUTES.UNLOACK_WALLET, {
        state: {
          redirectRoute: route ? ROUTES.DEFAULT + route : EMTY_STR,
        },
      });
    } else if (allAccounts.length <= 0) {
      navigate(ROUTES.DEFAULT);
    } else if (route) {
      navigate(ROUTES.DEFAULT + route);
    } else if (isLogin) {
      navigate(ROUTES.WALLET);
    } else {
      navigate(ROUTES.DEFAULT);
    }

  }, [isLogin, pass, allAccounts.length]);


  return (
    <div className="App">
      <Routes>
        {!isLogin ? (
          <>
            <Route
              index
              path={ROUTES.DEFAULT}
              element={<WelcomeLayout children={<WelcomeScreen />} />}
            />

            <Route
              path={ROUTES.SET_PASS+"/:id"}
              element={<WelcomeLayout children={<SetPasswordScreen />} />}
            />

            <Route
              path={ROUTES.UNLOACK_WALLET}
              element={<WelcomeLayout children={<UnlockWelcome />} />}
            />

          </>
        ) : (
          <>
            <Route
              index
              path={ROUTES.WALLET}
              element={<FixWidthLayout children={<Wallet />} />}
            />

            <Route
              index
              path={ROUTES.SWAP_APPROVE}
              element={<FixWidthLayout children={<SwapApprove />} />}
            />
            <Route
              index
              path={ROUTES.ENTER_PASS}
              element={<OnlyContent children={<EnterPassword />} />}
            />
            <Route
              index
              path={ROUTES.SEND}
              element={<OnlyContent children={<Send />} />}
            />
            <Route
              index
              path={ROUTES.SWAP}
              element={<OnlyContent children={<Swap />} />}
            />
            <Route
              index
              path={ROUTES.MANAGE_WALLET}
              element={<OnlyContent children={<ManageWallet />} />}
            />
            <Route
              index
              path={ROUTES.PVT_KEY}
              element={<OnlyContent children={<PrivateKey />} />}
            />

            <Route
              index
              path={ROUTES.APPROVE_TXN}
              element={<FixWidthLayout children={<ApproveTx />} />}
            />
            <Route
              index
              path={ROUTES.NATIVE_TXN}
              element={<NativeTx  /*api={api}*/ />}
            />

            <Route
              path={ROUTES.LOGIN_APPROVE}
              element={<WelcomeLayout children={<LoginApprove />} />}
            />

          </>
        )}

        <Route
          path={ROUTES.IMPORT_WALLET}
          element={<WelcomeLayout children={<ImportWallet />} />}
        />

        <Route
          path={ROUTES.NEW_WALLET_DETAILS}
          element={<WelcomeLayout children={<CreateWalletChain />} />}
        />
        <Route
          path={ROUTES.BEFORE_BEGIN}
          element={<WelcomeLayout children={<Beforebegin />} />}
        />

        <Route
          path={ROUTES.CREATE_WALLET}
          element={<WelcomeLayout children={<CreateNewWallet />} />}
        />
      </Routes>
      {isLoading && <Loader />}
    </div>
  );
}

export default App;
