import React, { useContext, useEffect, useState } from "react";
import {toast} from "react-toastify";
import style from "./style.module.scss";
import { AuthContext } from "../../Store/index";
import { useNavigate } from "react-router-dom";
import CopyIcon from "../../Assets/CopyIcon.svg";
import ButtonComp from "../ButtonComp/ButtonComp.jsx";
import { NATIVE, EVM, COPIED } from "../../Constants/index";
import Exportprivate from "../../Assets/PNG/exportprivate.png";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders.jsx";
import { ROUTES } from "../../Routes";

function ManageWallet() {
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState("");

  const { state} = useContext(AuthContext);
  const { currentAccount, allAccounts } = state;

  useEffect(()=>{
    let data = allAccounts[currentAccount?.index];
    setAccountData(data);
  },[currentAccount.index])

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
    toast.success(COPIED)
  }

  return (
    <>
      <div className={`scrollableCont`}>
        <MenuRestofHeaders backTo={ROUTES.WALLET} title={"Manage Wallet"} />
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
                <span>{accountData?.accountName}</span>
                <img src={CopyIcon} alt="copyIcon" name="name" onClick={handleCopy} draggable={false}/>{" "}
              </p>
            </div>
          </div>
          <div className={style.wallet}>
            <div className={style.wallet__addressInput}>
              <label>Native Chain Address:</label>
              <p className={style.wallet__addressInput__copyText}>
                <span>{accountData.nativeAddress}</span>
                <img src={CopyIcon} alt="copyIcon" name={NATIVE} onClick={handleCopy} draggable={false}/>{" "}
              </p>
            </div>
          </div>
          <div className={style.wallet}>
            <div className={style.wallet__addressInput}>
              <label>Evm Chain Address:</label>
              <p className={style.wallet__addressInput__copyText}>
                <span>{accountData.evmAddress}</span>
                <img src={CopyIcon} alt="copyIcon" name={EVM} onClick={handleCopy} draggable={false} />{" "}
              </p>
            </div>
          </div>
          <div className={style.btn_icon}>
            <ButtonComp
              onClick={() => navigate(ROUTES.ENTER_PASS)}
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
