import { localStorage, sessionStorage } from ".";
import { isString } from "../Utility/utility";
import { userState } from "../Store/initialState";


//local storage data null safety check
export const getDataLocal = async (key) => {
    try {
        if(!isString(key) && key.trim().length === 0) throw new Error("Query Key is invalid");
        const localState = await localStorage.get(key);

        if(!localState) {
            localStorage.set({state: userState})
            return userState;
        }

        return localState.state;

    } catch (err) {
        console.log("Error while setting and getting state in local storage");
        return null;
    }
}

//session storage data null safety check
export const getDataSession = async (key) => {
    try {
        if(!isString(key) && key.trim().length === 0) throw new Error("Query Key is invalid");
        const sessionState = await sessionStorage.get(key);

        if(!sessionState) {
            sessionStorage.set({state: userState})
            return userState;
        }

        return sessionState.state;

    } catch (err) {
        console.log("Error while setting and getting state in session storage");
        return null;
    }
}
