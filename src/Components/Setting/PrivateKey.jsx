import { ROUTES } from "../../Routes";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import { AuthContext } from "../../Store/index";
import CopyIcon from "../../Assets/CopyIcon.svg";
import ButtonComp from "../ButtonComp/ButtonComp";
import React, { useState, useContext, useEffect} from "react";
import { COPIED, LABELS, MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS} from "../../Constants/index";
import { decryptor } from "../../Helper/CryptoHelper";
import { sendRuntimeMessage } from "../../Utility/message_helper.js"
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";


function PrivateKey() {

  const { state, privateKey, seedPhrase} = useContext(AuthContext);
  const [show, handleShow] = useState(false);
  const { currentAccount } = state;

  useEffect(() => {
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.EXPORT_PRIVATE_KEY, { address : currentAccount.evmAddress});
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.EXPORT_SEED_PHRASE, { address : currentAccount.nativeAddress});
    
  }, []);

  const handleCopy = (e) => {
    if (e.target.name === LABELS.SEED)
      navigator.clipboard.writeText(seedPhrase);
    else if (e.target.name === LABELS.KEY)
      navigator.clipboard.writeText(privateKey);
    toast.success(COPIED);
  };

  const handleClick = () => {
    handleShow(!show);
  };

  return (
    <>
      <div className={`scrollableCont`}>
        {/* <MenuRestofHeaders backTo={ROUTES.WALLET} title={""} /> */}
        <div className={`flexedContent`}>
          <div className={style.enterPassword}>
            <div className={style.commonHeadeing}>
              <h1>Your Private Key</h1>
            </div>
            <div className={style.wallet}>
              <div className={style.wallet__addressInput}>
                <p className={style.wallet__addressInput__copyText}>
                  <span>{privateKey}</span>
                  <img
                    draggable={false}
                    src={CopyIcon}
                    alt="copyIcon"
                    name={LABELS.KEY}
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
            <div className={style.wallet} hidden={!show ? true : false}>
              <div className={style.wallet__addressInput}>
                <p className={style.wallet__addressInput__copyText}>
                  <span>{seedPhrase}</span>
                  <img
                    draggable={false}
                    src={CopyIcon}
                    alt="copyIcon"
                    name={LABELS.SEED}
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
