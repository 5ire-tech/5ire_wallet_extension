import React from "react";
import style from "./style.module.scss";
import PlaceLogo from "../../Assets/PlaceLog.svg";
import { Link } from "react-router-dom";
// import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";

function WelcomeScreen() {
  return (
    <div className={`${style.cardWhite} ${style.cardWhiteCenterd}`}>
      {/* <MenuRestofHeaders logosilver={true} title="5ire Non-Custodial Wallet" /> */}
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__centerLogo}>
          <div className={style.cardWhite__cardInner__innerLogocontact}>
            <img src={PlaceLogo} alt="placeLogo" draggable={false}/>
            <div className={style.cardWhite__cardInner__innercontact}>
              <h1>5irechain Wallet</h1>
              {/* <p>The Decentralized Wallet</p> */}
            </div>
          </div>
        </div>
        <div className={style.cardWhite__linkOuter}>
          <Link to="/createNewWallet" className="bluegradient">
            Create A New Wallet
          </Link>
          <Link className="grayBtn" to="/importWallet">
            Import Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
