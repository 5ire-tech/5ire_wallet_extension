import React from "react";
import style from "./style.module.scss";

function DefiList(props) {
  const { stakingHead, desc, bordered, tickIcon } = props;

  return (
    <>
      <div
        className={` ${style.defiList} ${
          bordered ? style.defiList__bordered : ""
        }`}>
        <div className={style.defiList__stakingList}>
          <img src={tickIcon} alt="tickIcon" draggable={false} />{" "}
          <div>
            <h2>{stakingHead}</h2>
            <p>{desc}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default DefiList;
