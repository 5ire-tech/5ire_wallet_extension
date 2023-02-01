import React from 'react';
import style from "./style.module.scss";
function TransectionHistry(props) {

    const {dateTime,img,type,to,amount,status}=props
  return (
    <div className={style.transectionHistry}>
    <p className={style.transectionHistry__dateTime}>
     {dateTime}
    </p>
    <div className={style.transectionHistry__histry}>
      <div className={style.transectionHistry__histry__status}>
        <img alt="currency" src={img} />
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
    </div>
  </div>
  )
}

export default TransectionHistry