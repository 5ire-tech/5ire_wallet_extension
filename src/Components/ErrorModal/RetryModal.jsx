import React, { useContext } from 'react'
import { AuthContext } from '../../Store'
import ModalCustom from '../ModalCustom/ModalCustom';
import FaildSwap from "../../Assets/ConnectFaild.svg";
import ButtonComp from '../ButtonComp/ButtonComp';
import { MESSAGE_EVENT_LABELS, MESSAGE_TYPE_LABELS } from '../../Constants';
import { sendRuntimeMessage } from '../../Utility/message_helper';

export default function ErrorModal() {
  const { networkError, setNetworkError, updateLoading } = useContext(AuthContext);

  const handleRetry = () => {
    setNetworkError(null);
    updateLoading(true);

    //try to reconnect the network
    sendRuntimeMessage(
      MESSAGE_TYPE_LABELS.NETWORK_HANDLER,
      MESSAGE_EVENT_LABELS.NETWORK_CHANGE,
      {});
  }

  return (
    <ModalCustom
      isModalOpen={!!networkError}
      handleOk={handleRetry}
      handleCancel={handleRetry}
      centered
    >
      <div className="swapsendModel">
        <div className="innerContact">
          <img
            src={FaildSwap}
            alt="swapFaild"
            draggable={false}
          />
          <h3 className="rongText">Connection Error</h3>
          <p className="transId">{networkError || "Network Connection Error, please change network or try again later"}</p>
          <div className="footerbuttons">
            <ButtonComp text={"Retry"} onClick={handleRetry} />
          </div>
        </div>
      </div>
    </ModalCustom>
  )
}
