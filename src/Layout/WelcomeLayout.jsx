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

        {path === "beforebegin" && (
          <div className={style.cardWhite__numberingSec}>
          </div>
        )}
        {path === "createwalletchain" && (
          <div className={style.cardWhite__numberingSec}>
          </div>
        )}
        {path === "setPassword" && (
          <div className={style.cardWhite__numberingSec}>
          </div>
        )}
        <Content className="WelcomeLayout__content">{children}</Content>
        <MenuFooter />
      </div>
    </div>
  );
}

export default WelcomeLayout;
