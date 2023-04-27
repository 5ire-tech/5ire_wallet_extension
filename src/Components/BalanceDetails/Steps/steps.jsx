import React from "react";
// import style from "./style.module.scss";

export function StepHeaders({ active, isCreate = true }) {
    return (<>
        {
            isCreate ?
                <div style={{ color: "white" }}>
                    <p>{active}</p>
                    <li className={active === 1 && ""}>1</li>
                    <li className={active === 2 && ""}>2</li>
                    <li className={active === 3 && ""}>3</li>
                    <li className={active === 4 && ""}>3</li>
                </div>
                :
                <div >
                    <p>{active}</p>
                    <li className={active === 1 && ""}>1</li>
                    <li className={active === 2 && ""}>2</li>
                    <li className={active === 3 && ""}>3</li>
                </div>
        }
    </>

    );
}


