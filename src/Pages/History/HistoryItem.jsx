import React from 'react';
import style from "./style.module.scss";
import Swap from "../../Assets/swap.svg";
import Sent from "../../Assets/sent.svg";
import { EVM, LABELS, NATIVE, STATUS, TX_TYPE } from '../../Constants';
import { fixNumber, numFormatter } from "../../Helper/helper";
import { formatDate, shortner } from "../../Helper/helper"
import { isEqual } from '../../Utility/utility';

export default function HistoryItem({ historyItem, handleHistoryOpen }) {
  return (
    <>
      <div className={style.historySec__historyTimeDate}>
        <p>{formatDate(historyItem.timeStamp)}</p>
      </div>
      <div className={style.historySec__historyMarketSwap}>
        <div className={style.historySec__historyMarketSwap__leftSide}>
          <img alt="hash" src={historyItem.intermidateHash ? Swap : Sent} />

          <div className={style.historySec__historyMarketSwap__leftContact} onClick={() => { handleHistoryOpen(historyItem) }}>
            <h3>{isEqual(historyItem?.type, TX_TYPE.NATIVE_APP) ? historyItem?.method : historyItem.type}</h3>
            {/* <p>{historyItem.to && historyItem.to.length > 40 ? shortner(historyItem.to) : historyItem.to}</p> */}
            <p>{historyItem?.to && historyItem?.to?.length > 40 ? (historyItem?.to?.startsWith(5) ? NATIVE : EVM) : historyItem.to}</p>
          </div>

        </div>

        <div className={style.historySec__historyMarketSwap__rytSide}>
          <h3>{historyItem?.amount ? numFormatter(fixNumber(historyItem.amount)) : ""} 5ire</h3>
          <p>
            Status : <span className={(historyItem.status.toLowerCase() === STATUS.PENDING.toLowerCase() || historyItem.status.toLowerCase() === STATUS.QUEUED.toLowerCase()) ? style.historySec__pending : (historyItem.status.toLowerCase() === STATUS.SUCCESS.toLowerCase() ? style.historySec__success : style.historySec__failed)}>{historyItem.status}</span>
          </p>
        </div>
      </div>
    </>
  )
}
