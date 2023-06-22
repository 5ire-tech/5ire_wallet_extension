import { ROUTES } from "../../Routes";
import { toast } from "react-hot-toast";
import style from "./style.module.scss";
import { AuthContext } from "../../Store/index";
import CopyIcon from "../../Assets/CopyIcon.svg";
import EyeOpenIcon from "../../Assets/EyeOpenIcon.svg";
import EyeCloseIcon from "../../Assets/EyeCloseIcon.svg";
import React, { useContext, useEffect, useState } from "react";
import { sendRuntimeMessage } from "../../Utility/message_helper.js";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import {
  COPIED,
  PVT_KEY,
  MNEMONIC,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";

function PrivateKey() {
  const { state, privateKey, seedPhrase } = useContext(AuthContext);
  const { currentAccount } = state;
  const [isOpen, setOpen] = useState({ open1: true, open2: true });
  const accData = seedPhrase.split("//");
  const mnemonic = accData[0];
  const derivedPath = seedPhrase?.includes("//") ? accData[1] : "";

  const handleEyeOpen = (e) => {
    const name = e.target.name;
    setOpen((p) => ({ ...p, [name]: !isOpen[name] }));
  };
  useEffect(() => {
    sendRuntimeMessage(
      MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
      MESSAGE_EVENT_LABELS.EXPORT_PRIVATE_KEY,
      { address: currentAccount?.evmAddress }
    );
    sendRuntimeMessage(
      MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
      MESSAGE_EVENT_LABELS.EXPORT_SEED_PHRASE,
      { address: currentAccount.nativeAddress }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (e) => {
    if (e.target.name === MNEMONIC) navigator.clipboard.writeText(mnemonic);
    else if (e.target.name === PVT_KEY) navigator.clipboard.writeText(privateKey);
    toast.success(COPIED);
  };

  return (
    <>
      <div className={`scrollableCont`}>
        <MenuRestofHeaders backTo={ROUTES.ENTER_PASS} title={"Your Secret Keys"} />
        <div className={`flexedContent`}>
          <div className={style.enterPassword}>
            {/* <div className={style.commonHeadeing}>
              <h1>Your Secret Keys</h1>
            </div> */}
            <div className={style.wallet}>
              <div className={style.wallet__addressInput}>
                <label>EVM Private Key:</label>
                <p
                  className={`${style.wallet__addressInput__copyText} ${style.wallet__addressInput__privateCopyText}`}>
                  <span className={isOpen.open1 && "blurContact"}>
                    {privateKey ? privateKey : ""}
                  </span>
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
                    draggable={false}
                    src={CopyIcon}
                    alt="copyIcon"
                    name={PVT_KEY}
                    onClick={handleCopy}
                  />
                </p>
              </div>
            </div>

            <div className={style.wallet}>
              <div className={style.wallet__addressInput}>
                <label>Mnemonic Phrase: {derivedPath ? "//" + derivedPath : ""}</label>
                <p
                  className={`${style.wallet__addressInput__copyText} ${style.wallet__addressInput__privateCopyText}`}>
                  <span className={isOpen.open2 && "blurContact"}>{mnemonic ? mnemonic : ""}</span>
                  {isOpen?.open2 ? (
                    <img
                      width={19}
                      height={16}
                      name="open2"
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
                      name="open2"
                      draggable={false}
                      src={EyeOpenIcon}
                      onClick={handleEyeOpen}
                    />
                  )}
                  <img
                    draggable={false}
                    src={CopyIcon}
                    alt="copyIcon"
                    name={MNEMONIC}
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
