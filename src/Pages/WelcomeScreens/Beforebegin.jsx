import { Button, message, Steps } from "antd";
import React from "react";
import style from "./style.module.scss";
import { useState } from 'react';
import { StepHeaders } from "../../Components/BalanceDetails/Steps/steps";
function Beforebegin() {
  // const steps = [
  //   {
  //     title: 'First',
  //     content: 'First-content',
  //   },
  //   {
  //     title: 'Second',
  //     content: 'Second-content',
  //   },
  //   {
  //     title: 'Last',
  //     content: 'Last-content',
  //   },
  // ];
  // const [current, setCurrent] = useState(0);
  // const next = () => {
  //   setCurrent(current + 1);
  // };
  // const prev = () => {
  //   setCurrent(current - 1);
  // };
  // const items = steps.map((item) => ({
  //   key: item.title,
  //   title: item.title,
  // }));
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
        {/* {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success('Processing complete!')}>
            Done
          </Button>
        )}
        {current > 0 && (
          <Button
            style={{
              margin: '0 8px',
            }}
            onClick={() => prev()}
          >
            Previous
          </Button>
        )} */}
      </div>
    </div>
  );
}

export default Beforebegin;
