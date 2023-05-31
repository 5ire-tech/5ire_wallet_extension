import { v4 as uuid4 } from "uuid";
import { EMTY_STR } from "../Constants";
import Browser from "webextension-polyfill";
import { isNullorUndef } from "../Utility/utility";

export const getUrlOrigin = (url) => {
  return new URL(url).origin;
};

//get the current tab details
export const getCurrentTabDetails = async () => {
  const queryInfo = { active: true };
  const tabsDetails = await Browser.tabs.query(queryInfo);
  if (!tabsDetails[0]?.url) return null;
  return { tabId: tabsDetails[0]?.id, tabUrl: getUrlOrigin(tabsDetails[0]?.url) };
};

//bind the noExponents function with the Number Constructor
export const bindNoExponentWithNumber = () => {
  // eslint-disable-next-line no-extend-native
  Number.prototype.noExponents = function () {
    try {
      var data = String(this).split(/[eE]/);
      if (data.length === 1) return data[0];
      var z = EMTY_STR,
        sign = this < 0 ? "-" : EMTY_STR,
        str = data[0].replace(".", EMTY_STR),
        mag = Number(data[1]) + 1;
      if (mag < 0) {
        z = sign + "0.";
        while (mag++) z += "0";
        // eslint-disable-next-line no-useless-escape
        return z + str.replace(/^\-/, EMTY_STR);
      }
      mag -= str.length;
      while (mag--) z += "0";
      return str + z;
    } catch (error) {}
  };
};

export const isManifestV3 = Browser.runtime.getManifest().manifest_version === 3;

//tx notification message generator
export const txNotificationStringTemplate = (status, hash, showHashLength = 30) => {
  return `Transaction ${status.toLowerCase()} ${hash.slice(0, showHashLength)}...`;
};

//check if app is already is connected
export const isAlreadyConnected = (connectedApps, origin) => {
  return isNullorUndef(connectedApps[origin]) ? false : connectedApps[origin].isConnected;
};

//get uuid
export const getUUID = () => {
  return uuid4();
};
