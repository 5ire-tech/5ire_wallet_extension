import React from 'react';
import { Link } from 'react-router-dom';
import style from "./style.module.scss";
import { ROUTES } from "../../Routes/index";

function PrivacyPolicy() {
  return (
    <div className={style.footerPrivacy} >
      <Link to={ROUTES.PRIVACY_POLICY}>Read Privacy Policy</Link>
    </div>
  )
}

export default PrivacyPolicy