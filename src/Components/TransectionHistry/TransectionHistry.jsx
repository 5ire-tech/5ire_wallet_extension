import React, { useContext } from "react";
import style from "./style.module.scss";
import { toast } from "react-toastify";
import SwapIcon from "../../Assets/SwapIcon.svg";
import CopyIcon from "../../Assets/CopyIcon.svg";
import DarkRyt from "../../Assets/darkRyt.svg";
import { formatDate, shortner } from "../../Helper/helper";
import { AuthContext } from "../../Store";
function TransectionHistry({selectedTransaction, account}) {

  const handleClick = (hash) => {
    navigator.clipboard.writeText(hash);
    toast.success("Transacion hash copied.");
  };

  const isSwap = !!selectedTransaction?.intermidateHash;
  const isEvm = !!selectedTransaction?.isEvm;

  return (
    <div
      className={style.transectionHistry}
      name={selectedTransaction?.txHash}
      onClick={() => handleClick(selectedTransaction?.txHash)}
    >

      {
        isSwap ?
        (
          <div className={style.transectionHistry__swapCopy}>
          <div className={style.transectionHistry__swapSec}>
            <h3>{isEvm ? "Evm" : "Native"}</h3>
            <span>{shortner(isEvm ? account.evmAddress : account.nativeAddress)}</span>
          </div>
          <div className={style.transectionHistry__icon} onClick={handleClick}>
            <img src={SwapIcon} alt="swapIcon" draggable={false} />
          </div>
          <div className={`${style.transectionHistry__swapSec} ${style.transectionHistry__rytContact}`}>
          <h3>{isEvm ? "Evm" : "Native"}</h3>
            <span>{shortner(isEvm ? account.evmAddress : account.nativeAddress)}</span>
          </div>
        </div>
        ) 
        : 
        (
          <div className={style.transectionHistry__swapCopy}>
          <div className={style.transectionHistry__swapSec}>
            <h3>From</h3>
            <span>{shortner(isEvm ? account.evmAddress : account.nativeAddress)}</span>
          </div>
          <div className={style.transectionHistry__icon} onClick={handleClick}>
            <img src={SwapIcon} alt="swapIcon" draggable={false} />
          </div>
          <div className={`${style.transectionHistry__swapSec} ${style.transectionHistry__rytContact}`}>
          <h3>To</h3>
            <span>{selectedTransaction?.to ? shortner(selectedTransaction?.to) : "Contract Transactions"}</span>
          </div>
          </div>
        )
      }


      <div className={style.transectionHistry__swapCopy} style={{ marginTop: "29px" }}>
        <div className={style.transectionHistry__swapSec}>
          <h3>Status</h3>
          <span>{selectedTransaction?.status}</span>
        </div>
        <div className={`${style.transectionHistry__swapSec} ${style.transectionHistry__rytContact}`}>
          <h3>Transaction ID</h3>
          <span>{selectedTransaction?.txHash && shortner(selectedTransaction?.txHash)}<img src={CopyIcon}/></span>
        </div>
      </div>
      <div className={style.transectionHistry__swapCopy} style={{ marginTop: "29px" }}>
        <div className={style.transectionHistry__swapSec}>
          <h3>Date & Time</h3>
          <span>{formatDate(selectedTransaction?.timeStamp)}</span>
        </div>
        <div className={`${style.transectionHistry__swapSec} ${style.transectionHistry__rytContact}`}>
          <h3>Fee</h3>
          <span>{selectedTransaction?.gasUsed || "Nil"}</span>
        </div>
      </div>
      <div className={style.transectionHistry__viewExplorer}>
        <p>view on explorer <img src={DarkRyt}/></p>

      </div>
    </div>
  );
}

export default TransectionHistry;
