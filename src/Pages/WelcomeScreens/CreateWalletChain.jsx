import { toast } from "react-toastify";
import style from "./style.module.scss";
import useWallet from "../../Hooks/useWallet";
import "react-toastify/dist/ReactToastify.css";
import CopyIcon from "../../Assets/CopyIcon.svg";
import React, { useEffect, useState } from "react";
import { TEMP1M, TEMP2P, NATIVE, EVM, COPIED } from "../../Constants/index.js";

function CreateWalletChain() {

  const { walletSignUp } = useWallet();

  const [data, setData] = useState({
    temp1m: "",
    temp2p: "",
    evmAddress: "",
    nativeAddress: "",
  });

  useEffect(() => {
    let res = walletSignUp();
    if (res.error) toast.error(res.data);
    else{
      setData(res.data);
    }
  }, []);


  const handleCopy = (e) => {

    if (e.target.name === NATIVE) navigator.clipboard.writeText(data?.nativeAddress);

    if (e.target.name === EVM) navigator.clipboard.writeText(data?.evmAddress);

    if (e.target.name === TEMP1M) navigator.clipboard.writeText(data?.temp1m);

    if (e.target.name === TEMP2P) navigator.clipboard.writeText(data?.temp2p);

    if (e.target.name === "all") {
      let string = `Mnemonic: ${data?.temp1m}\nEVM Private key: ${data?.temp2p}\nEVM Address: ${data?.evmAddress}\nNative Address: ${data?.nativeAddress}`;
      navigator.clipboard.writeText(string);
    }

    toast.success(COPIED);
  };

  return (
    <div className={style.cardWhite}>
      <div className={style.cardWhite__beginText}>
        <h1>New Wallet Details</h1>
      </div>
      <div className={style.cardWhite__addressInput}>
        <label>Mnemonic Phrase:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{data?.temp1m}</span>
          <img
            name={TEMP1M}
            src={CopyIcon}
            alt="copyIcon"
            draggable={false}
            onClick={handleCopy}
          />{" "}
        </p>
      </div>
      <div className={style.cardWhite__addressInput}>
        <label>EVM Private Key:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{data.temp2p}</span>
          <img
            name={TEMP2P}
            src={CopyIcon}
            alt="copyIcon"
            draggable={false}
            onClick={handleCopy}
          />{" "}
        </p>
      </div>
      <div className={style.cardWhite__addressInput}>
        <label>EVM Chain Address:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{data?.evmAddress}</span>
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
        <label>Native Chain Address:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{data?.nativeAddress}</span>
          <img
            draggable={false}
            src={CopyIcon}
            alt="copyIcon"
            name={NATIVE}
            onClick={handleCopy}
          />{" "}
        </p>
      </div>
      <div className={style.copyButton}><button className={style.cardWhite__addressInput__copyAll} name={"all"} onClick={handleCopy}>Copy All</button></div>
      {/* <div className={style.cardWhite__noteSec}>
        <h4>Note:</h4>
        <ul>
          <li>
            Your private key and address can’t be recovered if you lose it.
          </li>
          <li> Please store it securely.</li>
        </ul>
      </div >*/}
    </div>
  );
}

export default CreateWalletChain;
