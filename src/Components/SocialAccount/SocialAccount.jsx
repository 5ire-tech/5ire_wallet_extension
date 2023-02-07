import React from "react";
import Facebook from "../../Assets/PNG/facebook.png";
import Linkdin from "../../Assets/PNG/linkdin.png";
import Instagram from "../../Assets/PNG/instagram.png";
import style from "./style.module.scss";
import Browser from "webextension-polyfill";

function SocialAccount() {
  function handleClick(url="http://google.com"){
Browser.tabs.create({url})
  }
  return (
    <>
      <h1>Social Accounts</h1>
      <div className={style.social}>
        <p onClick={()=>handleClick()}>
          <img src={Facebook} alt="facebook"></img>
        </p>
        <p onClick={()=>handleClick()}>
          <img src={Linkdin} alt="linkdin"></img>
        </p>
        <p onClick={()=>handleClick()}>
          <img src={Instagram} alt="instagram"></img>
        </p>
        <p onClick={()=>handleClick()}>
          <img src={Facebook} alt="facebook"></img>
        </p>
        <p onClick={()=>handleClick()}>
          <img src={Linkdin} alt="facebook"></img>
        </p>
        <p onClick={()=>handleClick()}>
          <img src={Instagram} alt="facebook"></img>
        </p>
      </div>
    </>
  );
}

export default SocialAccount;
