import React from 'react';
import style from "./style.module.scss";
import yellow_send from "../../Assets/yellow_send.svg";
import red_send from "../../Assets/red_send.svg";
import green_send from "../../Assets/green_send.svg";
import yellow_swap from "../../Assets/yellow_swap.svg";
import red_swap from "../../Assets/red_swap.svg";
import green_swap from "../../Assets/green_swap.svg";
import yellow_contract from "../../Assets/yellow_contract.svg";
import red_contract from "../../Assets/red_contract.svg";
import green_contract from "../../Assets/green_contract.svg";

import { isEqual } from '../../Utility/utility';
import { formatDate } from "../../Helper/helper"
import { fixNumber, numFormatter } from "../../Helper/helper";
import { EVM, NATIVE, STATUS, TX_TYPE } from '../../Constants';


function getTxIcon(type, status) {
  switch (type) {
    case TX_TYPE.SWAP:
      return status === STATUS.SUCCESS.toLowerCase() ? green_swap : status === STATUS.FAILED.toLowerCase() ? red_swap : yellow_swap;
    case TX_TYPE.CONTRACT_EXECUTION:
    case TX_TYPE.CONTRACT_DEPLOYMENT:
      return status === STATUS.SUCCESS.toLowerCase() ? green_contract : status === STATUS.FAILED.toLowerCase() ? red_contract : yellow_contract;
    case TX_TYPE.SEND:
    case TX_TYPE.NATIVE_APP:
    case TX_TYPE.NATIVE_SIGNER:
    default:
      return status === STATUS.SUCCESS.toLowerCase() ? green_send : status === STATUS.FAILED.toLowerCase() ? red_send : yellow_send;

  }
}

export default function HistoryItem({ historyItem, handleHistoryOpen }) {
  return (
    <>
      <div className={style.historySec__historyTimeDate}>
        <p>{formatDate(historyItem.timeStamp)}</p>
      </div>
      <div className={style.historySec__historyMarketSwap}>
        <div className={style.historySec__historyMarketSwap__leftSide}>
          <img alt="hash" src={getTxIcon(historyItem.type, historyItem.status.toLowerCase())} />

          <div className={style.historySec__historyMarketSwap__leftContact} onClick={() => { handleHistoryOpen(historyItem) }}>
            <h3>
              {isEqual(historyItem?.type, TX_TYPE.NATIVE_APP) ? historyItem?.method : historyItem.type}
            </h3>
            <p>{historyItem?.to && historyItem?.to?.length > 40 ? (historyItem?.to?.startsWith(5) ? NATIVE : EVM) : historyItem.to}</p>
          </div>

        </div>

        <div className={style.historySec__historyMarketSwap__rytSide}>
          <h3>{historyItem?.amount ? numFormatter(fixNumber(historyItem.amount)) : "0"} 5ire</h3>
          <p>
            Status : <span className={(historyItem.status.toLowerCase() === STATUS.PENDING.toLowerCase() || historyItem.status.toLowerCase() === STATUS.QUEUED.toLowerCase()) ? style.historySec__pending : (historyItem.status.toLowerCase() === STATUS.SUCCESS.toLowerCase() ? style.historySec__success : style.historySec__failed)}>{historyItem.status}</span>
          </p>
        </div>
      </div>
    </>
  )
}
