import Send from "../Send/Send";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import React, { useEffect, useState, useContext } from "react";
import { AssetsIcon, Transfer } from "../../Assets/StoreAsset/StoreAsset";
import Assets from "../Assets/Assets";

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
              className={`${style.firstButton} ${style.wallet__sendSwapbtn__buttons} 
              ${activeTab === "send" && style.wallet__sendSwapbtn__buttons__active}
            `}>
              <Transfer />
              Transfer
            </button>
            <button
              onClick={activeSwap}
              className={`${style.secondtButton} ${style.wallet__sendSwapbtn__buttons}  ${
                activeTab === "swap" && style.wallet__sendSwapbtn__buttons__active
              }`}>
              <AssetsIcon /> Assets
            </button>
            <div
              className={`${activeTab === "send" && style.activeFirst} ${
                activeTab === "swap" && style.activeSecond
              } ${style.animations}`}></div>
          </div>
        </div>
        {/* <div className="innerScrool">
          <Send />
        </div> */}
        {activeTab === "send" && (
          <div className="innerScrool">
            <Send />
          </div>
        )}
        {activeTab === "swap" && (
          <div className="innerScrool">
            <Assets />
          </div>
        )}
      </div>
    </div>
  );
}

export default Wallet;
