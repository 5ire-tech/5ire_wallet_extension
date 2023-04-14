import React from "react";
import Facebook from "../../Assets/PNG/facebook.png";
import Linkdin from "../../Assets/PNG/linkdin.png";
import Instagram from "../../Assets/PNG/instagram.png";
import style from "./style.module.scss";
import Browser from "webextension-polyfill";

function SocialAccount() {
  const links = {
    linkdin : "https://www.linkedin.com/company/5irechain/",
    instagram : "https://www.instagram.com/5irechain/",
    facebook : "https://www.facebook.com/5irechain/",
    // twitter: "https://twitter.com/5ireChain?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor",
    // website: "https://www.5ire.org/",
    // telegram: "https://telegram.me/OfficialFireChain",
    // github: "https://github.com/5ire-org",
    // discord: "https://discord.com/invite/5ire",
  }

  const handleClick = (e) => {
    const name = e.target.name;

    let url = null;
    if (links.hasOwnProperty(name)) {
      url = links[name];
    }
    Browser.tabs.create({ url: url});
  }
  return (
    <>
      <h1>Social Accounts</h1>
      <div className={style.social}>

        <img src={Facebook} alt="facebook" name="facebook" onClick={handleClick} draggable={false}/>

        <img src={Linkdin} alt="linkdin" name="linkdin" onClick={handleClick} draggable={false}/>

        <img src={Instagram} alt="instagram" name="instagram" onClick={handleClick} draggable={false}/>

        {/* <img src={Facebook} alt="website" name="website" onClick={handleClick} /> */}

        {/* <img src={Instagram} alt="twitter" name="twitter" onClick={handleClick} /> */}

        {/* <img src={Facebook} alt="telegram" name="telegram" onClick={handleClick} /> */}

        {/* <img src={Linkdin} alt="github" name="github" onClick={handleClick} /> */}

        {/* <img src={Instagram} alt="discord" name="discord" onClick={handleClick} /> */}
        

      </div>
    </>
  );
}

export default SocialAccount;
