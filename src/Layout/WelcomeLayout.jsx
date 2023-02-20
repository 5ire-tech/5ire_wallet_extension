// import { Content } from "antd/es/layout/layout";
import { Layout } from "antd";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import MenuFooter from "../Components/MenuFooter/MenuFooter";
import style from "../Pages/WelcomeScreens/style.module.scss";

function WelcomeLayout({ children }) {
  const { Content } = Layout;
  const getLocation = useLocation();
  const path = getLocation.pathname.replace("/", "");
  return (
    <div className={"WelcomeLayout"}>
      <div className="WelcomeLayout__container">
        {/* <div className="WelcomeLayout__logo">
          <img src={Logo} />
        </div> */}
        {path === "beforebegin" && (
          <div className={style.cardWhite__numberingSec}>
            {/* <p>1 of 3</p> */}
          </div>
        )}
        {path === "createwalletchain" && (
          <div className={style.cardWhite__numberingSec}>
            {/* <p>2 of 3</p> */}
          </div>
        )}
        {path === "setPassword" && (
          <div className={style.cardWhite__numberingSec}>
            {/* <p>3 of 3</p> */}
          </div>
        )}
        <Content className="WelcomeLayout__content">{children}</Content>
        <MenuFooter />
      </div>
    </div>
  );
}

export default WelcomeLayout;
