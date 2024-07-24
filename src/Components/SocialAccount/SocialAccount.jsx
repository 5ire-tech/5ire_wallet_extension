import React from "react";
import style from "./style.module.scss";
import { SOCIAL_LINKS } from "../../Constants";
import Linkdin from "../../Assets/LinkedIn.svg";
import { openBrowserTab } from "../../Helper/helper";
import Facebook from "../../Assets/facebook.svg";
import Instagram from "../../Assets/Instagram.svg";
import github from "../../Assets/github.svg";
import discord from "../../Assets/Discord.svg";

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
        <img
          src={github}
          alt="github"
          name="github"
          onClick={() => openBrowserTab(SOCIAL_LINKS.GITHUB)}
          draggable={false}
        />
        <img
          src={discord}
          alt="discord"
          name="discord"
          onClick={() => openBrowserTab(SOCIAL_LINKS.DISCORD)}
          draggable={false}
        />
      </div>
    </>
  );
}

export default SocialAccount;
