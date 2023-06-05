"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setSessionStorage = exports.sessionStorage = exports.localStorage = exports.getSessionStorage = void 0;
var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));
var _utils = require("../Scripts/utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const getLocalStorage = async key => {
  const localState = await _webextensionPolyfill.default.storage.local.get(key);
  return localState[key] ? localState : null;
};
const setLocalStorage = async data => {
  const status = await _webextensionPolyfill.default.storage.local.set(data);
  return status;
};
const setSessionStorage = data => {
  return new Promise((resolve, reject) => {
    _webextensionPolyfill.default.storage.session.set(data).then(res => {
      resolve(res);
      // console.log("Response after setting data in session storage : ", res)
    }).catch(err => {
      console.log("error while setting data to session storage : ", err);
      reject(err);
    });
  });
};
exports.setSessionStorage = setSessionStorage;
const getSessionStorage = key => {
  return new Promise((resolve, reject) => {
    _webextensionPolyfill.default.storage.session.get(key).then(res => {
      resolve(res[key] ? res : null);
    }).catch(err => {
      console.log("error while getting data from session storage : ", err);
      reject(err);
    });
  });
};
exports.getSessionStorage = getSessionStorage;
const localStorage = {
  set: setLocalStorage,
  get: getLocalStorage
};
exports.localStorage = localStorage;
const sessionStorage = {
  set: _utils.isManifestV3 ? setSessionStorage : setLocalStorage,
  get: _utils.isManifestV3 ? getSessionStorage : getLocalStorage
};
exports.sessionStorage = sessionStorage;