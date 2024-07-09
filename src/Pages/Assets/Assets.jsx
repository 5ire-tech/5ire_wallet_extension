import React, { useState } from "react";
import { WhiteLogo } from "../../Assets/StoreAsset/StoreAsset";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import ModalCustom from "../../Components/ModalCustom/ModalCustom";
import "./Assets.scss";

function Assets() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handle_OK_Cancel = () => {
    setIsModalOpen(false);
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
              />
            </div>
            <div className="innerContct">
              <p>Token Symbol</p>
              <InputFieldOnly
                coloredBg={true}
                placeholderBaseColor={true}
                placeholder={"Token Symbol"}
              />
            </div>
            <div className="innerContct">
              <p>Token Decimals</p>
              <InputFieldOnly
                coloredBg={true}
                placeholderBaseColor={true}
                placeholder={"Token Decimals"}
              />
            </div>
            <div style={{ marginTop: "15px" }}>
              <ButtonComp text={"Done"} />
            </div>
          </center>
        </div>
      </ModalCustom>

      <div className="assetSecScrool">
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
      </div>
    </div>
  );
}

export default Assets;
