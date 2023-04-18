import { useContext } from "react";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import "react-toastify/dist/ReactToastify.css";
import CopyIcon from "../../Assets/CopyIcon.svg";
import { PVT_KEY, NATIVE, EVM, COPIED, MNEMONIC } from "../../Constants/index.js";
import { isNullorUndef } from "../../Utility/utility";
import EyeOpenIcon from "../../Assets/EyeOpenIcon.svg";
import EyeCloseIcon from "../../Assets/EyeCloseIcon.svg";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders.jsx";
import { ROUTES } from "../../Routes";

function CreateWalletChain() {

  const { newAccount } = useContext(AuthContext);

  console.log("newAccount ::: ", newAccount);


  const handleCopy = (e) => {

    if (e.target.name === NATIVE) navigator.clipboard.writeText(newAccount?.nativeAddress);

    if (e.target.name === EVM) navigator.clipboard.writeText(newAccount?.evmAddress);

    if (e.target.name === MNEMONIC) navigator.clipboard.writeText(newAccount?.mnemonic);

    if (e.target.name === PVT_KEY) navigator.clipboard.writeText(newAccount?.evmPrivateKey);

    if (e.target.name === "all") {
      let string = `Mnemonic: ${newAccount?.mnemonic}\nEVM Private key: ${newAccount?.evmPrivateKey}\nEVM Address: ${newAccount?.evmAddress}\nNative Address: ${newAccount?.nativeAddress}`;
      navigator.clipboard.writeText(string);
    }

    toast.success(COPIED);
  };

  return (
    <div className={style.cardWhite}>
      {/* <div className={style.cardWhite__beginText}>
        <h1>Create New Wallet</h1>
      </div> */}
      <MenuRestofHeaders backTo={ROUTES.BEFORE_BEGIN} title={"Create New Wallet"} />
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
        <label>{!newAccount?.mnemonic && newAccount.drivePath ? "Drived Path:" : "Mnemonic Phrase:"}</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{!newAccount?.mnemonic && newAccount?.drivePath ? newAccount.drivePath : newAccount.mnemonic}</span>
          <img
            name={MNEMONIC}
            src={CopyIcon}
            alt="copyIcon"
            draggable={false}
            onClick={handleCopy}
          />{" "}
        </p>
      </div>
      <div className={`${style.cardWhite__addressInput} ${style.textElips}`}>
        <label>EVM Private Key:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{newAccount?.evmPrivateKey}</span>
          <img
            name={PVT_KEY}
            src={CopyIcon}
            alt="copyIcon"
            onClick={handleCopy}
          />{" "}
        </p>
      </div>
      <div className={style.cardWhite__addressInput}>
        <label>Evm Chain Address:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{newAccount?.evmAddress}</span>
          {/* <img
            name={EVM}
            src={CopyIcon}
            alt="copyIcon"
            draggable={false}
            onClick={handleCopy}
          />{" "} */}
          <img
            src={EyeOpenIcon}
            width={19}
            height={12}
            draggable={false}
            alt="eyeOpen"
          />

          <img
            src={EyeCloseIcon}
            width={19}
            height={16}
            draggable={false}
            alt="eyeClose"
          />
        </p>
      </div>
      <div className={style.cardWhite__addressInput}>
        <label> Native Chain Address:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{newAccount?.nativeAddress}</span>
          {/* <img
            name={NATIVE}
            src={CopyIcon}
            alt="copyIcon"
            draggable={false}
            onClick={handleCopy}
          />{ " " } */}
          <img
            src={EyeOpenIcon}
            width={19}
            height={12}
            draggable={false}
            alt="eyeOpen"
          />

          <img
            src={EyeCloseIcon}
            width={19}
            height={16}
            draggable={false}
            alt="eyeClose"
          />
        </p >
      </div >
    </div >
  );
}

export default CreateWalletChain;
