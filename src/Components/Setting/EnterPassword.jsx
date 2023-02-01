import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import { InputFieldOnly } from "../InputField/InputFieldSimple.jsx";
import ButtonComp from "../ButtonComp/ButtonComp";
import style from "./style.module.scss";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../../Hooks/useAuth";
import {useDispatch, useSelector } from "react-redux";
import {toast} from "react-toastify";



function EnterPassword() {

  const navigate = useNavigate();
  // const dispatch = useDispatch();
  const {verifyPass} = useAuth();
  const {pass} = useSelector(state => state.auth); 
  const [data,setData] = useState("");

  const handleChange = (e) => {
    setData(e.target.value);
  }

  const handleClick = async() => { 
    let res = await verifyPass(data);

    if (!res.error) {
      // navigate(location.state?.redirectRoute || "/wallet");
      navigate("/privateKey");

    } else {
      toast.error(res.data);
      console.log("Error", res.data);
    } 

  }

  return (
    <>
      <div className={`scrollableCont`}>
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
            <InputFieldOnly
              placeholder={"Enter Password"}
              placeholderBaseColor={true}
              coloredBg={true}
              onChange={handleChange}
              type="password"
              name="pass"
            />
            <div>
              <ButtonComp
                onClick={handleClick}
                text="Continue"
              ></ButtonComp>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EnterPassword;
