import React, { useState } from 'react'
import Send from '../Send/Send'
import Swap from '../Swap/Swap.jsx'
import style from './style.module.scss'

function Wallet() {
  const [activeTab, setActiveTab] = useState('send')
  const activeSend = () => {
    setActiveTab('send')
  }
  const activeSwap = () => {
    setActiveTab('swap')
  }
  return (
    <div className={style.wallet}>
      <div className={style.wallet__sendSwapSec}>
        <div className={style.wallet__multiSwapBtn}>
          <div className={style.wallet__sendSwapbtn}>
            <button
              onClick={activeSend}
              className={`${style.wallet__sendSwapbtn__buttons} 
              ${
                activeTab === 'send' &&
                style.wallet__sendSwapbtn__buttons__active
              }
            `}
            >
              Transfer
            </button>
            <button
              onClick={activeSwap}
              className={`${style.wallet__sendSwapbtn__buttons}  ${
                activeTab === 'swap' &&
                style.wallet__sendSwapbtn__buttons__active
              }`}
            >
              Swap
            </button>
          </div>
        </div>
        {activeTab === 'send' && (
          <div>
            <Send />
          </div>
        )}
        {activeTab === 'swap' && (
          <div>
            <Swap />
          </div>
        )}
      </div>
    </div>
  )
}

export default Wallet
