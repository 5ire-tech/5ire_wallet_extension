import { Layout } from "antd";
import { ROUTES } from "../Routes";
import style from "./style.module.scss";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BalanceDetails from "../Components/BalanceDetails/BalanceDetails";
import MenuFooter from "../Components/MenuFooter/MenuFooter";
import { isEqual } from "../Utility/utility";

function FixWidthLayout({ children }) {
  const { Content } = Layout;

  const getLocation = useLocation();
  const navigate = useNavigate();

  const { pathname } = getLocation;

  useEffect(() => {
    if (!pathname) {
      navigate(ROUTES.WALLET);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className={`${style.fixedLayout}`}>
      <div className={style.fixedLayout__inner}>
        {(pathname === ROUTES.WALLET ||
          ROUTES.SWAP_APPROVE ||
          ROUTES.APPROVE_TXN ||
          pathname === ROUTES.HISTORY ||
          pathname === ROUTES.MY_ACCOUNT ||
          pathname === ROUTES.SETTING_COMP) && (
          <div className={style.fixedLayout__inner__walletLayout}>
            <div className={style.decoratedBg} style={{ textAlign: "left" }}>
              <BalanceDetails />
            </div>
          </div>
        )}

        <Content className={style.fixedLayout__content}>{children} </Content>
        {(isEqual(pathname, ROUTES.APPROVE_TXN) ||
          isEqual(pathname, ROUTES.WALLET) ||
          isEqual(pathname, ROUTES.HISTORY) ||
          isEqual(pathname, ROUTES.MY_ACCOUNT) ||
          isEqual(pathname, ROUTES.SETTING_COMP)) && <MenuFooter />}
      </div>
    </div>
  );
}

export default FixWidthLayout;
