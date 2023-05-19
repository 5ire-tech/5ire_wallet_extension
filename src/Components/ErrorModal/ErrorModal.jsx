import React, { useContext } from 'react';
import { AuthContext } from '../../Store';
import FaildSwap from "../../Assets/DarkLogo.svg";
import ButtonComp from '../ButtonComp/ButtonComp';
import ModalCustom from '../ModalCustom/ModalCustom';

export default function ErrorModal() {
  const { backgroundError, setBackgroundError } = useContext(AuthContext);

  const handleErrorModal = () => {
    setBackgroundError(null);
  }

  return (
    <ModalCustom
      isModalOpen={!!backgroundError}
      handleOk={handleErrorModal}
      handleCancel={handleErrorModal}
      centered
    >
      <div className="swapsendModel">
        <div className="innerContact">
          <img
            src={FaildSwap}
            alt="swapFaild"
            width={80}
            height={80}
            draggable={false}
          />
          <h3 className="title">Something went wrong!</h3>
          <p className="transId">{backgroundError}</p>
          <div className="footerbuttons">
            <ButtonComp text={"Ok"} onClick={handleErrorModal} />
          </div>
        </div>
      </div>
    </ModalCustom>
  )
}