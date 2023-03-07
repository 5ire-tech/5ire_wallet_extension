import style from "./style.module.scss";
import useAuth from "../../Hooks/useAuth";
import { useState, useEffect} from "react";
import {INPUT} from "../../Constants/index";
import { useNavigate } from "react-router-dom";
import ButtonComp from "../ButtonComp/ButtonComp";
import InputFieldSimple from "../InputField/InputFieldSimple.jsx";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";


function EnterPassword() {

  const navigate = useNavigate();
  const { verifyPass } = useAuth();
  const [data, setData] = useState("");
  const [errMsg, setErrorMsg] = useState("");
  const [isDisable, setDisable] = useState(true);

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
  }

  const validateInput = () => {
    if (data.length === 0) {
      setErrorMsg(INPUT.REQUIRED);
      setDisable(true);
    }
  }

  const handleClick = async (e) => {
  
    if ((e.key === "Enter") || (e.key === undefined)) {

      let res = await verifyPass(data);

      if (!res.error) {
        // navigate(location.state?.redirectRoute || "/wallet");
        navigate("/privateKey");

      } else {
        setErrorMsg(res.data);
        setDisable(true);
      }
    }

  }

  return (
    <>
      <div className={`scrollableCont`} onKeyDown={handleClick}>
        <MenuRestofHeaders backTo={"/manageWallet"} title={""} />
        <div className={`flexedContent`}>
          <div className={style.enterPassword}>
            <div className={style.commonHeadeing}>
              <h1>Enter Password</h1>
              <p>
                Your password is used to unlock your wallet and will allow
                wallet to export your Private Key
              </p>
            </div>
            <InputFieldSimple
              placeholder={"Enter Password"}
              placeholderBaseColor={true}
              onChange={handleChange}
              keyUp={validateInput}
              coloredBg={true}
              type="password"
              name="pass"
            />
            <p className={style.errorText}>{errMsg ? errMsg : ""}</p>
            <div>
              <ButtonComp
                onClick={handleClick}
                text="Continue"
                isDisable={isDisable}
              ></ButtonComp>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EnterPassword;
