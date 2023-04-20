import React from 'react';
import { Link } from 'react-router-dom';
import style from "./style.module.scss";
import { SOCIAL_LINKS } from '../../Constants';
import { openBrowserTab } from '../../Helper/helper';
// import { ROUTES } from "../../Routes/index";

function PrivacyPolicy() {
  return (
    <div className={style.footerPrivacy} >
      {/* <Link to={ROUTES.PRIVACY_POLICY}>Read Privacy Policy</Link> */}
      <Link onClick={() => openBrowserTab(SOCIAL_LINKS.POLICY)}>Read Privacy Policy</Link>
    </div>
  )
}

export default PrivacyPolicy