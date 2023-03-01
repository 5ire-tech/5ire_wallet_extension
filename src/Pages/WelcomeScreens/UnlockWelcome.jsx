import React, { useEffect } from "react";
import { useState } from "react";
import style from "./style.module.scss";
import useAuth from "../../Hooks/useAuth";
// import { toast } from "react-toastify";
import PlaceLogo from "../../Assets/PlaceLog.svg";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { setLogin, toggleLoader } from "../../Store/reducer/auth";
import InputFieldSimple from "../../Components/InputField/InputFieldSimple";
import MenuRestofHeaders from "../../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";

function UnlockWelcome() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { verifyPass } = useAuth();
  const [data, setData] = useState("");
  const [errMsg, setErrorMsg] = useState("");
  const [isDisable, setDisable] = useState(true);
  const { isLogin } = useSelector(state => state.auth);


  useEffect(()=>{
    if (errMsg || !data) {
      setDisable(true);
    }else{
      setDisable(false);
    }
  },[errMsg, data]);

  const handleChange = (e) => {
    setData(e.target.value);
    setErrorMsg("");
  };

  const validateInput = () => {
    if (data.length === 0) {
      setErrorMsg("This field is required.");
      setDisable(true);
    }

  }

  const handleClick = async (e) => {

    if ((e.key === "Enter") || (e.key === undefined)) {
      dispatch(toggleLoader(true));

      let res = await verifyPass(data);
      dispatch(toggleLoader(false));

      if (!res.error) {
        if (isLogin !== true)
          dispatch(setLogin(true));
        navigate(location.state?.redirectRoute || "/wallet");
      }

      else {
        // toast.error(res.data);
        setErrorMsg(res.data);
        setDisable(true);
      }
    }
  };

  return (
    <div className={style.cardWhite} onKeyDown={handleClick}>
      <MenuRestofHeaders logosilver={false} title="5irechain Wallet" />
      <div className={style.cardWhite__cardInner}>
        <div className={style.cardWhite__cardInner__centerLogo}>
          <div className={style.cardWhite__cardInner__innerLogocontact}>
            <img src={PlaceLogo} alt="placeLogo" draggable={false} />
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
            keyUp={validateInput}
            coloredBg={true}
          />
          <p className={style.errorText}>{errMsg ? errMsg : ""}</p>
        </div>
        <div className={style.setPassword__footerbuttons}>
          <ButtonComp onClick={handleClick} text={"Unlock"} isDisable={isDisable} />
        </div>
        {/* <div className={style.forgotLink}>
          <Link to="">Forgot password?</Link>
        </div> */}
      </div>
    </div>
  );
}

export default UnlockWelcome;
