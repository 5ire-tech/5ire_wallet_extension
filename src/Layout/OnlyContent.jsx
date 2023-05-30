import { Layout } from "antd";
import React from "react";
import style from "./style.module.scss";

function OnlyContent({ children }) {
  const { Content } = Layout;

  return (
    <div className={`${style.fixedLayout}`}>
      <div className={style.fixedLayout__inner}>
        <Content
          className={`${style.fixedLayout__content} ${style.fixedLayout__content__paddingX}`}
        >
          {children}
        </Content>
      </div>
    </div>
  );
}

export default OnlyContent;
