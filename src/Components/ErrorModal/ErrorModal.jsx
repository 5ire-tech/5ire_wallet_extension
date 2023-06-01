import React, { useContext } from "react";
import { AuthContext } from "../../Store";
import ModalCustom from "../ModalCustom/ModalCustom";
import FaildSwap from "../../Assets/FaildSwap.svg";
import ButtonComp from "../ButtonComp/ButtonComp";

export default function ErrorModal() {
  const { backgroundError, setBackgroundError } = useContext(AuthContext);

  const handleErrorModal = () => {
    setBackgroundError(null);
  };

  return (
    <ModalCustom
      isModalOpen={!!backgroundError}
      handleOk={handleErrorModal}
      handleCancel={handleErrorModal}
      centered>
      <div className="swapsendModel">
        <div className="innerContact">
          <img src={FaildSwap} alt="swapFaild" width={80} height={80} draggable={false} />
          <h3 className="rongText">Something went wrong!</h3>
          <p className="transId">{backgroundError}</p>
          <div className="footerbuttons" style={{ marginTop: "25px" }}>
            <ButtonComp text={"Okay"} onClick={handleErrorModal} />
          </div>
        </div>
      </div>
    </ModalCustom>
  );
}
