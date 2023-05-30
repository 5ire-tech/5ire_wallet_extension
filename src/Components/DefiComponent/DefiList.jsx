import React from 'react'
import { Link } from 'react-router-dom'
import style from './style.module.scss'
// import TickIcon from "../../Assets/TickIcon.svg";
function DefiList(props) {
  const { header, stakingHead, desc, bordered, tickIcon } = props

  return (
    <>
      <div
        className={` ${style.defiList} ${
          bordered ? style.defiList__bordered : ''
        }`}
      >
        <div className={style.defiList__stakingList}>
          <img src={tickIcon} alt='tickIcon' draggable={false} />{' '}
          <div>
            <h2>{stakingHead}</h2>
            <p>{desc}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default DefiList
