import React from "react";
import { Link } from "react-router-dom";
import style from "./style.module.scss";
import BackArrowIcon from "../../../Assets/PNG/arrowright.png";
import SilverLogo from "../../../Assets/DarkLogo.svg";

function MenuRestofHeaders({ title, backTo, logosilver }) {
  return (
    <div className={`${style.restOfHeaders} stickyHeader`}>
      <div className={`${style.backarrowIcon}`}>
        {backTo && (
          <Link to={backTo}>
            <img src={BackArrowIcon} alt="backArrow" className={style.backarow} draggable={false} />
          </Link>
        )}
      </div>
      <div>
        {logosilver && (
          <img src={SilverLogo} alt="Silver logo" draggable={false} className={style.silverLogo} />
        )}
      </div>
      <h4>{title}</h4>
      <span></span>
    </div>
  );
}

export default MenuRestofHeaders;
