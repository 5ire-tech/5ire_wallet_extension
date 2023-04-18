import { useContext } from "react";
import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Store/index";
import { isEmpty } from "../../Utility/utility.js"
import ButtonComp from "../ButtonComp/ButtonComp";
import InputFieldSimple from "../InputField/InputFieldSimple.jsx";
import { sendRuntimeMessage } from "../../Utility/message_helper.js";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import { LABELS, ERROR_MESSAGES, MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS } from "../../Constants/index";


function EnterPassword() {

  const navigate = useNavigate();
  const [data, setData] = useState("");
  const { passError, setPassError, passVerified} = useContext(AuthContext);
  const [isDisable, setDisable] = useState(true);

  useEffect(() => {
    if (passError || !data) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [passError, data]);

  useEffect(()=>{
    if (passVerified) {
      navigate(ROUTES.PVT_KEY);
    }
  },[passVerified]);


  const handleChange = (e) => {
    setData(e.target.value);
    setPassError("");
  }

  const validateInput = () => {
    if (isEmpty(data)) {
      setPassError(ERROR_MESSAGES.INPUT_REQUIRED);
      setDisable(true);
    }
  }

  const handleClick = async (e) => {

    if ((e.key === LABELS.ENTER) || (e.key === undefined)) {
      if (!passError) {
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.VERIFY_USER_PASSWORD, { password: data});
      }
    }

  }

  return (
    <>
      <div className={`scrollableCont`} onKeyDown={handleClick}>
        <MenuRestofHeaders backTo={ROUTES.MANAGE_WALLET} title={"Enter Password"} />
        <div className={`flexedContent`}>
          <div className={style.enterPassword}>
            <div className={style.commonHeadeing}>
              {/* <h1>Enter Password</h1> */}
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
              name={LABELS.PASS}
            />
            <p className={style.errorText}>{passError ? passError : ""}</p>
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
