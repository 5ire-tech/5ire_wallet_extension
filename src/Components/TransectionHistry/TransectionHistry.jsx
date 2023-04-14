import { useEffect } from "react";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import {numFormatter} from "../../Helper/helper";
import { SUCCESS_MESSAGES, CURRENCY } from "../../Constants";

function TransectionHistry({ dateTime, img, type, to, amount, status, txHash }) {

  const handleClick = (hash) =>{
    navigator.clipboard.writeText(hash);
    toast.success(SUCCESS_MESSAGES.HASH_COPIED);
  }

  return (
    <div className={style.transectionHistry} name={txHash} onClick={()=>handleClick(txHash)}>
      <p className={style.transectionHistry__dateTime}>
        {dateTime}
      </p>
      <div className={style.transectionHistry__histry}>
        <div className={style.transectionHistry__histry__status}>
          <img alt="currency" src={img} draggable={false} />
          <div>
            <p>{type}</p>
            <p>{to}</p>
          </div>
        </div>
        <div className={style.transectionHistry__histry__success}>
          <p> {amount? `${numFormatter(new BigNumber(Number(amount)).toFixed(6,8).toString())} ${CURRENCY}`:""}</p>
          <p>
            Status : <span>{status}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default TransectionHistry