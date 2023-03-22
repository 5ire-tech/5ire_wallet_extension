import style from "./style.module.scss";
import { toast } from "react-toastify";
import useAuth from "../../Hooks/useAuth";
import { useParams } from "react-router-dom";
import { INPUT, LABELS } from "../../Constants/index";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext} from "react";
// import { useDispatch, useSelector } from "react-redux";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import InputFieldSimple from "../../Components/InputField/InputFieldSimple";
import CongratulationsScreen from "../../Pages/WelcomeScreens/CongratulationsScreen";
import { AuthContext } from "../../Store";



export default function SetPasswordScreen() {
  const params = useParams();
  const navigate = useNavigate();
  const { setUserPass } = useAuth();
  const { state,updateState } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [confirmError, setconfirmError] = useState("");
  // const dispatch = useDispatch();
  // const { isLogin } = useSelector((state) => state.auth);
  const [pass, setPass] = useState({ pass: "", confirmPass: "" });


  useEffect(() => {

    if (pass.confirmPass === pass.pass || pass.pass === "") {
      setconfirmError("");
    } else {
      if (pass.confirmPass !== "")
        setconfirmError("Passwords do not match.")
    }
  }, [pass.pass, pass.confirmPass])

  const validatePass = () => {
    const uppercaseRegExp = /(?=.*?[A-Z])/;
    const lowercaseRegExp = /(?=.*?[a-z])/;
    const digitsRegExp = /(?=.*?[0-9])/;
    const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;
    const minLengthRegExp = /.{8,}/;
    let errMsg = "";


    if (pass.pass.length === 0) {
      errMsg = INPUT.REQUIRED;
    }

    else if (
      !uppercaseRegExp.test(pass.pass) ||
      !lowercaseRegExp.test(pass.pass) ||
      !digitsRegExp.test(pass.pass) ||
      !specialCharRegExp.test(pass.pass) ||
      !minLengthRegExp.test(pass.pass)
    ) {
      errMsg = "Password must have at least 8 characters, combination of Mixed case, 1 Special Character and 1 Number.";
    }

    else {
      errMsg = "";
    }
    setError(errMsg);
  };

  const validateConfirmPass = () => {

    if (pass.confirmPass.length === 0)
      setconfirmError(INPUT.REQUIRED);

    else if (pass.confirmPass !== pass.pass)
      setconfirmError("Passwords do not match.");

    else
      setconfirmError("");

  };

  const handleSubmit = async (e) => {

    if ((e.key === LABELS.ENTER) || (e.key === undefined)) {

      if (pass.pass.length === 0 && pass.confirmPass.length === 0) {
        setError(INPUT.REQUIRED);
        setconfirmError(INPUT.REQUIRED);
      }
      else if (pass.pass.length === 0) {
        setError(INPUT.REQUIRED);
      }
      else if (pass.confirmPass.length === 0) {
        setconfirmError(INPUT.REQUIRED);
      }
      else {
        if (!error && !confirmError) {
          // dispatch(toggleLoader(true));
          let res = await setUserPass(pass.pass);
          if (res.error) {
            // dispatch(toggleLoader(false));
            toast.error(res.data);
          } else {
            // dispatch(toggleLoader(false));
            setShow(true);
            setTimeout(() => {
              if (state.isLogin !== true) updateState(LABELS.ISLOGIN, true);
              // dispatch(setLogin(true));
              setShow(false);
              setTimeout(() => {
                navigate("/wallet");
              }, 500);
            }, 2000);
          }
        }
      }
    }
  };

  const handleChange = (e) => {
    setPass((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value.trim(),
      };
    });
  };

  return (
    <>
      <div onKeyDown={handleSubmit} className={`${style.cardWhite}`}>
        <div className={style.cardWhite__beginText}>
          <h1>Create Password</h1>
          <p>
            Your password is used to unlock your wallet and is stored securely
            on your device. We recommend 12 characters, with uppercase and
            lowercase letters, symbols and numbers.
          </p>
          <div className={style.cardWhite__beginText__passInputSec}>
            <InputFieldSimple
              // type="password"
              value={pass.pass}
              name={LABELS.PASS}
              onChange={handleChange}
              placeholder={"Enter Password"}
              placeholderBaseColor={true}
              coloredBg={true}
              keyUp={validatePass}
            />
          </div>
          <p className={style.errorText}>{error ? error : ""}</p>
          <div className={style.cardWhite__beginText__passInputSec}>
            <InputFieldSimple
              // type="password"
              value={pass.confirmPass}
              name="confirmPass"
              onChange={handleChange}
              placeholder={"Confirm Password"}
              placeholderBaseColor={true}
              coloredBg={true}
              keyUp={validateConfirmPass}
            />
            <p className={style.errorText}>{confirmError ? confirmError : ""}</p>
          </div>
          <div style={{ marginTop: "30px" }}>
            <ButtonComp
              onClick={handleSubmit}
              text={"Continue"}
              maxWidth={"100%"}
            />
          </div>
        </div>
      </div>
      <div className={style.menuItems__cancleContinue}>
        {show && (
          <div className="loader">
            <CongratulationsScreen text={`Your Wallet is ${params.id === "create" ? "Created" : "Imported"}.`} />
          </div>
        )}
      </div>
    </>
  );
}
