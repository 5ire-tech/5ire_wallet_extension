"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setWindowControl = exports.closeBoth = void 0;
var _utility = require("./utility");
var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//close the currently opened poup and tab window
const closeBoth = function () {
  let onlyPopupClose = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  try {
    const extPopUp = _webextensionPolyfill.default.extension.getViews({
      type: "popup"
    });
    if (onlyPopupClose) {
      extPopUp[0].close();
      return;
    }
    const extTab = _webextensionPolyfill.default.extension.getViews({
      type: "tab"
    });
    const windows = [...extPopUp, ...extTab];

    //close all currently opened windows
    windows.forEach(item => item.close());
  } catch (err) {
    console.log("Issue while closing the both windows: ", err);
  }
};

//set the route and window control in storage
exports.closeBoth = closeBoth;
const setWindowControl = async (popupRoute, popupStatus) => {
  try {
    !(0, _utility.isUndef)(popupRoute) && (await _webextensionPolyfill.default.storage.local.set({
      popupRoute: popupRoute
    }));
    !(0, _utility.isUndef)(popupStatus) && (await _webextensionPolyfill.default.storage.local.set({
      popupStatus: popupStatus
    }));
  } catch (err) {
    console.log("Error while saving the control settings: ", err);
  }
};
exports.setWindowControl = setWindowControl;