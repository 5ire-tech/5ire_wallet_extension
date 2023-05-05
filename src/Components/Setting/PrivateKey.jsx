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
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS,
  PVT_KEY,
  MNEMONIC,
} from "../../Constants/index";
import { ROUTES } from "../../Routes";

// function PrivateKey({ id }) {
function PrivateKey() {
  const { state, privateKey, seedPhrase } = useContext(AuthContext);
  const { currentAccount } = state;
  const [isOpen, setOpen] = useState({ open1: true, open2: true });


  const handleEyeOpen = (e) => {
    const name = e.target.name;
    setOpen(p => ({ ...p, [name]: !isOpen[name] }));
  }
  useEffect(() => {
    // if (id === PVT_KEY) {
    sendRuntimeMessage(
      MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
      MESSAGE_EVENT_LABELS.EXPORT_PRIVATE_KEY,
      { address: currentAccount.evmAddress }
    );
    // } else {
    sendRuntimeMessage(
      MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
      MESSAGE_EVENT_LABELS.EXPORT_SEED_PHRASE,
      { address: currentAccount.nativeAddress }
    );
    // }
  }, []);

  const handleCopy = (e) => {
    if (e.target.name === MNEMONIC) navigator.clipboard.writeText(seedPhrase);
    else if (e.target.name === PVT_KEY)
      navigator.clipboard.writeText(privateKey);
    toast.success(COPIED);
  };

  return (
    <>
      <div className={`scrollableCont`}>
        <MenuRestofHeaders backTo={ROUTES.ENTER_PASS} title={""} />
        <div className={`flexedContent`}>
          <div className={style.enterPassword}>
            <div className={style.commonHeadeing}>
              <h1>Your Secret Keys</h1>
            </div>
            <div className={style.wallet}>
              <div className={style.wallet__addressInput}>
                <p
                  className={`${style.wallet__addressInput__copyText} ${style.wallet__addressInput__privateCopyText}`}
                >
                  <span className={isOpen.open1 && "blurContact"}>{privateKey ? privateKey : ""}</span>
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

            {/* <div className={style.mnemonicsButton}>
              <ButtonComp
                onClick={handleClick}
                text={show ? "Hide Mnemonic" : "Reveal Mnemonic"} />
            </div> */}
            <div className={style.wallet}>
              <div className={style.wallet__addressInput}>
                <p
                  className={`${style.wallet__addressInput__copyText} ${style.wallet__addressInput__privateCopyText}`}
                >
                  <span className={isOpen.open2 && "blurContact"}>{seedPhrase ? seedPhrase : ""}</span>
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
      {/* <div className={`scrollableCont`}>
        <div className={`flexedContent`}>
          <div className={style.enterPassword}>
            <div className={style.commonHeadeing}>
              <h1>{id === PVT_KEY ? "Your Private Key" : "Your Mnemonic"}</h1>
            </div>
            <div className={style.wallet}>
              <div className={style.wallet__addressInput}>
                <p className={`${style.wallet__addressInput__copyText} ${style.wallet__addressInput__privateCopyText}`}>
                  <span>{id === PVT_KEY ? privateKey : seedPhrase}</span>
                  <img
                    draggable={false}
                    src={CopyIcon}
                    alt="copyIcon"
                    name={id === PVT_KEY ? PVT_KEY : MNEMONIC}
                    onClick={handleCopy}
                  />
                </p>
              </div>
            </div>

          </div>
        </div>
      </div> */}
    </>
  );
}

export default PrivateKey;
