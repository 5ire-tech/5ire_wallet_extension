import {isUndef} from "./utility";
import Browser from "webextension-polyfill";

//close the currently opened poup and tab window
export const closeBoth = (onlyPopupClose=false) => {
    try {
    const extPopUp = Browser.extension.getViews({type: "popup"});

    if(onlyPopupClose) {
        extPopUp[0].close();
        return;
    }

    const  extTab = Browser.extension.getViews({type: "tab"});
    const windows = [...extPopUp, ...extTab]

    //close all currently opened windows
    windows.forEach((item) => item.close());

    } catch (err) {
        console.log("Issue while closing the both windows: ", err);
    }
}

//set the route and window control in storage
export const setWindowControl = async (popupRoute, popupStatus) => {
    try {
        !isUndef(popupRoute) && await Browser.storage.local.set({popupRoute: popupRoute})
        !isUndef(popupStatus) && await Browser.storage.local.set({ popupStatus: popupStatus });
    } catch (err) {
        console.log("Error while saving the control settings: ", err);
    }
}