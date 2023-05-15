import React, { useContext } from 'react'
import { AuthContext } from '../../Store'
import ModalCustom from '../ModalCustom/ModalCustom';
import FaildSwap from "../../Assets/DarkLogo.svg";
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
            width={80}
            height={80}
            draggable={false}
          />
          <h3 className="title">Connection Error</h3>
          <p className="transId">{networkError}</p>
          <div className="footerbuttons">
            <ButtonComp text={"Retry"} onClick={handleRetry} />
          </div>
        </div>
      </div>
    </ModalCustom>
  )
}
