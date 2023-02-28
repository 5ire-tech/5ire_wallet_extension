import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./style.module.scss";
function CoinsTable({ dataArray }) {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false)
  const handleClick = (ele) => {
    let routes = Object.keys(ele).includes("routeTo");
    if (routes) {
      navigate(`/${ele.routeTo}`);
    } else {
      setOpenModal(ele.openModal());
    }
  };
  return (
    <>
      {dataArray.map((ele, index) => (
        <div className={style.coinsTable} key={index}>
          <div className={style.coinsTable__left}>
            <div className={style.coinsTable__left__icon}>
              <img src={ele.coinIcon} height={30} width={30} alt="coinIcon" draggable={false}/>
            </div>
            <div className={style.coinsTable__left__textSec}>
              <div
                onClick={() => handleClick(ele)}
                className={style.coinsTable__textTop}
                style={{ cursor: "pointer" }}
              >
                {ele.coinName}
                <div className={`${style.coinsTable__grayText12} textBold`}>
                  /{ele.coinSubName}
                </div>
              </div>
              <div className={style.coinsTable__grayText12}>
                ${ele.coinPrice} |
                <div
                  className={`${style.coinsTable__grayText12} positiveText`}
                  style={{ marginLeft: "3px" }}
                >
                  {ele.coinStatus}
                </div>
              </div>
            </div>
          </div>
          <div className={style.coinsTable__right}>
            <div className={style.coinsTable__textTop}>{ele.currCryptoBal}</div>
            <div
              className={style.coinsTable__grayText12}
              style={{ justifyContent: "flex-end" }}
            >
              ${ele.currDollerBal}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default CoinsTable;
