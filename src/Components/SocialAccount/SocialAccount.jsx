import React from "react";
import style from "./style.module.scss";
import { SOCIAL_LINKS } from "../../Constants";
import Linkdin from "../../Assets/PNG/linkdin.png";
import { openBrowserTab } from "../../Helper/helper";
import Facebook from "../../Assets/PNG/facebook.png";
import Instagram from "../../Assets/PNG/instagram.png";

function SocialAccount() {
  return (
    <>
      <h1>Social Accounts</h1>
      <div className={style.social}>
        <img
          src={Facebook}
          alt="facebook"
          name="facebook"
          onClick={() => openBrowserTab(SOCIAL_LINKS.FACEBOOK)}
          draggable={false}
        />

        <img
          src={Linkdin}
          alt="linkdin"
          name="linkdin"
          onClick={() => openBrowserTab(SOCIAL_LINKS.LINKDIN)}
          draggable={false}
        />

        <img
          src={Instagram}
          alt="instagram"
          name="instagram"
          onClick={() => openBrowserTab(SOCIAL_LINKS.INSTAGRAM)}
          draggable={false}
        />
      </div>
    </>
  );
}

export default SocialAccount;
