// import Link from 'antd/es/typography/Link';
import { Link } from "react-router-dom";
import React from "react";
import ticketcheck1 from "../../Assets/ArrowRightIcon.svg";
import style from "./style.module.scss";

function SettingList(props) {
  const { setinglist, to, ticketcheck, onClick } = props;
  return (
    <>
      <div className={style.listItems}>
        <Link to={to}>
          <div className={style.settingList} onClick={onClick}>
            <div className={style.settingList__imgValue}>
              <img src={ticketcheck} draggable={false} alt="ticketCheck" />
              <p>{setinglist}</p>
            </div>
            <img src={ticketcheck1} alt="ticketCheck" draggable={false} />
          </div>
        </Link>
      </div>
    </>
  );
}

export default SettingList;
