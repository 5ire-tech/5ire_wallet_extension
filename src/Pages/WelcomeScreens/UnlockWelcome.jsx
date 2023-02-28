import React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import useAuth from "../../Hooks/useAuth";
import PlaceLogo from "../../Assets/PlaceLog.svg";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { setLogin, toggleLoader } from "../../Store/reducer/auth";
import InputFieldSimple from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";

function UnlockWelcome() {
  const navigate = useNavigate();
  const { verifyPass } = useAuth();
  const { isLogin } = useSelector(state => state.auth)
  const dispatch = useDispatch();
  const [data, setData] = useState("");

  const location = useLocation();

  const handleChange = (e) => {
    setData(e.target.value);
  };

  const handleClick = async (e) => {
  
    if ((e.key === "Enter") || (e.key === undefined)) {
      dispatch(toggleLoader(true));

      let res = await verifyPass(data);
      dispatch(toggleLoader(false));

      if (!res.error) {

        if (isLogin !== true)
          dispatch(setLogin(true));
        navigate(location.state?.redirectRoute || "/wallet");
      } else {
        toast.error(res.data);
        // console.log("Error", res.data);
      }
    }
  };

  return (
    <div className={style.cardWhite} onKeyDown={handleClick}>
      <MenuRestofHeaders logosilver={false} title="5irechain Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__centerLogo}>
          <div className={style.cardWhite__cardInner__innerLogocontact}>
            <img src={PlaceLogo} alt="placeLogo" />
            <div className={style.cardWhite__cardInner__innercontact}>
              <h1>Welcome Back!</h1>
              {/* <span>The Decentralized Web Awaits</span> */}
            </div>
          </div>
        </div>
        <div className={style.cardWhite__linkOuter}>
          <InputFieldSimple
            // type="password"
            name={"key"}
            onChange={handleChange}
            placeholder={"Enter Password"}
            placeholderBaseColor={true}
            coloredBg={true}
          />
        </div>
        <div className={style.setPassword__footerbuttons}>
          <ButtonComp onClick={handleClick} text={"Unlock"} />
        </div>
        {/* <div className={style.forgotLink}>
          <Link to="">Forgot password?</Link>
        </div> */}
      </div>
    </div>
  );
}

export default UnlockWelcome;
