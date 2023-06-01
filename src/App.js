import "./App.scss";
import { ROUTES } from "./Routes";
import Send from "./Pages/Send/Send";
import Swap from "./Pages/Swap/Swap";
import { AuthContext } from "./Store";
import Wallet from "./Pages/Wallet/Wallet";
import Loader from "./Pages/Loader/Loader";
import NativeTx from "./Components/NativeTx";
import { useEffect, useContext } from "react";
import History from "./Pages/History/History";
import OnlyContent from "./Layout/OnlyContent";
import WelcomeLayout from "./Layout/WelcomeLayout";
import MyAccount from "./Pages/MyAccount/MyAccount";
import FixWidthLayout from "./Layout/FixWidthLayout";
import PrivateKey from "./Components/Setting/PrivateKey";
import ErrorModal from "./Components/ErrorModal/ErrorModal";
import RetryModal from "./Components/ErrorModal/RetryModal";
import Beforebegin from "./Pages/WelcomeScreens/Beforebegin";
import { Route, Routes, useNavigate } from "react-router-dom";
import EnterPassword from "./Components/Setting/EnterPassword";
import LoginApprove from "./Pages/WelcomeScreens/LoginApprove";
import SwapApprove from "./Pages/Swap/SwapApprove/SwapApprove";
import ImportWallet from "./Pages/WelcomeScreens/ImportWallet";
import UnlockWelcome from "./Pages/WelcomeScreens/UnlockWelcome";
import ManageWallet from "./Components/Setting/ManageWallet.jsx";
import ForgotPassword from "./Pages/WelcomeScreens/ForgotPassword";
import CreateNewWallet from "./Pages/WelcomeScreens/CreateNewWallet";
import ApproveTx from "./Pages/RejectNotification/RejectNotification";
import CreateWalletChain from "./Pages/WelcomeScreens/CreateWalletChain";
import SetPasswordScreen from "./Pages/WelcomeScreens/SetPasswordScreen";
import MainPrivacyPolicy from "./Pages/WelcomeScreens/MainPrivacyPolicy";
import ValidatorNominatorTxns from "./Components/ValidatorNominatorTxns";
import CongratulationsScreen from "./Pages/WelcomeScreens/CongratulationsScreen";

import WelcomeScreen from "./Pages/WelcomeScreens/WelcomeScreen";

