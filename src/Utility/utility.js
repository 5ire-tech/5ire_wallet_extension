import { ERROR_MESSAGES } from "../Constants";

//check if something is string or not
export function isString(arg) {
    return typeof (arg) === "string";
}

//check if something is string or not
export function isObject(arg) {
    return typeof (arg) === "object";
}

//check if something is undefined or null
export function isNullorUndef(arg) {
    return arg === undefined || arg === null
}

//check if string or array has length
export function isHasLength(arg) {
    if (isString(arg)) return arg.trim().length > 0;
    return arg.length > 0
}

//check if object has the given property
export function hasProperty(arg, key) {
    if (isObject(arg)) {
        return arg.hasOwnProperty(key)
    }
    throw new Error(ERROR_MESSAGES.UNDEF_PROPERTY)
}



export const shortLongAddress = (data = '', startLen = 10, endLen = 10) => {
    return `${data.substring(0, startLen)}...${data.substring(data.length - endLen, data.length)}`;
};