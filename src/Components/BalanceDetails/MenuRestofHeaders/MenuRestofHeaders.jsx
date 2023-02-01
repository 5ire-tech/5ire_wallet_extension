import React from "react";
import style from "./style.module.scss";
import BackArrowIcon from "../../../Assets/PNG/arrowright.png";
import SilverLogo from "../../../Assets/Sirlver_Logo.svg";
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
        {logosilver && <img src={SilverLogo} />}
        {backTo && (
          <Link to={backTo}>
            <img src={BackArrowIcon} className={style.backarow} />
          </Link>
        )}
      </div>
      <h4>{title}</h4>
      <span></span>
    </div>
  );
}

export default MenuRestofHeaders;
