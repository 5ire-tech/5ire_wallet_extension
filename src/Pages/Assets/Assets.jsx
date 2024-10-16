import "./Assets.scss";
import toast from "react-hot-toast";
import { AuthContext } from "../../Store";
import ThreeDot from "../../Assets/dot3.svg";
import style from "../MyAccount/style.module.scss";
import { notification, Dropdown, Space } from "antd";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import { ExtensionStorageHandler } from "../../Storage/loadstore";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import { formatBalance, nameWithEllipsis, validateAddress } from "../../Utility/utility";
import React, { useContext, useEffect, useState, useCallback } from "react";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import {
  ERROR_MESSAGES,
  MESSAGE_EVENT_LABELS,
  MESSAGE_TYPE_LABELS,
  STATE_CHANGE_ACTIONS
} from "../../Constants";

function Assets() {
  const [isImportModal, setImportModal] = useState(false);
  const [isRemoveModal, setRemoveModal] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [showRestInputs, setShowRestInputs] = useState(false);
  const [addressToRemove, setAddressToRemove] = useState(null);
  const {
    state,
    tokenErr,
    tokenDetails,
    showSuccessModal,
    setTokenErr,
    selectedToken,
    setTokenDetails,
    setSelectedToken
  } = useContext(AuthContext);
  const { currentNetwork, currentAccount, tokens } = state;
  const tokensByAddress = tokens[currentAccount?.evmAddress];
  const tokensToShow = tokensByAddress[currentNetwork?.toLowerCase()] ?? [];

  useEffect(() => {
    if (showSuccessModal) {
      setImportModal(!showSuccessModal);
    }
  }, [showSuccessModal]);

  useEffect(() => {
    if (tokenErr) {
      setShowRestInputs(false);
    } else if (!tokenErr && tokenDetails.decimals) {
      setShowRestInputs(true);
    }
  }, [tokenErr, tokenDetails?.decimals]);

  const handleInput = async (event) => {
    const value = event.target.value;
    setContractAddress(value);
    if (value.length === 42) {
      const res = await validateAddress(value);
      if (res.error) {
        setTokenErr(res.data);
        setShowRestInputs(false);
      } else {
        const result = tokensToShow.find((item) => item?.address === value);
        if (result) {
          setTokenErr(ERROR_MESSAGES.TOKEN_ALREDY);
        } else {
          sendRuntimeMessage(MESSAGE_TYPE_LABELS.CONTRACT, MESSAGE_EVENT_LABELS.TOKEN_INFO, {
            address: value ?? ""
          });
          setTokenErr("");
        }
      }
    } else {
      setTokenErr(ERROR_MESSAGES.INCORRECT_ADDRESS);
      setShowRestInputs(false);
    }
  };

  const showModal = () => {
    setImportModal(true);
  };

  const handleModalOpen = (address) => {
    if (address) {
      setAddressToRemove(address);
      setRemoveModal(true);
    }
  };

  const closeRemoveModal = useCallback(() => {
    setRemoveModal(false);
  }, []);

  const closeImportModal = () => {
    setTokenDetails({
      name: "",
      symbol: "",
      decimals: ""
    });
    setImportModal(false);
    setTokenErr("");
    setContractAddress("");
    setShowRestInputs(false);
  };

  const handleClick = () => {
    openNotification("bottom");
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.CONTRACT, MESSAGE_EVENT_LABELS.IMPORT_TOKEN, {
      address: contractAddress,
      decimals: tokenDetails.decimals,
      symbol: tokenDetails.symbol,
      name: tokenDetails.name
    });
    closeImportModal();
  };

  const openNotification = (placement) => {
    notification.info({
      message: `Token Succesfully Imported`,
      description: `You have successfully imported ${
        nameWithEllipsis(tokenDetails?.name) || "asset"
      }`,
      // icon: null,
      placement
    });
  };

  const handleRemoveToken = async () => {
    if (!addressToRemove) {
      toast.error(ERROR_MESSAGES.UNABLE_TO_REMOVE_ACC);
    } else {
      await ExtensionStorageHandler.updateStorage(
        STATE_CHANGE_ACTIONS.REMOVE_TOKEN,
        { address: addressToRemove, currentNetwork: currentNetwork.toLowerCase() },
        {}
      );
      if (selectedToken.address === addressToRemove) {
        setSelectedToken({
          address: "",
          symbol: "",
          decimals: 0,
          name: ""
        });
      }
      setAddressToRemove(null);
    }
    closeRemoveModal();
  };

  return (
    <div className="assetSec">
      <div className="topDetail">
        <h3>Assets</h3>
        <button onClick={showModal}>Import Tokens</button>
      </div>

      <ModalCustom
        isModalOpen={isImportModal}
        handleOk={closeImportModal}
        handleCancel={closeImportModal}
        centered
        closeIcon={false}>
        <div className="customModel">
          <center>
            <h3>Import Custom Token</h3>
            <div className="innerContct">
              <p>Enter Token Contract Address</p>
              <InputFieldOnly
                coloredBg={true}
                value={contractAddress}
                placeholderBaseColor={true}
                placeholder={"Address"}
                onChange={handleInput}
              />
              <p style={{ color: "red", textAlign: "left", fontSize: "12px" }}>{tokenErr}</p>
            </div>

            {showRestInputs && (
              <>
                <div className="innerContct">
                  <p>Token Symbol</p>
                  <InputFieldOnly
                    disabled={true}
                    value={tokenDetails?.symbol}
                    coloredBg={true}
                    placeholderBaseColor={true}
                    placeholder={"Token Symbol"}
                  />
                </div>
                <div className="innerContct">
                  <p>Token Decimals</p>
                  <InputFieldOnly
                    disabled={true}
                    coloredBg={true}
                    value={tokenDetails?.decimals}
                    placeholderBaseColor={true}
                    placeholder={"Token Decimals"}
                  />
                </div>

                <div style={{ marginTop: "15px" }}>
                  <ButtonComp text={"Done"} onClick={handleClick} />
                </div>
              </>
            )}
          </center>
        </div>
      </ModalCustom>

      <div className="assetSecScrool">
        {tokensToShow?.length
          ? tokensToShow?.map((e, i) => {
              return (
                <div className="assetSec__accountActive" key={i + e?.name}>
                  <div className="assetSec_inner">
                    <div className="assetSec__leftSec">
                      <h6 className="imgWord">{e?.name ? e?.name[0].toUpperCase() : "T"}</h6>
                      <div className="assetSec__leftSec__accountConatct">
                        <h2>{e?.name}</h2>
                        <h3>{e?.symbol}</h3>
                      </div>
                    </div>
                    <div className="assetSec__rytSec">
                      <p>
                        {" "}
                        {formatBalance(
                          e?.balance ? Number(e.balance) / 10 ** Number(e.decimals) : 0
                        )}
                      </p>
                      {/* <h5>$2820.54</h5> */}
                      {/* <h3>1.13 WETH</h3> */}
                    </div>
                  </div>
                  <Dropdown
                    placement="bottomRight"
                    arrow={{ pointAtCenter: true }}
                    menu={{
                      items: [
                        {
                          key: i,
                          label: <span onClick={() => handleModalOpen(e.address)}>Remove</span>
                        }
                      ]
                    }}
                    trigger={["hover"]}>
                    <div style={{ cursor: "pointer" }} onClick={(e) => e.preventDefault()}>
                      <Space>
                        <img src={ThreeDot} alt="3dots" />
                      </Space>
                    </div>
                  </Dropdown>
                </div>
              );
            })
          : ""}
      </div>
      <ModalCustom
        isModalOpen={isRemoveModal}
        handleOk={closeRemoveModal}
        handleCancel={closeRemoveModal}
        centered
        closeIcon={false}>
        <div className={`${style.activeDis_Modal} yesnoPopup`}>
          <center>
            <h3 style={{ color: "white" }}>Are you sure, you want to remove this token ?</h3>
            <div className="innerContct">
              <button onClick={handleRemoveToken} className="btnYesNo">
                Yes
              </button>

              <button onClick={closeRemoveModal} className="btnYesNo">
                No
              </button>
            </div>
          </center>
        </div>
      </ModalCustom>
    </div>
  );
}

export default Assets;
