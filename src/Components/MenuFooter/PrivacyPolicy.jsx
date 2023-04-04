import Link from 'antd/es/typography/Link'
import React from 'react'
import style from "./style.module.scss";
function PrivacyPolicy() {
  return (
    <div className={style.footerPrivacy} >
        <Link>Read Privacy Policy</Link>
    </div>
  )
}

export default PrivacyPolicy