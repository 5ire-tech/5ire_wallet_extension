import React, { useEffect, useState } from "react";
import style from "./style.module.scss";
import CopyIcon from "../../Assets/CopyIcon.svg";
import useWallet from "../../Hooks/useWallet";
import { useSelector } from "react-redux";
import { TEMP1M, TEMP2P, NATIVE, EVM } from "../../Constants/index.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CreateWalletChain() {
  const { walletSignUp, authData } = useWallet();
  const { isLogin, newAccount } = useSelector((state) => state.auth);

  const [data, setData] = useState({
    temp1m: "",
    temp2p: "",
    evmAddress: "",
    nativeAddress: "",
  });

  useEffect(() => {
    let res;
    if ((newAccount === null || newAccount === undefined) && !isLogin)
      res = walletSignUp();
    if (isLogin) res = walletSignUp();

    console.log("res: ", res);

    if (res?.error) toast.error(res.data);
  }, []);

  useEffect(() => {
    if (authData.temp1m) setData(authData);
    else if (newAccount) {
      setData(newAccount);
    }
  }, [authData, newAccount]);


  const handleCopy = (e) => {
    if (e.target.name === NATIVE) navigator.clipboard.writeText(data?.nativeAddress);

    if (e.target.name === EVM) navigator.clipboard.writeText(data?.evmAddress);

    if (e.target.name === TEMP1M) navigator.clipboard.writeText(data?.temp1m);

    if (e.target.name === TEMP2P) navigator.clipboard.writeText(data?.temp2p);
    
    if (e.target.name === "all") {
      let string = `Mnemonic: ${data?.temp1m}\nEVM Private key: ${data?.temp2p}\nEvm Address: ${data?.evmAddress}\nNative Address: ${data?.nativeAddress}`;
      navigator.clipboard.writeText(string);
    }

    toast.success("Copied!");
  };

  return (
    <div className={style.cardWhite}>
      <div className={style.cardWhite__beginText}>
        <h1>Create New Wallet</h1>
      </div>
      <div className={style.cardWhite__addressInput}>
        <label>EVM Chain Address:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{data?.evmAddress}</span>
          <img
            src={CopyIcon}
            alt="copyIcon"
            name={EVM}
            onClick={handleCopy}
          />{" "}
        </p>
      </div>
      <div className={style.cardWhite__addressInput}>
        <label>Native Chain Address:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{data?.nativeAddress}</span>
          <img
            src={CopyIcon}
            alt="copyIcon"
            name={NATIVE}
            onClick={handleCopy}
          />{" "}
        </p>
      </div>
      <div className={style.cardWhite__addressInput}>
        <label>Mnemonic Phrase:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{data?.temp1m}</span>
          <img
            src={CopyIcon}
            alt="copyIcon"
            name={TEMP1M}
            onClick={handleCopy}
          />{" "}
        </p>
      </div>
      <div className={style.cardWhite__addressInput}>
        <label>EVM Private Key:</label>
        <p className={style.cardWhite__addressInput__copyText}>
          <span>{data.temp2p}</span>
          <img
            src={CopyIcon}
            alt="copyIcon"
            name={TEMP2P}
            onClick={handleCopy}
          />{" "}
        </p>
      </div>
      <button className={style.cardWhite__addressInput__copyAll} name={"all"} onClick={handleCopy}>Copy All</button>
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
