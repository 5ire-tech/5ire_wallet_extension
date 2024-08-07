import React from "react";
import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { Link } from "react-router-dom";
import PlaceLogo from "../../Assets/PlaceLog.svg";

function WelcomeScreen() {
  return (
    <div className={`${style.cardWhite} ${style.cardWhiteCenterd}`}>
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__centerLogo}>
          <div className={style.cardWhite__cardInner__innerLogocontact}>
            <img src={PlaceLogo} alt="placeLogo" draggable={false} />
            <div className={style.cardWhite__cardInner__innercontact}>
              {/* <h1>5ire Wallet</h1> */}
              <p>The Decentralized Wallet</p>
            </div>
          </div>
        </div>
        <div className={style.cardWhite__linkOuter}>
          <Link to={ROUTES.BEFORE_BEGIN} className="bluegradient">
            Create a New Wallet
          </Link>
          <Link className="grayBtn" to={ROUTES.SET_PASS + "/import"}>
            Import Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
