import React from 'react'
import { Card } from 'antd'
import style from './style.module.scss'
function AddressNetworkCard(props) {
  const { heading, address, currency } = props
  return (
    <>
      <div className={style.adressCard}>
        <div className={style.adressCard__Header}>
          <h2>{heading}</h2>
        </div>

        <div className={style.adressCard__address}>
          <p>Address</p>
          <p>{address}</p>
        </div>
        <div className={style.adressCard__address}>
          <p>Network</p>
          <p>{currency}</p>
        </div>
      </div>
    </>
  )
}

export default AddressNetworkCard
