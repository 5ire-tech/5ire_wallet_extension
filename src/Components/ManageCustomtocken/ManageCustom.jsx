import React from "react";
import style from "./style.module.scss";

function ManageCustom({ active, img, checkValue, onSelectAcc, data }) {
  return (
    <>
      <div
        className={style.manageList}
        onClick={() => onSelectAcc(data?.accountName)}
      >
        <div className={style.manageList__imgcurrency}>
          <img src={img} alt="" draggable={false} />
          <div className={style.manageList__imgcurrency_Name}>
            <p>{data?.accountName}</p>
          </div>
        </div>
        <input
          type="radio"
          name="accounts"
          checked={active}
          value={checkValue}
          className={style.checkbox}
        />
      </div>
    </>
  );
}

export default ManageCustom;
