import { Drawer } from "antd";
import HistoryItem from "./HistoryItem";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { CURRENCY } from "../../Constants/index";
import React, { useContext, useState } from "react";
import { arrayReverser } from "../../Utility/utility";
import ModalCloseIcon from "../../Assets/ModalCloseIcon.svg";
import TransectionHistry from "../../Components/TransectionHistry/TransectionHistry";
import noTransaction from "../../Assets/NoTransaction.svg";

function History() {
  const [open1, setOpen1] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { state } = useContext(AuthContext);
  const { currentNetwork, txHistory, currentAccount } = state;

  const onClose1 = () => {
    setOpen1(false);
  };


  const handleHistoryOpen = (data) => {
    if (txHistory.hasOwnProperty(currentAccount.evmAddress)) {
      setSelectedTransaction(data);
      setOpen1(true);
    }
  };

  return (
    <div className={style.historySec}>
      <div className={style.historySec__historyHead}>
        <h3>Transaction History</h3>
      </div>
      <div className={style.histryDataScrol}>
        {txHistory[currentAccount?.evmAddress] &&
          txHistory[currentAccount?.evmAddress].length > 0 ? (
          arrayReverser(
            txHistory[currentAccount?.evmAddress].filter(
              (tx) => tx?.chain.toLowerCase() === currentNetwork.toLowerCase()
            )
          ).map((data, index) => (
            <HistoryItem
              historyItem={data}
              handleHistoryOpen={handleHistoryOpen}
              key={CURRENCY + index}
              index={index}
            />
          ))
        ) : (
          <div className={style.noTransaction}>
            {" "}
            <img src={noTransaction} draggable={false} alt="No transaction" />
            <h4 className={style.noTxn}>No Transaction Found!</h4>
          </div>
        )}
      </div>
      <Drawer
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {selectedTransaction ? selectedTransaction.type : ""}
          </span>
        }
        placement="bottom"
        onClose={onClose1}
        open={open1}
        closeIcon={
          <img
            src={ModalCloseIcon}
            alt="close"
            draggable={false}
            className="closeModalIcon"
          />
        }
      >
        <TransectionHistry
          selectedTransaction={selectedTransaction}
          account={currentAccount}
        />
      </Drawer>
    </div>
  );
}

export default History;
