import React from "react";
import { Layout } from "antd";
import MenuFooter from "../Components/MenuFooter/MenuFooter";

// import style from "../Pages/WelcomeScreens/style.module.scss";
// import { useLocation } from "react-router-dom";
// import { ROUTES } from "../Routes";

function WelcomeLayout({ children }) {
  const { Content } = Layout;

  // const getLocation = useLocation();
  // const {pathname} = getLocation;

  return (
    <div className={"WelcomeLayout"}>
      <div className="WelcomeLayout__container">
        {/* {pathname === ROUTES.BEFORE_BEGIN && (
          <div className={style.cardWhite__numberingSec}>
            1
          </div>
        )}
        {pathname === ROUTES.NEW_WALLET_DETAILS && (
          <div className={style.cardWhite__numberingSec}>
           2
          </div>
        )}
        {pathname === ROUTES.SET_PASS && (
          <div className={style.cardWhite__numberingSec}>
            3
          </div>
        )} */}
        <Content className="WelcomeLayout__content">{children}</Content>
        <MenuFooter />
      </div>
    </div>
  );
}

export default WelcomeLayout;
