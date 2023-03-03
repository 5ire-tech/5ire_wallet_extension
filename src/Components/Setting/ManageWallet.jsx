import React from "react";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders.jsx";
import { InputFieldOnly } from "../InputField/InputFieldSimple.jsx";
import CopyIcon from "../../Assets/CopyIcon.svg";
import style from "./style.module.scss";
import ButtonComp from "../ButtonComp/ButtonComp.jsx";
import Exportprivate from "../../Assets/PNG/exportprivate.png";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { NATIVE, EVM } from "../../Constants/index";
import {toast} from "react-toastify";

function ManageWallet() {
  const navigate = useNavigate();
  const { currentAccount } = useSelector(state => state.auth);

  const handleCopy = (e) => {
    if (e.target.name === NATIVE) {
      navigator.clipboard.writeText(currentAccount.nativeAddress);
    }
    if (e.target.name === EVM) {
      navigator.clipboard.writeText(currentAccount.evmAddress);
    }
    if (e.target.name === "name") {
      navigator.clipboard.writeText(currentAccount.accountName);
    }
    toast.success("Copied!")
  }

  return (
    <>
      <div className={`scrollableCont`}>
        <MenuRestofHeaders backTo={"/wallet"} title={"Manage Wallet"} />
        <div className={`flexedContent`}>
          {/* <InputFieldOnly
            placeholder={"Type Wallet Name"}
            placeholderBaseColor={true}
            coloredBg={true}
            label="Wallet Name:"
          /> */}
          <div className={style.wallet}>
            <div className={style.wallet__addressInput}>
              <label>Wallet Name:</label>
              <p className={style.wallet__addressInput__copyText}>
                <span>{currentAccount?.accountName}</span>
                <img src={CopyIcon} alt="copyIcon" name="name" onClick={handleCopy} draggable={false}/>{" "}
              </p>
            </div>
          </div>
          <div className={style.wallet}>
            <div className={style.wallet__addressInput}>
              <label>Native Chain Address:</label>
              <p className={style.wallet__addressInput__copyText}>
                <span>{currentAccount.nativeAddress}</span>
                <img src={CopyIcon} alt="copyIcon" name={NATIVE} onClick={handleCopy} draggable={false}/>{" "}
              </p>
            </div>
          </div>
          <div className={style.wallet}>
            <div className={style.wallet__addressInput}>
              <label>Evm Chain Address:</label>
              <p className={style.wallet__addressInput__copyText}>
                <span>{currentAccount.evmAddress}</span>
                <img src={CopyIcon} alt="copyIcon" name={EVM} onClick={handleCopy} draggable={false} />{" "}
              </p>
            </div>
          </div>
          <div className={style.btn_icon}>
            <ButtonComp
              onClick={() => navigate("/enterPassword")}
              text="Export Private Key"
              img={Exportprivate}
            ></ButtonComp>
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageWallet;
