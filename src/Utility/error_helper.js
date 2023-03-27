import { isObject, hasProperty, isNullorUndef, hasLength } from "./utility";
import { ERROR_MESSAGES, LABELS, ERRCODES } from "../Constants";


//error managing class
export class Error {
    message = null;
    constructor(message) {
        if(!isObject(message)) this.throw(ERROR_MESSAGES.INVAILD_ERROR_MESSAGE)
        if(!hasProperty(message, LABELS.ERRCODE) && !hasProperty(message, LABELS.ERRMESSAGE)) this.throw(ERROR_MESSAGES.INVALID_ERROR_PAYLOAD)
        this.message = message;
    }

    //throw the current error
    throw = (message=null) => {throw new Error(message || this.message)}
    //return the current error
    createError = (message=null) => new Error(message || this.message)
}


//error payload creator
export class ErrorPayload {
    errCode = null
    errMessage = null
    
    constructor(errCode, errMessage) {

        if(isNullorUndef(errCode) && isNullorUndef(errMessage) && !hasLength(errMessage)) new Error(new ErrorPayload(ERRCODES.CHECK_FAIL, ERROR_MESSAGES.INVALID_ERROR_PAYLOAD)).throw();

        this.errCode = errCode
        this.errMessage = errMessage
    }
}