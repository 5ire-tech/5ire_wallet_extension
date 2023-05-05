import { Spin } from "antd";
import { Player } from "@lottiefiles/react-lottie-player";
import JsonData from "../../Assets/JsonFiles/loader"
export default function Loader() {
    return (
      <div className="loader">
        {/* <Spin size="large" /> */}
        {/* <img src="../../Assets/Video/loader.gif" alt="gif"/> */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Player
            autoplay={true}
            loop={true}
            controls={true}
            src={JsonData}
            style={{ height: "190px", width: "190px" }}
          >            
          </Player>
        </div>
      </div>
    );
}
