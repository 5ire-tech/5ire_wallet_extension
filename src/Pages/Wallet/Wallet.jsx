import Send from "../Send/Send";
import Swap from "../Swap/Swap.jsx";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import SwapLogo from "../../Assets/swap_arrow.svg";
import TransferLogo from "../../Assets/send_arrow.svg";
import React, { useEffect, useState, useContext } from "react";

function Wallet() {
  const [activeTab, setActiveTab] = useState("send");
  const { updateEstimatedGas } = useContext(AuthContext);

  useEffect(() => {
    updateEstimatedGas(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const activeSend = () => {
    setActiveTab("send");
  };
  const activeSwap = () => {
    setActiveTab("swap");
  };
  return (
    <div className={style.wallet}>
      <div className={style.wallet__sendSwapSec}>
        <div className={style.wallet__multiSwapBtn}>
          <div className={style.wallet__sendSwapbtn}>
            <button
              onClick={activeSend}
              className={`${style.firstButton} ${
                style.wallet__sendSwapbtn__buttons
              } 
              ${
                activeTab === "send" &&
                style.wallet__sendSwapbtn__buttons__active
              }
            `}>
              <img src={TransferLogo} alt="transferLogo" />
              Transfer
            </button>
            <button
              onClick={activeSwap}
              className={`${style.secondtButton} ${
                style.wallet__sendSwapbtn__buttons
              }  ${
                activeTab === "swap" &&
                style.wallet__sendSwapbtn__buttons__active
              }`}>
              <img src={SwapLogo} alt="swapLogo" /> Swap
            </button>
            <div
              className={`${activeTab === "send" && style.activeFirst} ${
                activeTab === "swap" && style.activeSecond
              } ${style.animations}`}></div>
          </div>
        </div>
        {activeTab === "send" && (
          <div>
            <Send />
          </div>
        )}
        {activeTab === "swap" && (
          <div>
            <Swap />
          </div>
        )}
      </div>
    </div>
  );
}

export default Wallet;
