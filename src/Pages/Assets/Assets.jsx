import "./Assets.scss";
import { AuthContext } from "../../Store";
import { validateAddress } from "../../Utility/utility";
import React, { useContext, useEffect, useState } from "react";
import { WhiteLogo } from "../../Assets/StoreAsset/StoreAsset";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { sendRuntimeMessage } from "../../Utility/message_helper";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import { ERROR_MESSAGES, MESSAGE_EVENT_LABELS, MESSAGE_TYPE_LABELS } from "../../Constants";

function Assets() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [showRestInputs, setShowRestInputs] = useState(false);
  const [error, setError] = useState({
    address: ""
  });
  const { state, tokenErr, tokenDetails, showSuccessModal } = useContext(AuthContext);
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
      console.log("tokenErr : ", tokenErr);
      setShowRestInputs(false);
      setError({ ...error, address: tokenErr });
    } else if (!tokenErr && tokenDetails.symbol) {
      setShowRestInputs(true);
    }
  }, [tokenErr, tokenDetails?.symbol]);

  const handleInput = async (event) => {
    const value = event.target.value;
    setContractAddress(value);
    if (value.length === 42) {
      const res = await validateAddress(value);
      if (res.error) {
        setError({
          ...error,
          address: res.data
        });
        setShowRestInputs(false);
      } else {
        const result = tokensToShow.find((item) => item?.address === value);
        if (result) {
          setError({
            ...error,
            address: "Token already exists"
          });
        } else {
          sendRuntimeMessage(MESSAGE_TYPE_LABELS.CONTRACT, MESSAGE_EVENT_LABELS.TOKEN_INFO, {
            address: value ?? ""
          });
          setError({
            ...error,
            address: ""
          });
        }
      }
    } else {
      setError({
        ...error,
        address: ERROR_MESSAGES.INCORRECT_ADDRESS
      });
      setShowRestInputs(false);
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handle_OK_Cancel = () => {
    setIsModalOpen(false);
  };

  const handleClick = () => {
    sendRuntimeMessage(MESSAGE_TYPE_LABELS.CONTRACT, MESSAGE_EVENT_LABELS.IMPORT_TOKEN, {
      address: contractAddress,
      decimals: tokenDetails.decimals,
      symbol: tokenDetails.symbol,
      name: tokenDetails.name
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
        handleOk={handleOk}
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
                placeholderBaseColor={true}
                placeholder={"Address"}
                onChange={handleInput}
              />
              <p style={{ color: "red" }}>{error.address}</p>
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
                    <WhiteLogo />
                    <div className="assetSec__leftSec__accountConatct">
                      <h2>{e?.name}</h2>
                      <p>{e?.balance}</p>
                    </div>
                  </div>
                  <div className="assetSec__rytSec">
                    <h5>$2820.54</h5>
                    <h3>1.13 WETH</h3>
                  </div>
                </div>
              );
            })
          : ""}
        {/* <div className="assetSec__accountActive">
          <div className="assetSec__leftSec">
            <WhiteLogo />
            <div className="assetSec__leftSec__accountConatct">
              <h2>Wrapped Ethereum</h2>
              <p>$2600</p>
            </div>
          </div>
          <div className="assetSec__rytSec">
            <h5>$2820.54</h5>
            <h3>1.13 WETH</h3>
          </div>
        </div>
        <div className="assetSec__accountActive">
          <div className="assetSec__leftSec">
            <WhiteLogo />
            <div className="assetSec__leftSec__accountConatct">
              <h2>Dogecoin</h2>
              <p>$2600</p>
            </div>
          </div>
          <div className="assetSec__rytSec">
            <h5>$2820.54</h5>
            <h3>1.13 WETH</h3>
          </div>
        </div>
        <div className="assetSec__accountActive">
          <div className="assetSec__leftSec">
            <WhiteLogo />
            <div className="assetSec__leftSec__accountConatct">
              <h2>Wrapped Ethereum</h2>
              <p>$2600</p>
            </div>
          </div>
          <div className="assetSec__rytSec">
            <h5>$2820.54</h5>
            <h3>1.13 WETH</h3>
          </div>
        </div>
        <div className="assetSec__accountActive">
          <div className="assetSec__leftSec">
            <WhiteLogo />
            <div className="assetSec__leftSec__accountConatct">
              <h2>Dogecoin</h2>
              <p>$2600</p>
            </div>
          </div>
          <div className="assetSec__rytSec">
            <h5>$2820.54</h5>
            <h3>1.13 WETH</h3>
          </div>
        </div>
        <div className="assetSec__accountActive">
          <div className="assetSec__leftSec">
            <WhiteLogo />
            <div className="assetSec__leftSec__accountConatct">
              <h2>Wrapped Ethereum</h2>
              <p>$2600</p>
            </div>
          </div>
          <div className="assetSec__rytSec">
            <h5>$2820.54</h5>
            <h3>1.13 WETH</h3>
          </div>
        </div>
        <div className="assetSec__accountActive">
          <div className="assetSec__leftSec">
            <WhiteLogo />
            <div className="assetSec__leftSec__accountConatct">
              <h2>Dogecoin</h2>
              <p>$2600</p>
            </div>
          </div>
          <div className="assetSec__rytSec">
            <h5>$2820.54</h5>
            <h3>1.13 WETH</h3>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default Assets;
