import React from "react";
import style from "./style.module.scss";

function AccountSetting(props) {
  const { title, img, onClick } = props;

  return (
    <div className={style.create}>
      <div className={style.create__account} onClick={onClick}>
        {/* <img src={img} alt="accSettingImg" draggable={false} /> */}
        <div>{img}</div>
        <p>{title}</p>
      </div>
    </div>
  );
}

export default AccountSetting;
