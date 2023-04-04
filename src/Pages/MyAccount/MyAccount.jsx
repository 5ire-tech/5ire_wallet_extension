import React from "react";
import AccountSetting from "../../Components/AccountSetting/AccountSetting";
import Createaccount from "../../Assets/PNG/createaccount.png";
import Logout from "../../Assets/PNG/logout.png";
import Import from "../../Assets/PNG/import.png";
import style from "./style.module.scss";
import { ERROR_MESSAGES } from "../../Constants/index";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../Routes";
import useAuth from "../../Hooks/useAuth";
import DarkLogo from "../../Assets/DarkLogo.svg";
import ThreeDot from "../../Assets/dot3.svg";
function MyAccount() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const hanldeCreateNewAcc = () => {
    navigate(ROUTES.CREATE_WALLET);
  };
  const handleImportAcc = () => {
    navigate(ROUTES.IMPORT_WALLET);
  };

  const handleLogout = async () => {
    const res = await logout();

    if (!res.error) {
      navigate(ROUTES.UNLOACK_WALLET);
    } else {
      toast.error(ERROR_MESSAGES.LOGOUT_ERR);
    }
  };
  return (
    <div className={style.myAccountSec}>
      <div className={style.myAccountSec__tabAccount}>
        <AccountSetting
          img={Createaccount}
          title="Create New Account"
          onClick={hanldeCreateNewAcc}
        />
        <AccountSetting
          img={Import}
          title="Import Account"
          onClick={handleImportAcc}
        />
        <AccountSetting img={Logout} title="Logout" onClick={handleLogout} />
      </div>
      <div className={style.myAccountSec__accountHeading}>
        <h3>My Accounts</h3>
      </div>
      <div className={style.myAccountSec__accountActive}>
        <div className={style.myAccountSec__leftSec}>
          <img src={DarkLogo} />
          <div className={style.myAccountSec__leftSec__accountConatct}>
            <h2>Account 1</h2>
            <p>312 ETH</p>
          </div>
        </div>
        <div className={style.myAccountSec__rytSec}>
          <h2>Active</h2>
          <img src={ThreeDot} />
        </div>
      </div>
      <div className={style.myAccountSec__accountActive}>
        <div className={style.myAccountSec__leftSec}>
          <img src={DarkLogo} />
          <div className={style.myAccountSec__leftSec__accountConatct}>
            <h2>Account 1</h2>
            <span>Switch to this account</span>
          </div>
        </div>
        <div className={style.myAccountSec__rytSec}>
          <h2>Not Active</h2>
          <img src={ThreeDot} />
        </div>
      </div>
    </div>
  );
}

export default MyAccount;
