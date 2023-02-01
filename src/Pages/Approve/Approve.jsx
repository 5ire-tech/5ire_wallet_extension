import React from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import style from "./style.module.scss";

function Approve({ onClick, text = "Approve" }) {
  return (
    <div>
      {" "}
      <div className={style.approveBtn}>
        {/* <ButtonComp bordered={true} text={"Cancel"} maxWidth={"100%"} /> */}

        <ButtonComp onClick={onClick} text={text} maxWidth={"100%"} />
      </div>
    </div>
  );
}

export default Approve;
