import React, { useState } from "react";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import style from "./style.module.scss";
import CopyIcon from "../../Assets/CopyIcon.svg";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useWallet from "../../Hooks/useWallet";
import { useEffect } from "react";
import ButtonComp from "../ButtonComp/ButtonComp";
import { decryptor } from "../../Helper/CryptoHelper"


function PrivateKey() {
  const { currentAccount, pass } = useSelector((state) => state.auth);
  const [key, setKey] = useState("");
  const [seed, setSeed] = useState("");
  const [show, handleShow] = useState(false);
  const { getKey } = useWallet();
  const name = ["seed", "key"];

  useEffect(() => {
    setKey(getKey(currentAccount?.temp1m, pass));
  }, [currentAccount, getKey]);

  const handleCopy = (e) => {
    if (e.target.name === name[0])
      navigator.clipboard.writeText(seed);
    else if (e.target.name === name[1])
      navigator.clipboard.writeText(key);
    toast.success("Copied!");
  };

  useEffect(() => {
    if (show && !seed) {
      let seed = (decryptor(currentAccount.temp1m, pass));
      setSeed(seed)
    }
  }, [show]);

  const handleClick = () => {
    handleShow(!show);
  };

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
                    draggable={false}
                    src={CopyIcon}
                    alt="copyIcon"
                    name="key"
                    onClick={handleCopy}
                  />
                </p>
              </div>
            </div>

            <div className={style.mnemonicsButton}>
              <ButtonComp
                onClick={handleClick}
                text={show ? "Hide Mnemonic" : "Reveal Mnemonic"} />
            </div>
            <div className={style.wallet} hidden={!show ? true : false}>
              <div className={style.wallet__addressInput}>
                <p className={style.wallet__addressInput__copyText}>
                  <span>{seed}</span>
                  <img
                    draggable={false}
                    src={CopyIcon}
                    alt="copyIcon"
                    name="seed"
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
