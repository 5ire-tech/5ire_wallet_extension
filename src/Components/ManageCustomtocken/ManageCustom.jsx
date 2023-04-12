import React from "react";
import style from "./style.module.scss";

import { Switch, Checkbox, Radio } from "antd";

function ManageCustom({
  active,
  balance,
  img,
  checkValue,
  edited,
  onSelectAcc,
  data
  // onSelectByDiv
}) {
  return (
    <>
      <div className={style.manageList} onClick={()=>onSelectAcc(data?.accountIndex)} >
        <div className={style.manageList__imgcurrency} >
          <img src={img} alt="" draggable={false}/>
          <div className={style.manageList__imgcurrency_Name}>
            <p>
              {data?.accountName}
              {/* <span>{valuecurrency}</span> */}
            </p>
            {/* <span>{balance}</span> */}
          </div>
        </div>
        {/* {edited ? (
          <Switch
            defaultChecked
            //  onChange={onChange}
          />
        ) : ( */}
        <input
          type="radio"
          name="accounts"
          checked={active}
          value={checkValue}
          className={style.checkbox}
        />
        {/* ) */}
        {/* } */}
      </div>
    </>
  );
}

export default ManageCustom;
