import React from 'react'
import { Link } from "react-router-dom";
import style from "./style.module.scss";
function DefiHeading(props) {
    const { header} =
    props;
  return (
      <div className={style.defiList}>
         <div className={style.defiList__header}>
          <h1>{header}</h1>
          <Link to="#">See More</Link>
        </div> 
    </div>
  )
}

export default DefiHeading