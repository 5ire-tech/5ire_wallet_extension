import React from 'react';
import Swap from "../../Assets/swap.svg";
import Sent from "../../Assets/sent.svg";
import style from "./style.module.scss";
import {formatDate, shortner} from "../../Helper/helper"

export default function HistoryItem({historyItem, handleHistoryOpen}) {
  return (
   <>
       <div className={style.historySec__historyTimeDate}>
        <p>{formatDate(historyItem.timeStamp)}</p>
      </div>
      <div className={style.historySec__historyMarketSwap}>
        <div className={style.historySec__historyMarketSwap__leftSide}>
          <img src={historyItem.intermidateHash ? Swap : Sent} />
          <div className={style.historySec__historyMarketSwap__leftContact} onClick={() => {handleHistoryOpen(historyItem)}}>
            <h3>{historyItem.type}</h3>
            <p>{historyItem.to && historyItem.to.length > 40? shortner(historyItem.to): historyItem.to}</p>
          </div>
        </div>
        <div className={style.historySec__historyMarketSwap__rytSide}>
          <h3>{historyItem.amount} 5ire</h3>
          <p>
            Status : <span className={style.historySec__pending}>{historyItem.status}</span>
          </p>
        </div>
      </div>
   </>
  )
}
