import "./Assets.scss";
import { notification } from "antd";
import { AuthContext } from "../../Store";
import React, { useContext, useEffect, useState } from "react";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import { formatBalance, validateAddress } from "../../Utility/utility";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import { ERROR_MESSAGES, MESSAGE_EVENT_LABELS, MESSAGE_TYPE_LABELS } from "../../Constants";

function Assets() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [showRestInputs, setShowRestInputs] = useState(false);
  const { state, tokenErr, tokenDetails, showSuccessModal, setTokenErr, setTokenDetails } =
    useContext(AuthContext);
  const { currentNetwork, currentAccount, tokens } = state;
  const tokensByAddress = tokens[currentAccount?.evmAddress];
  const tokensToShow = tokensByAddress[currentNetwork?.toLowerCase()] ?? [];

  useEffect(() => {
    if (showSuccessModal) {
      setIsModalOpen(!showSuccessModal);
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
    setIsModalOpen(true);
  };

  const handle_OK_Cancel = () => {
    setTokenDetails({
      name: "",
      symbol: "",
      decimals: ""
    });
    setIsModalOpen(false);
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
    handle_OK_Cancel();
  };

  const openNotification = (placement) => {
    notification.info({
      message: `Token Succesfully Imported`,
      description: "You have successfully imported USDT.",
      // icon: null,
      placement
    });
  };
  return (
    <div className="assetSec">
      <div className="topDetail">
        <h3>Assets</h3>
        <button onClick={showModal}>Import Tokens</button>
      </div>

      <ModalCustom
        isModalOpen={isModalOpen}
        handleOk={handle_OK_Cancel}
        handleCancel={handle_OK_Cancel}
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
                      {formatBalance(e?.balance ? Number(e.balance) / 10 ** Number(e.decimals) : 0)}
                    </p>
                    {/* <h5>$2820.54</h5> */}
                    {/* <h3>1.13 WETH</h3> */}
                  </div>
                </div>
              );
            })
          : ""}
      </div>
    </div>
  );
}

export default Assets;
