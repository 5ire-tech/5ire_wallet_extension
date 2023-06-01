import React from "react";
import { Layout } from "antd";
import MenuFooter from "../Components/MenuFooter/MenuFooter";

function WelcomeLayout({ children }) {
  const { Content } = Layout;

  return (
    <div className={"WelcomeLayout"}>
      <div className="WelcomeLayout__container">
        <Content className="WelcomeLayout__content">{children}</Content>
        <MenuFooter />
      </div>
    </div>
  );
}

export default WelcomeLayout;
