import React from "react";
import style from "./style.module.scss";
import Congratulation from "../../Assets/CongratulationsImg.svg";
// import { Player } from "@lottiefiles/react-lottie-player";
// import JsonData from "../../Assets/JsonFiles";

function CongratulationsScreen({ children, text }) {
  return (
    <div className={style.setPassword__secretPharse}>
      <div className={`${style.cardWhite__beginText} ${style.congratScreen}`}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {/* <Player
            autoplay={true}
            loop={true}
            controls={true}
            src={JsonData}
            style={{ height: "190px", width: "190px" }}
          /> */}
          <img src={Congratulation} />
        </div>
        <h1>Congratulations!</h1>
        <p>{text}</p>
        {children}
      </div>
    </div>
  );
}

export default CongratulationsScreen;
