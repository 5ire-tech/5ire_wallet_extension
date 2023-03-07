//check if something is string or not
export function isString(arg) {
    return typeof(arg) === "string";
}

//check if something is string or not
export function isObject(arg) {
    return typeof(arg) === "object";
}

//check if something is undefined or null
export function isNullorUndef(arg) {
    return arg === undefined || arg === null
}

//check if string or array has length
export function isHasLength(arg) {
    if(isString(arg)) return arg.trim().length > 0;
    return arg.length > 0
}