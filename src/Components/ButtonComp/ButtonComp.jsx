import React from 'react'
import style from './style.module.scss'

function ButtonComp({text,bordered,onClick,maxWidth,img}) {
  return (
    <button className={`${style.ButtonStyle} ${bordered ? style.ButtonStyle__bordered : ""}`} onClick={onClick} style={{ maxWidth: maxWidth }}>
        {img &&  (<img src={img} alt="" />) }
      {text}
    </button>
  )
}

export default ButtonComp