import React, { useContext } from "react";
import { AuthContext } from "../../Store";
import ModalCustom from "../ModalCustom/ModalCustom";
import FaildSwap from "../../Assets/FaildSwap.svg";
import ButtonComp from "../ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { ERROR_MESSAGES, MESSAGE_EVENT_LABELS, MESSAGE_TYPE_LABELS } from "../../Constants";
import { toast } from "react-hot-toast";

export default function ErrorModal() {
  const { backgroundError, setBackgroundError } = useContext(AuthContext);

  const handleErrorModal = () => {
    setBackgroundError(null);

    if (backgroundError?.real?.includes(ERROR_MESSAGES.PAIR_KEYRING_ERROR)) {
      sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.LOCK, {});
      toast.error(ERROR_MESSAGES.LOGIN_AGAIN);
    }
  };

  return (
    <ModalCustom
      isModalOpen={!!backgroundError?.message}
      handleOk={handleErrorModal}
      handleCancel={handleErrorModal}
      centered>
      <div className="swapsendModel">
        <div className="innerContact">
          <img src={FaildSwap} alt="swapFaild" width={80} height={80} draggable={false} />
          <h3 className="rongText">Something went wrong!</h3>
          <p className="transId">{backgroundError?.message}</p>
          <div className="footerbuttons" style={{ marginTop: "25px" }}>
            <ButtonComp text={"Okay"} onClick={handleErrorModal} />
          </div>
        </div>
      </div>
    </ModalCustom>
  );
}
