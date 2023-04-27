import { ROUTES } from "../../Routes";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import { AuthContext } from "../../Store/index";
import { useNavigate } from "react-router-dom";
import CopyIcon from "../../Assets/CopyIcon.svg";
import React, { useContext, useEffect } from "react";
import ButtonComp from "../ButtonComp/ButtonComp.jsx";
import { NATIVE, EVM, COPIED, PVT_KEY, MNEMONIC } from "../../Constants/index";
import Exportprivate from "../../Assets/PNG/exportprivate.png";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders.jsx";

function ManageWallet() {
  const navigate = useNavigate();

  const { state, setPassVerified } = useContext(AuthContext);
  const { currentAccount } = state;

  useEffect(() => {
    setPassVerified(false);
  }, []);

  const handleCopy = (e) => {
    if (e.target.name === NATIVE) {
      navigator.clipboard.writeText(currentAccount?.nativeAddress);
    }
    if (e.target.name === EVM) {
      navigator.clipboard.writeText(currentAccount?.evmAddress);
    }
    if (e.target.name === "name") {
      navigator.clipboard.writeText(currentAccount?.accountName);
    }
    toast.success(COPIED);
  };

  return (
    <>
      <div className={`scrollableCont`}>
        <MenuRestofHeaders backTo={ROUTES.WALLET} title={"Manage Wallet"} />
        <div className={`flexedContent`}>
          <div className={style.wallet}>
            <div className={style.wallet__addressInput}>
              <label>Wallet Name:</label>
              <p className={style.wallet__addressInput__copyText}>
                <span>{currentAccount?.accountName}</span>
                <img src={CopyIcon} alt="copyIcon" name="name" onClick={handleCopy} draggable={false} />{" "}
              </p>
            </div>
          </div>
          <div className={style.wallet}>
            <div className={style.wallet__addressInput}>
              <label>Native Chain Address:</label>
              <p className={style.wallet__addressInput__copyText}>
                <span>{currentAccount?.nativeAddress}</span>
                <img src={CopyIcon} alt="copyIcon" name={NATIVE} onClick={handleCopy} draggable={false} />{" "}
              </p>
            </div>
          </div>
          <div className={style.wallet}>
            <div className={style.wallet__addressInput}>
              <label>EVM Chain Address:</label>
              <p className={style.wallet__addressInput__copyText}>
                <span>{currentAccount?.evmAddress}</span>
                <img src={CopyIcon} alt="copyIcon" name={EVM} onClick={handleCopy} draggable={false} />{" "}
              </p>
            </div>
          </div>
          <div className={style.btn_icon}>
            <ButtonComp
              onClick={() => navigate(ROUTES.ENTER_PASS + "/" + PVT_KEY)}
              text="Export Private Key"
            ></ButtonComp>
            <ButtonComp
              bordered={true}
              onClick={() => navigate(ROUTES.ENTER_PASS + "/" + MNEMONIC)}
              text="Reveal Mnemonic"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageWallet;
