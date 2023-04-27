import React from "react";
import style from "./style.module.scss";
import { Player } from "@lottiefiles/react-lottie-player";
import JsonData from "../../Assets/JsonFiles"

function CongratulationsScreen({ children, text}) {
  return (
    <div className={style.setPassword__secretPharse}>
      <div className={`${style.cardWhite__beginText} ${style.congratScreen}`}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Player
            autoplay={true}
            loop={true}
            controls={true}
            src={JsonData}
            //src={"https://assets3.lottiefiles.com/packages/lf20_4chtroo0.json"}
            style={{ height: "190px", width: "190px" }}
          >            
          </Player>
        </div>
        <h1>Congratulations!</h1>
        <p>{text}</p>
        {children}
      </div>
    </div>
  );
}

export default CongratulationsScreen;
