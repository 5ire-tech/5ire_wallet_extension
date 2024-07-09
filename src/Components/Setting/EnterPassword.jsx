import { useContext, useState, useEffect } from "react";
import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Store/index";
import ButtonComp from "../ButtonComp/ButtonComp";
import { isEmpty } from "../../Utility/utility.js";
import InputFieldSimple from "../InputField/InputFieldSimple.jsx";
import { sendRuntimeMessage } from "../../Utility/message_helper.js";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import WelcomeLogo from "../../Assets/welcomeLogo.svg";
import {
  LABELS,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";

function EnterPassword() {
  const navigate = useNavigate();

  const [data, setData] = useState("");
  const [isDisable, setDisable] = useState(true);
  const { inputError, setInputError, passVerified, setPassVerified } = useContext(AuthContext);

  useEffect(() => {
    setInputError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inputError || !data) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [inputError, data]);

  useEffect(() => {
    if (passVerified) {
      setPassVerified(false);
      navigate(ROUTES.PVT_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passVerified]);

  const handleChange = (e) => {
    setData(e.target.value);
    setInputError("");
  };

  const validateInput = () => {
    if (isEmpty(data)) {
      setInputError(ERROR_MESSAGES.INPUT_REQUIRED);
      setDisable(true);
    }
  };

  const handleClick = async (e) => {
    if (e.key === LABELS.ENTER || e.key === undefined) {
      if (!inputError) {
        sendRuntimeMessage(
          MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING,
          MESSAGE_EVENT_LABELS.VERIFY_USER_PASSWORD,
          { password: data }
        );
      }
    }
  };

  return (
    <>
      <div className={`scrollableCont`} onKeyDown={handleClick}>
        <div className="">
          <img src={WelcomeLogo} alt="logo" style={{ marginTop: "20px" }} />
        </div>
        <MenuRestofHeaders backTo={ROUTES.MANAGE_WALLET} title={"Enter Password"} />
        <div className={`flexedContent`}>
          <div className={style.enterPassword}>
            <div className={style.commonHeadeing}>
              <p>Enter your wallet password to reveal secret keys</p>
            </div>
            <InputFieldSimple
              value={data}
              type="password"
              coloredBg={true}
              name={LABELS.PASS}
              keyUp={validateInput}
              onChange={handleChange}
              placeholderBaseColor={true}
              placeholder={"Enter Password"}
              onDrop={(e) => {
                e.preventDefault();
              }}
            />
            <p className={style.errorText}>{inputError ? inputError : ""}</p>
            <div>
              <ButtonComp onClick={handleClick} text="Continue" isDisable={isDisable}></ButtonComp>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EnterPassword;
