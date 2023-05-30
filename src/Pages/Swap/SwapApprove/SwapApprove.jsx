import React from 'react'
import style from './style.module.scss'
import SwapIcon from '../../../Assets/ArrowRightIcon.svg'
import Approve from '../../Approve/Approve'
function SwapApprove() {
  return (
    <>
      <div className={style.swapApprove}>
        <div className={style.swapApprove__approveCard}>
          <div className={style.swapApprove__approveCard__swapSec}>
            <h3>
              From <span>Native</span>
            </h3>
            <p>0xs3...5486s</p>
          </div>
          <div className={style.swapApprove__approveCard__icon}>
            <img src={SwapIcon} draggable={false} alt='swapIcon' />
          </div>
          <div className={style.swapApprove__approveCard__swapSec}>
            <h3>
              To <span>Native</span>
            </h3>
            <p>0xs3...5486s</p>
          </div>
        </div>
        <div className={style.swapApprove__approveList}>
          <div className={style.swapApprove__approveList__innerList}>
            <h4>Transaction Amount</h4>
            <h4>5 5ire</h4>
          </div>
          <div className={style.swapApprove__approveList__innerList}>
            <h4>Transaction Amount</h4>
            <h4>5 5ire</h4>
          </div>
          <div className={style.swapApprove__approveList__innerList}>
            <h4>Transaction Amount</h4>
            <h4>5 5ire</h4>
          </div>
        </div>
      </div>
      <Approve />
    </>
  )
}

export default SwapApprove
