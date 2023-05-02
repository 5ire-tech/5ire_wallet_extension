import { useContext } from "react";
import { ROUTES } from "../../Routes";
import PrivateKey from "./PrivateKey";
import style from "./style.module.scss";
import { useState, useEffect } from "react";
import { AuthContext } from "../../Store/index";
import { isEmpty } from "../../Utility/utility.js"
import ButtonComp from "../ButtonComp/ButtonComp";
import InputFieldSimple from "../InputField/InputFieldSimple.jsx";
import { sendRuntimeMessage } from "../../Utility/message_helper.js";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
// import ModalCustom from "../ModalCustom/ModalCustom";
import { LABELS, ERROR_MESSAGES, MESSAGE_TYPE_LABELS, MESSAGE_EVENT_LABELS } from "../../Constants/index";
import { useParams, useNavigate } from "react-router-dom";


function EnterPassword() {

  // const params = useParams();
  const navigate = useNavigate()
  const [data, setData] = useState("");
  const [isDisable, setDisable] = useState(true);
  // const [isModalOpen, setModalOpen] = useState(false);
  const { inputError, setInputError, passVerified, setPassVerified } = useContext(AuthContext);

  useEffect(() => {
    setInputError('')
  }, [])

  useEffect(() => {
    if (inputError || !data) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [inputError, data]);

  useEffect(() => {
    if (passVerified) {
      // setModalOpen(true);
      setPassVerified(false);
      navigate(ROUTES.PVT_KEY);
    }
  }, [passVerified]);


  const handleChange = (e) => {
    setData(e.target.value);
    setInputError("");
  }

  const handle_OK_Cancel = () => {
    setData("");
    // setModalOpen(false);
  };


  const validateInput = () => {
    if (isEmpty(data)) {
      setInputError(ERROR_MESSAGES.INPUT_REQUIRED);
      setDisable(true);
    }
  }

  const handleClick = async (e) => {

    if ((e.key === LABELS.ENTER) || (e.key === undefined)) {
      if (!inputError) {
        sendRuntimeMessage(MESSAGE_TYPE_LABELS.EXTENSION_UI_KEYRING, MESSAGE_EVENT_LABELS.VERIFY_USER_PASSWORD, { password: data });
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
              <p>
                Your password is used to unlock your wallet and will allow
                wallet to export your Private Key
              </p>
            </div>
            <InputFieldSimple
              type="password"
              value={data}
              coloredBg={true}
              name={LABELS.PASS}
              keyUp={validateInput}
              onChange={handleChange}
              placeholderBaseColor={true}
              placeholder={"Enter Password"}
            />
            <p className={style.errorText}>{inputError ? inputError : ""}</p>
            <div>
              <ButtonComp
                onClick={handleClick}
                // onClick={() => handleModalOpen}
                text="Continue"
                isDisable={isDisable}
              ></ButtonComp>
            </div>
          </div>
          {/* <ModalCustom
            isModalOpen={isModalOpen}
            handleOk={handle_OK_Cancel}
            handleCancel={handle_OK_Cancel}
          > */}
          {/* <PrivateKey id={params?.id} /> */}
          {/* </ModalCustom> */}
        </div>
      </div>
    </>
  );
}

export default EnterPassword;
