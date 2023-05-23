import { useContext } from "react";
import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Store/index";
import ButtonComp from "../ButtonComp/ButtonComp";
import { isEmpty } from "../../Utility/utility.js";
import InputFieldSimple from "../InputField/InputFieldSimple.jsx";
import { sendRuntimeMessage } from "../../Utility/message_helper.js";
import MenuRestofHeaders from "../BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import {
  LABELS,
  ERROR_MESSAGES,
  MESSAGE_TYPE_LABELS,
  MESSAGE_EVENT_LABELS
} from "../../Constants/index";


function EnterPassword() {

  // const params = useParams();
  const navigate = useNavigate()
  const [data, setData] = useState("");
  const [isDisable, setDisable] = useState(true);
  // const [isModalOpen, setModalOpen] = useState(false);
  const { inputError, setInputError, passVerified, setPassVerified } = useContext(AuthContext);

  useEffect(() => {
    setInputError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passVerified]);


  const handleChange = (e) => {
    setData(e.target.value);
    setInputError("");
  }


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
                Enter your wallet password to reveal secret keys
              </p>
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
              onDrop={e => { e.preventDefault() }}
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
