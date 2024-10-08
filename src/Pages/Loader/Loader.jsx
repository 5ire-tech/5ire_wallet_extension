import { Player } from "@lottiefiles/react-lottie-player";
import JsonData from "../../Assets/JsonFiles/loader";

export default function Loader() {
  return (
    <div className="loader">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Player
          autoplay={true}
          loop={true}
          controls={true}
          src={JsonData}
          style={{ height: "130px", width: "130px" }}></Player>
      </div>
    </div>
  );
}
