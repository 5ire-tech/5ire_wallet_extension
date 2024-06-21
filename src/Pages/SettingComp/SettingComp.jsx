import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import Wallet from "../../Assets/WalletIcon.svg";
import PrivacyPo from "../../Assets/PrivacyPo.svg";
import BackArrow from "../../Assets/arrowright.svg";
import SocialAccount from "../../Components/SocialAccount/SocialAccount";

function SettingComp() {
  return (
    <div className={style.settingComp}>
      <div className={style.settingComp__settingSec}>
        <Link to={ROUTES.MANAGE_WALLET} draggable={false}>
          <div className={style.sttings}>
            <div className={style.sttings__left}>
              <div className={style.walletIconBorder}>
                <img draggable={false} src={Wallet} width={30} height={30} alt="walletIcon" />
              </div>
              <div className={style.sttings__left__texts}>
                <div className={style.sttings__left__textsTop}>Manage Wallet</div>
              </div>
            </div>

            <div className={style.sttings__right}>
              <img src={BackArrow} width={8} height={15} alt="backArrow" draggable={false} />
            </div>
          </div>
        </Link>
        <Link draggable={false}>
          <div
            className={style.sttings}
            style={{ marginTop: "14px" }}
            // onClick={() => openBrowserTab(SOCIAL_LINKS.POLICY)}
          >
            <div className={style.sttings__left}>
              <div className={style.walletIconBorder}>
                <img draggable={false} src={PrivacyPo} width={30} height={30} alt="walletIcon" />
              </div>
              <div className={style.sttings__left__texts}>
                <div className={style.sttings__left__textsTop}>Privacy Policy</div>
              </div>
            </div>

            <div className={style.sttings__right}>
              <img src={BackArrow} width={8} height={15} alt="backArrow" draggable={false} />
            </div>
          </div>
        </Link>
      </div>
      <SocialAccount />
    </div>
  );
}

export default SettingComp;
