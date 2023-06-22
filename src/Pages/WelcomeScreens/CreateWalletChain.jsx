import { ROUTES } from "../../Routes";
import { toast } from "react-hot-toast";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { useNavigate } from "react-router-dom";
import CopyIcon from "../../Assets/CopyIcon.svg";
import EyeOpenIcon from "../../Assets/EyeOpenIcon.svg";
import { useContext, useState, useEffect } from "react";
import EyeCloseIcon from "../../Assets/EyeCloseIcon.svg";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { newAccountInitialState } from "../../Store/initialState";
import { StepHeaders } from "../../Components/BalanceDetails/Steps/steps";
import CongratulationsScreen from "../../Pages/WelcomeScreens/CongratulationsScreen";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders.jsx";
import {
  EVM,
  NATIVE,
  COPIED,
  PVT_KEY,
  MNEMONIC,
  MESSAGES
  // MESSAGE_TYPE_LABELS,
  // MESSAGE_EVENT_LABELS,
} from "../../Constants/index.js";

function CreateWalletChain() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [isOpen, setOpen] = useState({ open1: true, open2: true });
  const { setNewAccount, newAccount, setDetailsPage, updateLoading } = useContext(AuthContext);
  const [mnemonic, setMnemonic] = useState("");
  const [derivedPath, setDerivedPath] = useState("");
  // const handleCancle = async () => {
  //   sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.REMOVE_ACCOUNT, { address: newAccount?.evmAddress });
  //   setDetailsPage(false);
  // };

  const handleClick = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
      setNewAccount(newAccountInitialState);
      navigate(ROUTES.WALLET);
      setDetailsPage(false);
    }, 2000);
  };

  useEffect(() => {
    updateLoading(true);

    if (newAccount?.mnemonic || newAccount?.drivedMnemonic)
      setTimeout(() => {
        const accData = (newAccount?.mnemonic || newAccount.drivedMnemonic).split("//");
        setMnemonic(accData[0]);
        setDerivedPath(newAccount.drivedMnemonic ? accData[1] : "");
        updateLoading(false);
      }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newAccount?.mnemonic, newAccount?.drivedMnemonic]);

  const handleEyeOpen = (e) => {
    const name = e.target.name;
    setOpen((p) => ({ ...p, [name]: !isOpen[name] }));
  };

  const handleCopy = (e) => {
    if (e.target.name === NATIVE) navigator.clipboard.writeText(newAccount?.nativeAddress);

    if (e.target.name === EVM) navigator.clipboard.writeText(newAccount?.evmAddress);

    if (e.target.name === MNEMONIC)
      navigator.clipboard.writeText(newAccount?.mnemonic ? newAccount?.mnemonic : mnemonic);

    if (e.target.name === PVT_KEY) navigator.clipboard.writeText(newAccount?.evmPrivateKey);

    if (e.target.name === "all") {
      let string = `Mnemonic: ${
        newAccount?.mnemonic ? newAccount?.mnemonic : mnemonic
      }\nEVM Private key: ${newAccount?.evmPrivateKey}\nEVM Address: ${
        newAccount?.evmAddress
      }\nNative Address: ${newAccount?.nativeAddress}`;
      navigator.clipboard.writeText(string);
    }

    toast.success(COPIED);
  };

  return (
    <>
      <div className={style.cardWhite}>
        {newAccount?.mnemonic && <StepHeaders active={4} />}
        <MenuRestofHeaders title="New Wallet Details" />

        <div className={style.cardWhite__addressInput}>
          <div style={{ display: "flex" }}>
            <label>EVM Chain Address:</label>
            <div className={style.copyButton}>
              <button
                className={style.cardWhite__addressInput__copyAll}
                name={"all"}
                onClick={handleCopy}>
                Copy All
              </button>
            </div>
          </div>
          <p className={style.cardWhite__addressInput__copyText}>
            <span>{newAccount?.evmAddress}</span>
            <img
              name={EVM}
              src={CopyIcon}
              alt="copyIcon"
              draggable={false}
              onClick={handleCopy}
            />{" "}
          </p>
        </div>
        <div className={style.cardWhite__addressInput}>
          <label> Native Chain Address:</label>
          <p className={style.cardWhite__addressInput__copyText}>
            <span>{newAccount?.nativeAddress}</span>
            <img
              name={NATIVE}
              src={CopyIcon}
              alt="copyIcon"
              draggable={false}
              onClick={handleCopy}
            />{" "}
          </p>
        </div>
        <div className={style.cardWhite__addressInput}>
          <label>Mnemonic Phrase: {derivedPath ? "//" + derivedPath : ""}</label>
          <p className={style.cardWhite__addressInput__copyText}>
            <span className={isOpen.open1 && "blurContact"}>{mnemonic}</span>
            {isOpen?.open1 ? (
              <img
                width={19}
                height={16}
                name="open1"
                alt="eyeClose"
                src={EyeCloseIcon}
                draggable={false}
                onClick={handleEyeOpen}
              />
            ) : (
              <img
                width={19}
                height={12}
                alt="eyeOpen"
                name="open1"
                draggable={false}
                src={EyeOpenIcon}
                onClick={handleEyeOpen}
              />
            )}
            <img
              name={MNEMONIC}
              src={CopyIcon}
              alt="copyIcon"
              draggable={false}
              onClick={handleCopy}
            />{" "}
          </p>
        </div>
        <div className={`${style.cardWhite__addressInput}`}>
          <label>EVM Private Key:</label>
          <p className={style.cardWhite__addressInput__copyText}>
            <span className={isOpen.open2 && "blurContact"}>{newAccount?.evmPrivateKey}</span>
            {isOpen?.open2 ? (
              <img
                width={19}
                height={16}
                alt="eyeClose"
                name="open2"
                draggable={false}
                src={EyeCloseIcon}
                onClick={handleEyeOpen}
              />
            ) : (
              <img
                width={19}
                height={12}
                name="open2"
                alt="eyeOpen"
                draggable={false}
                src={EyeOpenIcon}
                onClick={handleEyeOpen}
              />
            )}
            <img name={PVT_KEY} src={CopyIcon} alt="copyIcon" onClick={handleCopy} />{" "}
          </p>
        </div>
      </div>

      <div className={style.cancleContinueContainer}>
        {/* 
        <ButtonComp
          bordered={true}
          text={"Cancel"}
          maxWidth={"100%"}
          onClick={handleCancle}
        /> */}

        <ButtonComp onClick={handleClick} text={"Continue"} maxWidth={"100%"} />
      </div>
      {show && (
        <div className="loader">
          <CongratulationsScreen text={MESSAGES.WALLET_CREATED} />
        </div>
      )}
    </>
  );
}

export default CreateWalletChain;
