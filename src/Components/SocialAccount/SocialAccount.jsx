import React from "react";
import Facebook from "../../Assets/PNG/facebook.png";
import Linkdin from "../../Assets/PNG/linkdin.png";
import Instagram from "../../Assets/PNG/instagram.png";
import style from "./style.module.scss";
function SocialAccount() {
  return (
    <>
      <h1>Social Accounts</h1>
      <div className={style.social}>
        <a href="http://">
          <img src={Facebook} alt="facebook"></img>
        </a>
        <a href="http://">
          <img src={Linkdin} alt="linkdin"></img>
        </a>
        <a href="http://">
          <img src={Instagram} alt="instagram"></img>
        </a>
        <a href="http://">
          <img src={Facebook} alt="facebook"></img>
        </a>
        <a href="http://">
          <img src={Linkdin} alt="facebook"></img>
        </a>
        <a href="http://">
          <img src={Instagram} alt="facebook"></img>
        </a>
      </div>
    </>
  );
}

export default SocialAccount;
