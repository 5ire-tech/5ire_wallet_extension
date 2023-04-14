import { useContext } from "react";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import "react-toastify/dist/ReactToastify.css";
import CopyIcon from "../../Assets/CopyIcon.svg";
import React, { useEffect, useState } from "react";
import { PVT_KEY, NATIVE, EVM, COPIED, MNEMONIC } from "../../Constants/index.js";

function CreateWalletChain() {

  const { newAccount } = useContext(AuthContext);


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
      <div className={style.cardWhite__beginText}>
        <h1>New Wallet Details</h1>
      </div>
      <div className={style.cardWhite__addressInput}>
        <label>{!newAccount?.mnemonic && newAccount.drivePath ? "Drived Path:" : "Mnemonic Phrase:"}</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{!newAccount.mnemonic && newAccount.drivePath ? newAccount.drivePath : newAccount.mnemonic}</span>
          <img
            name={MNEMONIC}
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
          <span>{newAccount?.evmPrivateKey}</span>
          <img
            name={PVT_KEY}
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
        <label>Native Chain Address:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{newAccount?.nativeAddress}</span>
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
    </div>
  );
}

export default CreateWalletChain;
