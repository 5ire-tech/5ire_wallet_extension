import React, { useContext, useState } from "react";
import Swap from "../../Assets/swap.svg";
import Sent from "../../Assets/sent.svg";
import HistoryItem from "./HistoryItem";
import style from "./style.module.scss";
import { Drawer } from "antd";
import { arrayReverser } from "../../Utility/utility";
import ModalCloseIcon from "../../Assets/ModalCloseIcon.svg";
import { AuthContext } from "../../Store";
import TransectionHistry from "../../Components/TransectionHistry/TransectionHistry";
import { formatDate, shortner } from "../../Helper/helper";
import { CURRENCY, EMTY_STR,  TX_TYPE } from "../../Constants/index";
import {log, hasProperty} from "../../Utility/utility"

function History() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { state } = useContext(AuthContext);
  const {  currentNetwork, txHistory, currentAccount, allAccounts } = state;

  const onClose1 = () => {
    setOpen1(false);
  };

  const onClose2 = () => {
    setOpen2(false);
  };

  const handleHistoryOpen = (data) => {
    if (txHistory.hasOwnProperty(currentAccount.accountName)) {
      setSelectedTransaction(data);
      setOpen1(true);
    }
  }

  return (
    <div className={style.historySec}>
      <div className={style.historySec__historyHead}>
        <h3>Transaction History</h3>
    </div>

        {
          (txHistory[currentAccount?.accountName] && txHistory[currentAccount?.accountName].length > 0) ?
            (
              arrayReverser(txHistory[currentAccount?.accountName].filter((tx => tx?.chain.toLowerCase() === currentNetwork.toLowerCase()))).map((data, index) => (
                <HistoryItem historyItem={data} handleHistoryOpen={handleHistoryOpen} key={CURRENCY + index} index={index} />
              ))
            ) : (<h4 className={style.noTxn}>No Transaction Found!</h4>)
        }

      <Drawer
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {selectedTransaction ? selectedTransaction.type: ""}
          </span>
        }
        placement="bottom"
        onClose={onClose1}
        open={open1}
        closeIcon={<img src={ModalCloseIcon} alt="close" draggable={false} />}
       >
            <TransectionHistry selectedTransaction={selectedTransaction} account={allAccounts[currentAccount.index]} />
      </Drawer>
    </div>
  );
}

export default History;
