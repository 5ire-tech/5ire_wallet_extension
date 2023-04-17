import "./App.scss";
import { ROUTES } from "./Routes";
import Send from "./Pages/Send/Send";
import Swap from "./Pages/Swap/Swap";
import { AuthContext } from "./Store";
import { EMTY_STR } from "./Constants";
import Wallet from "./Pages/Wallet/Wallet";
import Loader from "./Pages/Loader/Loader";
import NativeTx from "./Components/NativeTx";
import History from "./Pages/History/History";
import { useEffect, useContext } from "react";
import OnlyContent from "./Layout/OnlyContent";
import WelcomeLayout from "./Layout/WelcomeLayout";
import MyAccount from "./Pages/MyAccount/MyAccount";
import FixWidthLayout from "./Layout/FixWidthLayout";
import PrivateKey from "./Components/Setting/PrivateKey";
import Beforebegin from "./Pages/WelcomeScreens/Beforebegin";
import EnterPassword from "./Components/Setting/EnterPassword";
import LoginApprove from "./Pages/WelcomeScreens/LoginApprove";
import SwapApprove from "./Pages/Swap/SwapApprove/SwapApprove";
import ImportWallet from "./Pages/WelcomeScreens/ImportWallet";
import UnlockWelcome from "./Pages/WelcomeScreens/UnlockWelcome";
import ManageWallet from "./Components/Setting/ManageWallet.jsx";
import WelcomeScreen from "./Pages/WelcomeScreens/WelcomeScreen";
import ForgotPassword from "./Pages/WelcomeScreens/ForgotPassword";
import CreateNewWallet from "./Pages/WelcomeScreens/CreateNewWallet";
import ApproveTx from "./Pages/RejectNotification/RejectNotification";
import CreateWalletChain from "./Pages/WelcomeScreens/CreateWalletChain";
import SetPasswordScreen from "./Pages/WelcomeScreens/SetPasswordScreen";
import MainPrivacyPolicy from "./Pages/WelcomeScreens/MainPrivacyPolicy";
import { Route, Routes, useNavigate, useLocation} from "react-router-dom";


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
  const location = useLocation();
  console.log("Location : ",location.pathname);

  const { state, setState, isLoading, setExternalControlState, externalControlsState, newAccount } = useContext(AuthContext);
  const { isLogin, vault } = state;


  useEffect(() => {
    if (props.data && props.externalControlsState) {
      setState(props.data);
      setExternalControlState(props.externalControlsState);
    }
    const route = getParameterByName("route");
    if (route) {
      navigate(ROUTES.DEFAULT + route);
    } else {
      navigate(ROUTES.DEFAULT);
    }
  }, []);


  useEffect(() => {
    //sync the current action route with main popup
    if (externalControlsState.activeSession?.route && isLogin) {
      navigate(`/${externalControlsState.activeSession.route}`);
      return;
    }
  }, [isLogin, externalControlsState.activeSession?.route]);


  useEffect(() => {
    if (isLogin && !newAccount?.evmAddress)
      navigate(ROUTES.WALLET);
  }, [isLogin, newAccount?.evmAddress]);


  console.log("ISLogin ::: ",isLogin);
  console.log("Vault ::: ",vault);
  
  useEffect(() => {


    if (!isLogin && vault) {
      const route = getParameterByName("route");

      navigate(ROUTES.UNLOACK_WALLET, {
        state: {
          redirectRoute: route ? ROUTES.DEFAULT + route : EMTY_STR,
        },
      });
    }

  }, [isLogin, vault]);


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
              path={ROUTES.SET_PASS + "/:id"}
              element={<WelcomeLayout children={<SetPasswordScreen />} />}
            />

            <Route
              path={ROUTES.UNLOACK_WALLET}
              element={<WelcomeLayout children={<UnlockWelcome />} />}
            />
            <Route
              path={ROUTES.FORGOT_PASSWORD}
              element={<WelcomeLayout children={<ForgotPassword />} />}
            />
            <Route
              path={ROUTES.MAINPRIVACYPOLICY}
              element={<WelcomeLayout children={<MainPrivacyPolicy />} />}
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
              path={ROUTES.HISTORY_P}
              element={<FixWidthLayout children={<History />} />}
            />
            <Route
              index
              path={ROUTES.MY_ACCOUNT}
              element={<FixWidthLayout children={<MyAccount />} />}
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
              element={<NativeTx /*api={api}*/ />}
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