function App(props) {
  const {
    state,
    setState,
    isLoading,
    newAccount,
    detailsPage,
    isStateLoaded,
    setStateLoaded,
    showCongratLoader,
    externalControlsState,
    setExternalControlState,
    setWindowAndTab
  } = useContext(AuthContext);

  const navigate = useNavigate();

  const { isLogin, vault } = isStateLoaded ? state : props.data;
  const { activeSession } = isStateLoaded
    ? externalControlsState
    : props.externalControlsState;

  useEffect(() => {
    if (props.data && props.externalControlsState) {
      setState(props.data);
      setExternalControlState(props.externalControlsState);
      setWindowAndTab(props.windowAndTabState);
      setStateLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    //sync the current action route with main popup
    if (activeSession && isLogin) {
      navigate(`/${activeSession.route}`);
      return;
    }

    if ((!isLogin && vault) || (state?.pass && !isLogin && !vault)) {
      navigate(ROUTES.UNLOACK_WALLET);
    } else if (detailsPage) {
      navigate(ROUTES.NEW_WALLET_DETAILS);
    } else if (isLogin && vault && !detailsPage) {
      navigate(ROUTES.WALLET);
    } else if (!isLogin && !vault) {
      navigate(ROUTES.DEFAULT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLogin,
    vault,
    newAccount?.evmAddress,
    state?.pass,
    detailsPage,
    externalControlsState?.activeSession?.id
  ]);

  return (
    <div className="App">
      <Routes>
        {!isLogin ? (
          <>
            <Route
              index
              path={ROUTES.DEFAULT}
              element={
                <WelcomeLayout>
                  <WelcomeScreen />
                </WelcomeLayout>
              }
            />
            <Route
              path={ROUTES.SET_PASS + "/:id"}
              element={
                <WelcomeLayout>
                  <SetPasswordScreen />
                </WelcomeLayout>
              }
            />
            <Route
              path={ROUTES.UNLOACK_WALLET}
              element={
                <WelcomeLayout>
                  <UnlockWelcome />
                </WelcomeLayout>
              }
            />
            <Route
              path={ROUTES.FORGOT_PASSWORD}
              element={
                <WelcomeLayout>
                  <ForgotPassword />
                </WelcomeLayout>
              }
            />
          </>
        ) : (
          <>
            <Route
              index
              path={ROUTES.WALLET}
              element={
                <FixWidthLayout>
                  <Wallet />
                </FixWidthLayout>
              }
            />
            <Route
              index
              path={ROUTES.HISTORY_P}
              element={
                <FixWidthLayout>
                  <History />
                </FixWidthLayout>
              }
            />
            <Route
              index
              path={ROUTES.MY_ACCOUNT}
              element={
                <FixWidthLayout>
                  <MyAccount />
                </FixWidthLayout>
              }
            />
            <Route
              index
              path={ROUTES.SWAP_APPROVE}
              element={
                <FixWidthLayout>
                  <SwapApprove />
                </FixWidthLayout>
              }
            />
            <Route
              index
              // path={ROUTES.ENTER_PASS + "/:id"}
              path={ROUTES.ENTER_PASS}
              element={
                <OnlyContent>
                  <EnterPassword />
                </OnlyContent>
              }
            />
            <Route
              index
              path={ROUTES.SEND}
              element={
                <OnlyContent>
                  <Send />
                </OnlyContent>
              }
            />
            <Route
              index
              path={ROUTES.SWAP}
              element={
                <OnlyContent>
                  <Swap />
                </OnlyContent>
              }
            />
            <Route
              index
              path={ROUTES.MANAGE_WALLET}
              element={
                <OnlyContent>
                  <ManageWallet />
                </OnlyContent>
              }
            />
            <Route
              index
              path={ROUTES.PVT_KEY}
              element={
                <OnlyContent>
                  <PrivateKey />
                </OnlyContent>
              }
            />
            <Route
              index
              path={ROUTES.APPROVE_TXN}
              element={
                <FixWidthLayout>
                  <ApproveTx />
                </FixWidthLayout>
              }
            />
            <Route index path={ROUTES.NATIVE_TXN} element={<NativeTx />} />
            <Route
              index
              path={ROUTES.VALIDATOR_NOMINATOR_TXN}
              element={<ValidatorNominatorTxns />}
            />
            <Route
              path={ROUTES.LOGIN_APPROVE}
              element={
                <WelcomeLayout>
                  <LoginApprove />
                </WelcomeLayout>
              }
            />
          </>
        )}
        <Route
          path={ROUTES.IMPORT_WALLET}
          element={
            <WelcomeLayout>
              <ImportWallet />
            </WelcomeLayout>
          }
        />
        <Route
          path={ROUTES.NEW_WALLET_DETAILS}
          element={
            <WelcomeLayout>
              <CreateWalletChain />
            </WelcomeLayout>
          }
        />
        <Route
          path={ROUTES.BEFORE_BEGIN}
          element={
            <WelcomeLayout>
              <Beforebegin />
            </WelcomeLayout>
          }
        />
        <Route
          path={ROUTES.CREATE_WALLET}
          element={
            <WelcomeLayout>
              <CreateNewWallet />
            </WelcomeLayout>
          }
        />
        <Route
          path={ROUTES.PRIVACY_POLICY}
          element={
            <WelcomeLayout>
              <MainPrivacyPolicy />
            </WelcomeLayout>
          }
        />
      </Routes>

      {/* for network, validation and internal error modals */}
      <ErrorModal />
      <RetryModal />

      {isLoading && <Loader />}
      {showCongratLoader && (
        <div className="loader">
          <CongratulationsScreen text={"Your wallet has been imported"} />
        </div>
      )}
    </div>
  );
}

export default App;
