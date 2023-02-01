import { Input } from "antd";
import React from "react";
import EyeOpenIcon from "../../Assets/EyeOpenIcon.svg";
import EyeCloseIcon from "../../Assets/EyeCloseIcon.svg";
import style from "./style.module.scss";
import { Link } from "react-router-dom";
function InputFieldSimple({ placeholder }) {
  return (
    <Input.Password
      className={style.inputSimple}
      placeholder={placeholder}
      iconRender={(visible) =>
        visible ? (
          <img src={EyeOpenIcon} width={19} height={12} />
        ) : (
          <img src={EyeCloseIcon} width={19} height={16} />
        )
      }
    />
  );
}

export default InputFieldSimple;

export const InputField = ({
  placeholder,
  defaultValue,
  label,
  addonAfter,
  inputSelect,
  mb0,
  placeholderBaseColor,
  coloredBg,
  onChange,
  name,
  value,
  type
}) => {
  return (
    <div className={`${style.boxStyle} inputField ${mb0 ? style.mb0 : ""}`}>
      <label htmlFor={name} className={`${style.boxStyle__label}`}>{label}</label>
      <Input
        name={name}
        type={type ? type : "text"}
        value={value}
        onChange={onChange}
        className={`${style.inputField__input} ${inputSelect ? style.inputField__inputSelect : ""
          }  ${placeholderBaseColor ? "placeholderBaseColor" : ""} ${coloredBg ? style.inputField__coloredBg : ""
          }`}
        addonAfter={addonAfter}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </div>
  );
};

export const InputFieldOnly = ({
  placeholder,
  label,
  minHeight,
  placeholderBaseColor,
  coloredBg,
  onChange,
  name,
  value,
  type
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
      />
    </div>
  );
};
