import React from "react";
import style from "./style.module.scss";
import { Player } from "@lottiefiles/react-lottie-player";

function CongratulationsScreen({ children }) {
  return (
    <div className={style.setPassword__secretPharse}>
      <div className={`${style.cardWhite__beginText} ${style.congratScreen}`}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Player
            autoplay={true}
            loop={true}
            controls={true}
            src={"https://assets3.lottiefiles.com/packages/lf20_4chtroo0.json"}
            style={{ height: "190px", width: "190px" }}
          ></Player>
        </div>
        <h1>Congratulations!</h1>
        <p>Your Wallet is Created.</p>
        {children}
      </div>
    </div>
  );
}

export default CongratulationsScreen;
