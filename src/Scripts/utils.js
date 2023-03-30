import Browser from "webextension-polyfill";
import { EMTY_STR } from "../Constants";

export const getBaseUrl = (url) => {
  const pathArray = url.split("/");
  const protocol = pathArray[0];
  const host = pathArray[2];
  return protocol + "//" + host;
};

export const getCurrentTabUrl = (callback) => {
  const queryInfo = { active: true, currentWindow: true };

  Browser.tabs.query(queryInfo).then((tabs) => {
    callback(getBaseUrl(tabs[0]?.url));
  });
};

export const getCurrentTabUId = (callback) => {
  const queryInfo = { active: true, currentWindow: true };

  Browser.tabs.query(queryInfo).then((tabs) => {
    callback(tabs[0].id);
  });
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
  } catch (error) {

  }
};
}

export const isManifestV3 = Browser.runtime.getManifest().manifest_version === 3;

//tx notification message generator
export const txNotificationStringTemplate = (status, hash, showHashLength = 30) => {
  return (`Transaction ${status.toLowerCase()} ${hash.slice(0, showHashLength)}...`);
}
