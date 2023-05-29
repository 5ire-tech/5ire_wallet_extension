import { ROUTES } from "../../Routes";
import style from "./style.module.scss";
import React, { useContext } from "react";
import { AuthContext } from "../../Store";
import { useNavigate } from "react-router-dom";
import ButtonComp from "../../Components/ButtonComp/ButtonComp";
import { StepHeaders } from "../../Components/BalanceDetails/Steps/steps";


function Beforebegin() {
  const { state, setNewWalletName } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isLogin } = state;

  const handleCancel = () => {
    if (isLogin) navigate(ROUTES.WALLET);
    else navigate(ROUTES.DEFAULT);
  }

  const handleClick = () => {
    setNewWalletName("");
    navigate(ROUTES.CREATE_WALLET);
  }

  return (
    <div>
      <div className={style.cardWhite}>
        {/* <Steps current={current} items={items} direction="horizontal" /> */}
        <StepHeaders active={1} />
        <div className={style.cardWhite__beginText}>
          <h1>Before we begin!</h1>
          <p>
            On the next screen, you will get a series of 12 random words knows
            as "Mnemonics Phrase". When combined in the correct order, they form
            a key that allows you to access your wallet.
          </p>
          <p>
            You will also get 5ireChain Native and EVM chain addresses, which
            share a common mnemonic phrase to access the wallet.
          </p>
        </div>
      </div>

      <div className={`${style.cancleContinueContainer}`}>
        <ButtonComp
          onClick={handleCancel}
          bordered={true}
          text={"Cancel"}
          maxWidth={"100%"}
        />
        <ButtonComp
          onClick={handleClick}
          text={"Continue"}
          maxWidth={"100%"}
        />

      </div>
    </div>
  );
}

export default Beforebegin;
