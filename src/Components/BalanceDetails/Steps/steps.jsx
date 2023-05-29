import React from "react";
import style from "./style.module.scss";

export function StepHeaders({ active, isCreate = true }) {
  return (
    <>
      {isCreate ? (
        <div className={style.steps} style={{ color: "white" }}>
          <div className={`${style.innerStep} ${style.innerStepLast}`}>
            <div
              className={`${style.stepsItems} ${active === 1 && style.active}`}
            >
              1
            </div>
          </div>
          <div className={style.innerStep}>
            <div
              className={`${style.stepsItems} ${active === 2 && style.active}`}
            >
              2
            </div>
          </div>
          <div className={`${style.innerStep}`}>
            <div
              className={`${style.stepsItems} ${active === 3 && style.active}`}
            >
              3
            </div>
          </div>
          <div className={`${style.innerStep}`}>
            <div
              className={`${style.stepsItems} ${active === 4 && style.active}`}
            >
              4
            </div>
          </div>

        </div>
      ) : (
        <div className={`${style.steps} ${style.importSteps}`} style={{ color: "white" }}>
          
          <div className={`${style.innerStep} ${style.innerStepLast}`}>
            <div
              className={`${style.stepsItems} ${active === 1 && style.active}`}
            >
              1
            </div>
          </div>
          <div className={`${style.innerStep} ${style.importAfter}`}>
            <div
              className={`${style.stepsItems} ${active === 2 && style.active}`}
            >
              2
            </div>
          </div>
          {/* <div className={`${style.innerStep}`}>
            <div
              className={`${style.stepsItems} ${active === 3 && style.active}`}
            >
              3
            </div>
          </div> */}
        </div>
      )}
    </>
  );
}
