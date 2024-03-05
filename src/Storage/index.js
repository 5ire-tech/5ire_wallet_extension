import browser from "webextension-polyfill";
import { isManifestV3 } from "../Scripts/utils";

const getLocalStorage = async (key) => {
  const localState = await browser.storage.local.get(key);
  return localState[key] ? localState : null;
};

const setLocalStorage = async (data) => {
  const status = await browser.storage.local.set(data);
  return status;
};

export const clearAllStorage = async () => {
  await browser.storage.local.clear();
  if (isManifestV3) await browser.storage.session.clear();
};

export const setSessionStorage = (data) => {
  return new Promise((resolve, reject) => {
    browser.storage.session
      .set(data)
      .then((res) => {
        resolve(res);
        // console.log("Response after setting data in session storage : ", res)
      })
      .catch((err) => {
        console.log("error while setting data to session storage : ", err);
        reject(err);
      });
  });
};

export const getSessionStorage = (key) => {
  return new Promise((resolve, reject) => {
    browser.storage.session
      .get(key)
      .then((res) => {
        resolve(res[key] ? res : null);
      })
      .catch((err) => {
        console.log("error while getting data from session storage : ", err);
        reject(err);
      });
  });
};

export const localStorage = {
  set: setLocalStorage,
  get: getLocalStorage
};

export const sessionStorage = {
  set: isManifestV3 ? setSessionStorage : setLocalStorage,
  get: isManifestV3 ? getSessionStorage : getLocalStorage
};
