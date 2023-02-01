import React, { useState } from "react";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import style from "./style.module.scss";
import CopyIcon from "../../Assets/CopyIcon.svg";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useWallet from "../../Hooks/useWallet";
import { useEffect } from "react";

function PrivateKey() {
  const { currentAccount, pass } = useSelector((state) => state.auth);
  const [key, setKey] = useState("");
  const { getKey } = useWallet();

  const handleCopy = () => {
    navigator.clipboard.writeText(key);
    toast.success("Copied!");
  };

  useEffect(() => {
    console.log("Here current account", currentAccount);
    setKey(getKey(currentAccount?.temp1m, pass));
  }, [currentAccount, getKey]);

  return (
    <>
      <div className={`scrollableCont`}>
        <MenuRestofHeaders backTo={"/wallet"} title={""} />
        <div className={`flexedContent`}>
          <div className={style.enterPassword}>
            <div className={style.commonHeadeing}>
              <h1>Your Private Key</h1>
            </div>
            <div className={style.wallet}>
              <div className={style.wallet__addressInput}>
                <p className={style.wallet__addressInput__copyText}>
                  <span>{key}</span>
                  <img
                    src={CopyIcon}
                    alt="copyIcon"
                    name="name"
                    onClick={handleCopy}
                  />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PrivateKey;
