import React, { useContext, useState } from "react";
import Swap from "../../Assets/swap.svg";
import style from "./style.module.scss";
import Received from "../../Assets/Received.svg";
import Sent from "../../Assets/sent.svg";
import { Drawer } from "antd";
import { arrayReverser } from "../../Utility/utility";
import ModalCloseIcon from "../../Assets/ModalCloseIcon.svg";
import { AuthContext } from "../../Store";
import TransectionHistry from "../../Components/TransectionHistry/TransectionHistry";
import { formatDate, shortner } from "../../Helper/helper";
import { EMTY_STR,  TX_TYPE } from "../../Constants/index";
function History() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [accData, setAccData] = useState([]);
  const [history, setHistory] = useState([]);
  const { state, updateState } = useContext(AuthContext);
  const {  currentNetwork, txHistory } = state;

  const onClose1 = () => {
    setOpen1(false);
  };
  const onClose2 = () => {
    setOpen2(false);
  };
  const handleHistoryOpen = () => {
    if (txHistory.hasOwnProperty(accData.accountName)) {
      let txData = txHistory[accData.accountName].filter((tx => tx?.chain.toLowerCase() === currentNetwork.toLowerCase()));
      setHistory(arrayReverser(txData));
    }
    setOpen1(true);
  }
  return (
    <div className={style.historySec}>
      <div className={style.historySec__historyHead}>
        <h3>Transaction History</h3>
      </div>
      <div className={style.historySec__historyTimeDate}>
        <p>Aug 24 2022 | 11:30 AM</p>
      </div>
      <div className={style.historySec__historyMarketSwap}>
        <div className={style.historySec__historyMarketSwap__leftSide}>
          <img src={Swap} />
          <div className={style.historySec__historyMarketSwap__leftContact} onClick={handleHistoryOpen}>
            <h3>Swap</h3>
            <p>Native to EVM</p>
          </div>
        </div>
        <div className={style.historySec__historyMarketSwap__rytSide}>
          <h3>50 5ire</h3>
          <p>
            Status : <span className={style.historySec__pending}>Pending</span>
          </p>
        </div>
      </div>
      <div className={style.historySec__historyTimeDate}>
        <p>Aug 24 2022 | 11:30 AM</p>
      </div>
      <div className={style.historySec__historyMarketSwap}>
        <div className={style.historySec__historyMarketSwap__leftSide}>
          <img src={Sent} />
          <div className={style.historySec__historyMarketSwap__leftContact}>
            <h3>Sent</h3>
            <p>To : 326xxxSFFss....990</p>
          </div>
        </div>
        <div className={style.historySec__historyMarketSwap__rytSide}>
          <h3>50 5ire</h3>
          <p>
            Status : <span className={style.historySec__success}>Success</span>
          </p>
        </div>
      </div>
      <div className={style.historySec__historyTimeDate}>
        <p>Aug 24 2022 | 11:30 AM</p>
      </div>
      <div className={style.historySec__historyMarketSwap}>
        <div className={style.historySec__historyMarketSwap__leftSide}>
          <img src={Received} />
          <div className={style.historySec__historyMarketSwap__leftContact}>
            <h3>Received</h3>
            <p>From : 326xxxSFFss....990</p>
          </div>
        </div>
        <div className={style.historySec__historyMarketSwap__rytSide}>
          <h3>50 5ire</h3>
          <p>
            Status : <span className={style.historySec__success}>Success</span>
          </p>
        </div>
      </div>
      <div className={style.historySec__historyTimeDate}>
        <p>Aug 24 2022 | 11:30 AM</p>
      </div>
      <div className={style.historySec__historyMarketSwap}>
        <div className={style.historySec__historyMarketSwap__leftSide}>
          <img src={Sent} />
          <div className={style.historySec__historyMarketSwap__leftContact}>
            <h3>Sent</h3>
            <p>To : 326xxxSFFss....990</p>
          </div>
        </div>
        <div className={style.historySec__historyMarketSwap__rytSide}>
          <h3>50 5ire</h3>
          <p>
            Status : <span className={style.historySec__failed}>Failed</span>
          </p>
        </div>
      </div>
      <div className={style.historySec__historyTimeDate}>
        <p>Aug 24 2022 | 11:30 AM</p>
      </div>
      <div className={style.historySec__historyMarketSwap}>
        <div className={style.historySec__historyMarketSwap__leftSide}>
          <img src={Received} />
          <div className={style.historySec__historyMarketSwap__leftContact}>
            <h3>Received</h3>
            <p>From : 326xxxSFFss....990</p>
          </div>
        </div>
        <div className={style.historySec__historyMarketSwap__rytSide}>
          <h3>50 5ire</h3>
          <p>
            Status : <span className={style.historySec__success}>Success</span>
          </p>
        </div>
      </div>

      <Drawer
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
           Swap
          </span>
        }
        placement="bottom"
        onClose={onClose1}
        open={open1}
        closeIcon={<img src={ModalCloseIcon} alt="close" draggable={false} />}
      >
        {/* {history?.length > 0 ? (
          history?.map((data, index) => ( */}
            <TransectionHistry
              // dateTime={formatDate(data.dateTime)}
              // type={data?.type}
              // txHash={data.type.toLowerCase() === TX_TYPE?.SWAP.toLowerCase() ?
              //   data.txHash.mainHash : data.txHash}
              // to={
              //   data.type.toLowerCase() === TX_TYPE?.SWAP.toLowerCase()
              //     ? data.to
              //     : `${data?.to ? `To: ` + shortner(data.to) : EMTY_STR}`
              // }
              // amount={`${data?.amount} 5ire`}
              // status={data?.status.charAt(0).toUpperCase() + data?.status.slice(1)}
              // // img={Sendhistry}
              // key={index + "5ire"}
            />
          {/* ))
        ) : (
          // <h4 className={style.noTxn}>No Transaction Found!</h4>
        )} */}
      </Drawer>
    </div>
  );
}

export default History;
