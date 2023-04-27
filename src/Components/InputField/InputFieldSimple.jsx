import React from "react";
import { Input } from "antd";
import style from "./style.module.scss";
import EyeOpenIcon from "../../Assets/EyeOpenIcon.svg";
import EyeCloseIcon from "../../Assets/EyeCloseIcon.svg";
function InputFieldSimple({
  name,
  keyUp,
  value,
  onChange,
  minHeight,
  coloredBg,
  placeholder,
  placeholderBaseColor,
})

 {
  
  return (
    <Input.Password
      className={`${style.inputSimple} ${style.inputPassword} ${placeholderBaseColor ? "placeholderBaseColor" : ""
        } ${coloredBg ? style.inputField__coloredBg : ""}`}
      placeholder={placeholder}
      style={{ minHeight: minHeight }}
      onChange={onChange}
      onKeyUp={keyUp}
      name={name}
      value={value}
      // className={style.inputSimple}
      // placeholder={placeholder}
      iconRender={(visible) =>
        visible ? (
          <img src={EyeOpenIcon} width={19} height={12} draggable={false} alt="eyeOpen" />
        ) : (
          <img src={EyeCloseIcon} width={19} height={16} draggable={false} alt="eyeClose" />
        )
      }
    />
  );
}

export default InputFieldSimple;

export const InputField = ({
  min,
  mb0,
  type,
  name,
  value,
  label,
  keyUp,
  keyDown,
  onChange,
  coloredBg,
  addonAfter,
  inputSelect,
  placeholder,
  defaultValue,
  placeholderBaseColor,
  suffix='',
}) => {
  // const suffix = (
  //   <button>Max</button>
  // );
  return (
    <div className={`${style.boxStyle} inputField ${mb0 ? style.mb0 : ""}`}>
      <label htmlFor={name} className={`${style.boxStyle__label}`}>
        {label}
      </label>
      <Input
        name={name}
        type={type ? type : "text"}
        min={min}
        // max = {max}
        value={value}
        onChange={onChange}
        onKeyUp={keyUp}
        onKeyDown={keyDown}
        onWheel={(e) => e.target.blur()}
        className={`${style.inputField__input} ${inputSelect ? style.inputField__inputSelect : ""
          }  ${placeholderBaseColor ? "placeholderBaseColor" : ""} ${coloredBg ? style.inputField__coloredBg : ""
          }`}
        addonAfter={addonAfter}
        defaultValue={defaultValue}
        placeholder={placeholder}
        suffix={suffix}
      />
    </div>
  );
};

export const InputFieldOnly = ({
  name,
  value,
  type,
  keyUp,
  label,
  onChange,
  minHeight,
  coloredBg,
  placeholder,
  placeholderBaseColor,
}) => {
  return (
    <div className={`${style.boxStyle} inputFieldOnly `}>
      <label className={style.boxStyle__label}>{label}</label>
      <Input
        value={value}
        type={type ? type : "text"}
        className={`${style.inputSimple} ${placeholderBaseColor ? "placeholderBaseColor" : ""
          } ${coloredBg ? style.inputField__coloredBg : ""}`}
        placeholder={placeholder}
        style={{ minHeight: minHeight }}
        onChange={onChange}
        name={name}
        onKeyUp={keyUp}
      />
    </div>
  );
};
