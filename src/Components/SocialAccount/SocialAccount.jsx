import React from "react";
import style from "./style.module.scss";
import Browser from "webextension-polyfill";
import Facebook from "../../Assets/PNG/facebook.png";
import Linkdin from "../../Assets/PNG/linkdin.png";
import Instagram from "../../Assets/PNG/instagram.png";

function SocialAccount() {
  const links = {
    linkdin: "https://www.linkedin.com/company/5irechain/",
    instagram: "https://www.instagram.com/5irechain/",
    facebook: "https://www.facebook.com/5irechain/",
  }

  const handleClick = (e) => {
    const name = e.target.name;

    let url = null;
    if (links.hasOwnProperty(name)) {
      url = links[name];
    }
    Browser.tabs.create({ url: url });
  }
  return (
    <>
      <h1>Social Accounts</h1>
      <div className={style.social}>

        <img src={Facebook} alt="facebook" name="facebook" onClick={handleClick} draggable={false} />

        <img src={Linkdin} alt="linkdin" name="linkdin" onClick={handleClick} draggable={false} />

        <img src={Instagram} alt="instagram" name="instagram" onClick={handleClick} draggable={false} />

      </div>
    </>
  );
}

export default SocialAccount;
