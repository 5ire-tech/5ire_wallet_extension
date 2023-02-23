import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import style from "./style.module.scss";

function LoginApprove() {
  const data = useSelector((state) => state.auth.uiData);

  return (
    <div className={style.cardWhite}>
      <MenuRestofHeaders logosilver={true} title="5irechain Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__innercontact}>
          <h1>Login Request</h1>
        </div>
        <div className={style.cardWhite__cardInner__siteUrl}>
          <h4>Site URL</h4>
          <Link>{data?.message?.origin} </Link>
        </div>
        <div className={style.cardWhite__cardInner__innercontact}>
          <h1>Allow Access</h1>
          <span>Allow this site to login with your 5irechain wallet?</span>
        </div>
      </div>
    </div>
  );
}

export default LoginApprove;
