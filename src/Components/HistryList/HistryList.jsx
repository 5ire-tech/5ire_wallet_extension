import React from "react";
import style from "./style.module.scss"
// import TickIcon from "../../Assets/TickIcon.svg"
function HistryList(props) {

  const { sendRecieve, coinname, address, valueCurrency, dollercurrency, addressTo, TickIcon } = props;

  return (
    <>
      <div className={style.histryList}>
        <div className={style.histryList__Status}>
          <img src={TickIcon} draggable={false} alt="tickIcon"></img>
          <div className={style.histryList__Status__Send}>
            <p>{sendRecieve}<span>/{coinname}</span></p>
            <p>{address}</p>
          </div>
        </div>
        <div className={style.histryList__Currency}>
          <p>{valueCurrency}<span>/{dollercurrency}</span></p>
          <p>{addressTo}</p>
        </div>
      </div>
    </>
  );
}

export default HistryList;
