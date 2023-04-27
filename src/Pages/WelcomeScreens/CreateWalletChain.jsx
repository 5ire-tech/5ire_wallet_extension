import { toast } from "react-hot-toast";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { useContext, useState } from "react";
import CopyIcon from "../../Assets/CopyIcon.svg";
import EyeOpenIcon from "../../Assets/EyeOpenIcon.svg";
import EyeCloseIcon from "../../Assets/EyeCloseIcon.svg";
import { StepHeaders } from "../../Components/BalanceDetails/Steps/steps";
import { PVT_KEY, NATIVE, EVM, COPIED, MNEMONIC } from "../../Constants/index.js";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders.jsx";

function CreateWalletChain() {

  const { newAccount } = useContext(AuthContext);
  const [isOpen, setOpen] = useState({ open1: true, open2: true });


  const handleEyeOpen = (e) => {
    const name = e.target.name;
    setOpen(p => ({ ...p, [name]: !isOpen[name] }));
  }


  const handleCopy = (e) => {

    if (e.target.name === NATIVE) navigator.clipboard.writeText(newAccount?.nativeAddress);

    if (e.target.name === EVM) navigator.clipboard.writeText(newAccount?.evmAddress);

    if (e.target.name === MNEMONIC) navigator.clipboard.writeText(newAccount?.mnemonic ? newAccount?.mnemonic : newAccount?.drivedMnemonic);

    if (e.target.name === PVT_KEY) navigator.clipboard.writeText(newAccount?.evmPrivateKey);

    if (e.target.name === "all") {
      let string = `Mnemonic: ${newAccount?.mnemonic}\nEVM Private key: ${newAccount?.evmPrivateKey}\nEVM Address: ${newAccount?.evmAddress}\nNative Address: ${newAccount?.nativeAddress}`;
      navigator.clipboard.writeText(string);
    }

    toast.success(COPIED);
  };

  return (
    <div className={style.cardWhite}>
      {
        newAccount?.mnemonic
        &&
        < StepHeaders active={4} />
      }
      <MenuRestofHeaders title={"New Wallet Details"} />
      <div className={style.copyButton}>
        <button
          className={style.cardWhite__addressInput__copyAll}
          name={"all"}
          onClick={handleCopy}
        >
          Copy All
        </button>
      </div>
      <div className={style.cardWhite__addressInput}>
        <label>EVM Chain Address:</label>
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
        </p >
      </div >
      <div className={style.cardWhite__addressInput}>
        <label>Mnemonic Phrase: </label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span className={isOpen.open1 && "blurContact"}>{newAccount?.mnemonic ? newAccount.mnemonic : newAccount.drivedMnemonic}</span>
          {
            isOpen?.open1 ?
              <img
                width={19}
                height={12}
                alt="eyeOpen"
                name="open1"
                draggable={false}
                src={EyeOpenIcon}
                onClick={handleEyeOpen}
              />
              :
              <img
                width={19}
                height={16}
                name="open1"
                alt="eyeClose"
                src={EyeCloseIcon}
                draggable={false}
                onClick={handleEyeOpen}
              />
          }
          <img
            name={MNEMONIC}
            src={CopyIcon}
            alt="copyIcon"
            draggable={false}
            onClick={handleCopy}
          />
          {" "}
        </p>
      </div>
      <div className={`${style.cardWhite__addressInput}`}>
        <label>EVM Private Key:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span className={isOpen.open2 && "blurContact"}>{newAccount?.evmPrivateKey}</span>
          {
            isOpen?.open2 ?
              <img
                width={19}
                height={12}
                name="open2"
                alt="eyeOpen"
                draggable={false}
                src={EyeOpenIcon}
                onClick={handleEyeOpen}
              />
              :
              <img
                width={19}
                height={16}
                alt="eyeClose"
                name="open2"
                draggable={false}
                src={EyeCloseIcon}
                onClick={handleEyeOpen}

              />
          }
          <img
            name={PVT_KEY}
            src={CopyIcon}
            alt="copyIcon"
            onClick={handleCopy}
          />{" "}
        </p>
      </div>
    </div >
  );
}

export default CreateWalletChain;
