import React from "react";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { InputFieldOnly } from "../../Components/InputField/InputFieldSimple";
import style from "./style.module.scss";
import PlaceLogo from "../../Assets/PlaceLog.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../../Hooks/useAuth";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setLogin, toggleLoader } from "../../Store/reducer/auth";

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

  const handleClick = async () => {
    dispatch(toggleLoader(true));

    let res = await verifyPass(data);
    dispatch(toggleLoader(false));

    if (!res.error) {
      console.log("SeTTING LOGIN true!!!");
      if (isLogin !== true)
        dispatch(setLogin(true));
      navigate(location.state?.redirectRoute || "/wallet");
    } else {
      toast.error(res.data);
      console.log("Error", res.data);
    }
  };
  return (
    <div className={style.cardWhite}>
      <MenuRestofHeaders logosilver={true} title="5ire Non-Custodial Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__centerLogo}>
          <div className={style.cardWhite__cardInner__innerLogocontact}>
            <img src={PlaceLogo} />
            <div className={style.cardWhite__cardInner__innercontact}>
              <h1>Welcome Back!</h1>
              <span>The decentralized web awaits</span>
            </div>
          </div>
        </div>
        <div className={style.cardWhite__linkOuter}>
          <InputFieldOnly
            type="password"
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
