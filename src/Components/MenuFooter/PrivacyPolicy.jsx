import React from 'react'
import { Link } from 'react-router-dom';
import style from "./style.module.scss";
function PrivacyPolicy() {
  return (
    <div className={style.footerPrivacy} >
        <Link to="/mainprivacypolicy">Read Privacy Policy</Link>
    </div>
  )
}

export default PrivacyPolicy