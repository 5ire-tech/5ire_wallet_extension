import { Layout } from "antd";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BalanceDetails from "../Components/BalanceDetails/BalanceDetails";
import MenuRestofHeaders from "../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";
import MenuFooter from "../Components/MenuFooter/MenuFooter";
import style from "./style.module.scss";

function FixWidthLayout({ children }) {
  const { Content } = Layout;
  const getLocation = useLocation();
  const navigate = useNavigate();

  const path = getLocation.pathname.replace("/", "");

  useEffect(() => {
    if (!path) {
      navigate("/wallet");
    }
  }, [path]);

  return (
    <div className={`${style.fixedLayout}`}>
      <div className={style.fixedLayout__inner}>
        {(path === "wallet" ||
          path === "swapapprove" ||
          path === "approveTx") && (
          <div className={style.fixedLayout__inner__walletLayout}>
            <div className={style.decoratedBg} style={{ textAlign: "left" }}>
              {/* <img src={LogoHorizontal} width={155} height={20} /> */}
              <BalanceDetails />
            </div>
          </div>
        )}

        {path === "history" && (
          <MenuRestofHeaders backTo={"/wallet"} title={"History"} />
        )}
        {path === "setting" && (
          <MenuRestofHeaders
            backTo={"/wallet"}
            title={"Setting"}
            searchTo="/"
          />
        )}
        <Content className={style.fixedLayout__content}>{children} </Content>
        {(path === "wallet" || path === "approveTx") && <MenuFooter />}
      </div>
    </div>
  );
}

export default FixWidthLayout;
