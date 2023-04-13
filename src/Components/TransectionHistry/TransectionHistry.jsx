import React from "react";
import style from "./style.module.scss";
import { toast } from "react-toastify";
import SwapIcon from "../../Assets/SwapIcon.svg";
import CopyIcon from "../../Assets/CopyIcon.svg";
import DarkRyt from "../../Assets/darkRyt.svg";
function TransectionHistry({
  dateTime,
  img,
  type,
  to,
  amount,
  status,
  txHash,
}) {
  const handleClick = (hash) => {
    navigator.clipboard.writeText(hash);
    toast.success("Transacion hash copied.");
  };

  return (
    <div
      className={style.transectionHistry}
      name={txHash}
      onClick={() => handleClick(txHash)}
    >
      {/* <p className={style.transectionHistry__dateTime}>
        {dateTime}
      </p> */}
      {/* <div className={style.transectionHistry__histry}>
        <div className={style.transectionHistry__histry__status}>
          <img alt="currency" src={img} draggable={false} />
          <div>
            <p>{type}</p>
            <p>{to}</p>
          </div>
        </div>
        <div className={style.transectionHistry__histry__success}>
          <p> {amount}</p>
          <p>
            Status : <span>{status}</span>
          </p>
        </div>
      </div> */}
      <div className={style.transectionHistry__swapCopy}>
        <div className={style.transectionHistry__swapSec}>
          <h3>From Native</h3>
          <span>0xxx0...lsh223</span>
        </div>
        <div className={style.transectionHistry__icon} onClick={handleClick}>
          <img src={SwapIcon} alt="swapIcon" draggable={false} />
        </div>
        <div className={`${style.transectionHistry__swapSec} ${style.transectionHistry__rytContact}`}>
          <h3>To EVM</h3>
          <span>#xxx0...lsh223</span>
        </div>
      </div>
      <div className={style.transectionHistry__swapCopy} style={{ marginTop: "29px" }}>
        <div className={style.transectionHistry__swapSec}>
          <h3>Status</h3>
          <span>SUCCESS</span>
        </div>
        <div className={`${style.transectionHistry__swapSec} ${style.transectionHistry__rytContact}`}>
          <h3>Transaction ID</h3>
          <span>#xxx0...lsh223 <img src={CopyIcon}/></span>
        </div>
      </div>
      <div className={style.transectionHistry__swapCopy} style={{ marginTop: "29px" }}>
        <div className={style.transectionHistry__swapSec}>
          <h3>Date & Time</h3>
          <span>02-03-2023 | 20:23</span>
        </div>
        <div className={`${style.transectionHistry__swapSec} ${style.transectionHistry__rytContact}`}>
          <h3>Fee</h3>
          <span>0.001 5ire</span>
        </div>
      </div>
      <div className={style.transectionHistry__viewExplorer}>
        <p>view on explorer <img src={DarkRyt}/></p>

      </div>
    </div>
  );
}

export default TransectionHistry;
