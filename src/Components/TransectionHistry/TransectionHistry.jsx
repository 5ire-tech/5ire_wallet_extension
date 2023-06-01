import React from "react";
import style from "./style.module.scss";
import { toast } from "react-hot-toast";
import SwapIcon from "../../Assets/SwapIcon.svg";
import CopyIcon from "../../Assets/CopyIcon.svg";
import DarkRyt from "../../Assets/darkRyt.svg";
import { CURRENCY, STATUS, SUCCESS_MESSAGES, TX_TYPE } from "../../Constants";
import {
  shortner,
  fixNumber,
  formatDate,
  openBrowserTab,
  generateTransactionUrl
} from "../../Helper/helper";

function TransectionHistry({ selectedTransaction, account }) {
  //for copying the hash to clipboard
  const handleClick = (hash) => {
    navigator.clipboard.writeText(hash);
    toast.success(SUCCESS_MESSAGES.HASH_COPIED);
  };

  //for opening the explorer tab
  const openExplorerTab = () => {
    selectedTransaction.txHash &&
      openBrowserTab(
        generateTransactionUrl(
          selectedTransaction.chain,
          selectedTransaction.txHash,
          selectedTransaction.isEvm
        )
      );
  };

  const isSwap = selectedTransaction?.type?.toLowerCase() === TX_TYPE.SWAP.toLowerCase();
  const isEvm = !!selectedTransaction?.isEvm;

  return (
    <div className={style.transectionHistry} name={selectedTransaction?.txHash}>
      {isSwap ? (
        <div className={style.transectionHistry__swapCopy}>
          <div className={style.transectionHistry__swapSec}>
            <h3>{`From ${isEvm ? "EVM" : "Native"}`}</h3>
            <span>{shortner(isEvm ? account?.evmAddress : account?.nativeAddress)}</span>
          </div>
          <div className={style.transectionHistry__icon} style={{ marginRight: "20px" }}>
            <img src={SwapIcon} alt="swapIcon" draggable={false} />
          </div>
          <div
            className={`${style.transectionHistry__swapSec} ${style.transectionHistry__rytContact}`}>
            <h3>{`To ${isEvm ? "Native" : "EVM"}`}</h3>
            <span>{shortner(isEvm ? account?.nativeAddress : account?.evmAddress)}</span>
          </div>
        </div>
      ) : (
        <div className={style.transectionHistry__swapCopy}>
          <div className={style.transectionHistry__swapSec}>
            <h3>{`From ${isEvm ? "EVM" : "Native"}`}</h3>
            <span>{shortner(isEvm ? account?.evmAddress : account?.nativeAddress)}</span>
          </div>
          <div className={style.transectionHistry__icon} style={{ marginRight: "29px" }}>
            <img src={SwapIcon} alt="swapIcon" draggable={false} />
          </div>
          <div
            className={`${style.transectionHistry__swapSec} ${style.transectionHistry__rytContact}`}>
            <h3>{`To ${isEvm ? "EVM" : "Native"}`}</h3>
            <span>
              {selectedTransaction?.to
                ? shortner(selectedTransaction?.to)
                : "Contract Transactions"}
            </span>
          </div>
        </div>
      )}

      <div className={style.transectionHistry__swapCopy} style={{ marginTop: "29px" }}>
        <div className={style.transectionHistry__swapSec}>
          <h3>Status</h3>

          <span
            className={
              selectedTransaction?.status.toLowerCase() === STATUS.PENDING.toLowerCase() ||
              selectedTransaction?.status.toLowerCase() === STATUS.QUEUED.toLowerCase()
                ? style.transectionHistry__pending
                : selectedTransaction?.status.toLowerCase() === STATUS.SUCCESS.toLowerCase()
                ? style.transectionHistry__success
                : style.transectionHistry__failed
            }>
            {selectedTransaction?.status}
          </span>
        </div>
        <div
          className={`${style.transectionHistry__swapSec} ${style.transectionHistry__rytContact}`}>
          <h3>Transaction ID</h3>
          {selectedTransaction?.txHash ? (
            <span>
              {shortner(selectedTransaction?.txHash)}
              <img
                src={CopyIcon}
                alt="copyIcon"
                onClick={() => handleClick(selectedTransaction?.txHash)}
              />
            </span>
          ) : (
            <span>N/A</span>
          )}
        </div>
      </div>
      <div className={style.transectionHistry__swapCopy} style={{ marginTop: "29px" }}>
        <div
          className={`${style.transectionHistry__swapSec} ${style.transectionHistry__datetimeSwap}`}>
          <h3>Date & Time</h3>
          <span>{formatDate(selectedTransaction?.timeStamp)}</span>
        </div>
        <div
          className={`${style.transectionHistry__swapSec} ${style.transectionHistry__rytContact}`}>
          <h3>Fee</h3>
          <span>
            {selectedTransaction?.gasUsed
              ? fixNumber(selectedTransaction?.gasUsed) + " " + CURRENCY
              : "N/A"}
          </span>
        </div>
      </div>
      <div className={style.transectionHistry__viewExplorer}>
        <p
          className={selectedTransaction.txHash ? "" : "viewDisable"}
          disabled={selectedTransaction.txHash ? false : true}
          onClick={openExplorerTab}>
          View on Explorer <img src={DarkRyt} alt="view on explorer" />
        </p>
      </div>
    </div>
  );
}

export default TransectionHistry;
