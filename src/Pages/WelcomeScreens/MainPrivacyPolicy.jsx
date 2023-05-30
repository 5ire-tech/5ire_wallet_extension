import React from "react";
import style from "./style.module.scss";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import { ROUTES } from "../../Routes";

function MainPrivacyPolicy() {
  return (
    <div className={style.cardWhite}>
      <MenuRestofHeaders
        backTo={ROUTES.BEFORE_BEGIN}
        logosilver={true}
        title="5ire Wallet"
      />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__innercontact}>
          <h1>Privacy Policy</h1>
        </div>
        <div className={style.cardWhite__importWalletlinkOuter}>
          <p className={style.privacyPolicyText}>
            There are many variations of passages of Lorem Ipsum available, but
            the majority have suffered alteration in some form, by injected
            humour, or randomised words which don't look even slightly
            believable. If you are going to use a passage of Lorem Ipsum, you
            need to be sure there isn't anything embarrassing hidden in the
            middle of text. There are many variations of passages of Lorem Ipsum
            available, but the majority have suffered alteration in some form,
            by injected humour, or randomised words which don't look even
            slightly believable. If you are going to use a passage of Lorem
            Ipsum, you need to be sure there isn't anything embarrassing hidden
            in the middle of text. If you are going to use a passage of Lorem
            Ipsum, you need to be sure there isn't anything embarrassing hidden
            in the middle
          </p>
        </div>
      </div>
    </div>
  );
}

export default MainPrivacyPolicy;
