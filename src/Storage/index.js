import browser from "webextension-polyfill";

const getLocalStorage = async (key) => {

        const localState = await browser.storage.local.get(key);
        return localState[key] ? localState : null;
}

const setLocalStorage = async (data) => {
    const status = await browser.storage.local.set(data);
    return status;
}


export const setSessionStorage = data => {
    return new Promise((resolve, reject) => {
        browser.storage.session.set(data)
            .then(res => {
                resolve(true)
                // console.log("Response after setting data in session storage : ", res)
            })
            .catch(err => {
                console.log("error while setting data to session storage : ", err)
                reject(err);
            });
    })
}

export const getSessionStorage = key => {
    return new Promise((resolve, reject) => {
        browser.storage.session.get(key)
            .then(res => {
                // console.log("Response after getting data from session storage : ", res);
                resolve(res[key] ? res : null);
            })
            .catch(err => {
                console.log("error while getting data from session storage : ", err);
                reject(err);
            });

    })
}

export const localStorage = {
    set: setLocalStorage,
    get: getLocalStorage
}

export const sessionStorage = {
    set: setSessionStorage,
    get: getSessionStorage
}