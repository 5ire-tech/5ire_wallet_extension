import { Drawer } from "antd";
import HistoryItem from "./HistoryItem";
import style from "./style.module.scss";
import { AuthContext } from "../../Store";
import { CURRENCY } from "../../Constants/index";
import { arrayReverser } from "../../Utility/utility";
import noTransaction from "../../Assets/NoTransaction.svg";
import ModalCloseIcon from "../../Assets/ModalCloseIcon.svg";
import React, { useContext, useState, useCallback, useEffect, useMemo } from "react";
import TransectionHistry from "../../Components/TransectionHistry/TransectionHistry";

function History() {
  const [open1, setOpen1] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [recentlyUsedAddresses, setRecentlyUsedAddresses] = useState([]);
  const { state } = useContext(AuthContext);
  const { currentNetwork, txHistory, currentAccount } = state;

  const onClose1 = () => {
    setOpen1(false);
  };

  const handleHistoryOpen = useCallback(
    (data) => {
      if (txHistory.hasOwnProperty(currentAccount.evmAddress)) {
        setSelectedTransaction(data);
        setOpen1(true);
      }
    },
    [currentAccount.evmAddress, txHistory]
  );

  const filteredTxHistory = useMemo(
    () =>
      arrayReverser(
        txHistory[currentAccount?.evmAddress].filter(
          (tx) => tx?.chain.toLowerCase() === currentNetwork.toLowerCase()
        )
      ),
    [txHistory, currentAccount?.evmAddress, currentNetwork]
  );

  useEffect(() => {
    const uniqueAddressesObj = {};
    const uniqueRecentlyUsedAdresses = [];

    filteredTxHistory.forEach((tx) => {
      if (!uniqueAddressesObj[tx?.to]) {
        uniqueAddressesObj[tx?.to] = true;
        uniqueRecentlyUsedAdresses.push(tx?.to);
      }
    });

    setRecentlyUsedAddresses(uniqueRecentlyUsedAdresses.slice(0, 10));
  }, [txHistory, currentAccount?.evmAddress, filteredTxHistory]);

  console.log("state", recentlyUsedAddresses);

  return (
    <div className={style.historySec}>
      <div className={style.historySec__historyHead}>
        <h3>Transaction History</h3>
      </div>
      <div className={style.histryDataScrol}>
        {txHistory[currentAccount?.evmAddress] &&
        txHistory[currentAccount?.evmAddress].length > 0 ? (
          filteredTxHistory.map((data, index) => (
            <HistoryItem
              historyItem={data}
              handleHistoryOpen={handleHistoryOpen}
              key={CURRENCY + data?.timeStamp}
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
          <img src={ModalCloseIcon} alt="close" draggable={false} className="closeModalIcon" />
        }>
        <TransectionHistry selectedTransaction={selectedTransaction} account={currentAccount} />
      </Drawer>
    </div>
  );
}

export default History;
