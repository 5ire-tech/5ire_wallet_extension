import { useState } from "react";
import { toast } from "react-toastify";
import style from "./style.module.scss";
import useAuth from "../../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ButtonComp from "../ButtonComp/ButtonComp";
import InputFieldSimple from "../InputField/InputFieldSimple.jsx";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
// import {useSelector } from "react-redux";


function EnterPassword() {

  const navigate = useNavigate();
  // const dispatch = useDispatch();
  const { verifyPass } = useAuth();
  // const {pass} = useSelector(state => state.auth); 
  const [data, setData] = useState("");

  const handleChange = (e) => {
    setData(e.target.value);
  }

  const handleClick = async (e) => {
    console.log("e.key : ", e.key);
    if ((e.key === "Enter") || (e.key === undefined)) {

      let res = await verifyPass(data);

      if (!res.error) {
        // navigate(location.state?.redirectRoute || "/wallet");
        navigate("/privateKey");

      } else {
        toast.error(res.data);
        console.log("Error : ", res.data);
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
