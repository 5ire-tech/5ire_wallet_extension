import React from 'react'
import { Link } from 'react-router-dom'
import style from './style.module.scss'
function Beforebegin() {
  return (
    <div>
      <div className={style.cardWhite}>
        <div className={style.cardWhite__beginText}>
          <h1>Before we begin!</h1>
          <p>
            On the next screen, you will get a series of 12 random words knows
            as &quot;Mnemonics Phrase&quot;. When combined in the correct order,
            they form a key that allows you to access your wallet.
          </p>
          <p>
            You will also get 5irechain Native and EVM chain addresses, which
            share a common mnemonic phrase to access the wallet.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Beforebegin
