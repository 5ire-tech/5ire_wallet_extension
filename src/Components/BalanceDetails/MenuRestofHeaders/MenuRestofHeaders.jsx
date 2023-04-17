import React from "react";
import style from "./style.module.scss";
import BackArrowIcon from "../../../Assets/PNG/arrowright.png";
import SilverLogo from "../../../Assets/DarkLogo.svg";
import { Link } from "react-router-dom";
function MenuRestofHeaders({
  title,
  searchTo,
  backTo,
  logosilver,
  settingTo,
  FilterIcon,
  chartIcon,
}) {
  return (
    <div className={`${style.restOfHeaders} stickyHeader`}>
      <div>
        {logosilver && <img src={SilverLogo} alt="Silver logo" draggable={false}  className={style.silverLogo}/>}
        {backTo && (
          <Link to={backTo}>
            <img src={BackArrowIcon} alt="backArrow" className={style.backarow} draggable={false} />
          </Link>
        )}
      </div>
      <h4>{title}</h4>
      <span></span>
    </div>
  );
}

export default MenuRestofHeaders;
