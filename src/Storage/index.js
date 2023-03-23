import browser from "webextension-polyfill";

const getLocalStorage = key => {
    return new Promise((resolve, reject) => {

        browser.storage.local.get(key)
        .then(res => {
            // console.log("Response after getting data from local storage : ", res);
            resolve(res[key]? res : null);
        })
        .catch(err => {
            // console.log("error while getting data from local storage : ", err);
            reject(err);
        });

    });
}

const setLocalStorage = data => {
    return new Promise((resolve, reject) => {
        
        browser.storage.local.set(data)
        .then(res => {
            // console.log("Response after setting data in local storage : ", res);
            resolve(true);
        })
        .catch(err => {
            // console.log("error while setting data to local storage : ", err);
            reject(err);
        });
    });
}

export const setSessionStorage = data => {
    browser.storage.session.set(data)
    .then(res => {
        // console.log("Response after setting data in session storage : ", res)
    })
    .catch(err => {
        // console.log("error while setting data to session storage : ", err)
    });
}

export const getSessionStorage = key => {
    new Promise((resolve, reject) => {

        browser.storage.local.get(key)
        .then(res => {
            // console.log("Response after getting data from session storage : ", res);
            resolve(res);
        })
        .catch(err => {
            // console.log("error while getting data from session storage : ", err);
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