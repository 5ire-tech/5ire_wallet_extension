import { Layout } from "antd";
import { ROUTES } from "../Routes";
import style from "./style.module.scss";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BalanceDetails from "../Components/BalanceDetails/BalanceDetails";
import MenuFooter from "../Components/MenuFooter/MenuFooter";
// import MenuRestofHeaders from "../Components/BalanceDetails/MenuRestofHeaders/MenuRestofHeaders";

function FixWidthLayout({ children }) {
  const { Content } = Layout;
  const getLocation = useLocation();
  const navigate = useNavigate();

  const { pathname } = getLocation

  useEffect(() => {
    if (!pathname) {
      navigate(ROUTES.WALLET);
    }
  }, [pathname]);

  return (
    <div className={`${style.fixedLayout}`}>
      <div className={style.fixedLayout__inner}>
        {(pathname === ROUTES.WALLET || pathname === ROUTES.SWAP_APPROVE || pathname === ROUTES.APPROVE_TXN) && (
        <div className={style.fixedLayout__inner__walletLayout}>
          <div className={style.decoratedBg} style={{ textAlign: "left" }}>
            <BalanceDetails />
          </div>
        </div>
        )}

        {/* {pathname === "history" && (
          <MenuRestofHeaders backTo={ROUTES.WALLET} title={"History"} />
        )}
        {pathname === "setting" && (
          <MenuRestofHeaders
            backTo={ROUTES.WALLET}
            title={"Setting"}
            searchTo={ROUTES.DEFAULT}
          />
        )} */}
        <Content className={style.fixedLayout__content}>{children} </Content>
        {(pathname === ROUTES.WALLET || pathname === ROUTES.APPROVE_TXN) && <MenuFooter />}
      </div>
    </div>
  );
}

export default FixWidthLayout;
