import Browser from "webextension-polyfill";
import { WINDOW_HEIGHT, WINDOW_WIDTH,ERRCODES,ERROR_MESSAGES } from "../Constants";
import { log, hasLength, isString, isNumber } from "../Utility/utility";
import {isNullorUndef} from "../Utility/utility";
import { Error, ErrorPayload } from "../Utility/error_helper";


//Handle the window and notification creation
export default class WindowManager {
  static instance = null;

  constructor(bindCloseEvent) {
    this.addOnRemovedListener(bindCloseEvent);
  }

  //Get instance from builder function
  static getInstance(bindCloseEvent) {
    if(!WindowManager.instance) {
      WindowManager.instance = new WindowManager(bindCloseEvent);

      delete WindowManager.constructor;
    }
    return WindowManager.instance
  }


  /**
   * Mark the notification popup as having been automatically closed.
   *
   * This lets us differentiate between the cases where we close the
   * notification popup v.s. when the user closes the popup window directly.
   */
  markAsAutomaticallyClosed = () => {
    this._popupAutomaticallyClosed = true;
  }

  /**
   * Either brings an existing MetaMask notification window into focus, or creates a new notification window. New
   * notification windows are given a 'popup' type.
   *
   */
  showPopup = async (route = "") => {


      //position control's
      let left = 0;
      let top = 0;
      
      try {
        const lastFocused = await this.getLastFocusedWindow();

        // Position window in top right corner of lastFocused window.
        top = lastFocused.top;
        left = lastFocused.left + (lastFocused.width - WINDOW_WIDTH);

      } catch (e) {
        // The following properties are more than likely 0, due to being
        // opened from the background chrome process for the extension that
        // has no physical dimensions
        const { screenX, screenY, outerWidth } = window;
        top = Math.max(screenY, 0);
        left = Math.max(screenX + (outerWidth - WINDOW_WIDTH), 0);
      }
      
      const extensionURL = Browser.runtime.getURL("index.html") + `?route=${route}`;


      // create new approval window
      const popupWindow = await this.openWindow({
        url: extensionURL,
        type: "popup",
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        left,
        top
      });

      // Firefox currently ignores left/top for create, but it works for update
      if (popupWindow.left !== left && popupWindow.state !== "fullscreen") {
        await this.updateWindowPosition(popupWindow.id, left, top);
      }

      return popupWindow.id;
  }


  /**
   * get all currently opened window and remove extra windows
   */
  filterAndRemoveWindows = async (filterId) => {
    const allPopupWindows = await this.getAllPopupWindows();
    const otherWindowThanTask = allPopupWindows.filter((item) => item.id !== filterId);
    for(let itemWindow of otherWindowThanTask) this.closePopup(itemWindow.id);
  }

  /**
   * close the current active popup
   * @param {*} popupId 
   */
  closePopup = async (popupId) => {
    await this.closeWindow(popupId);
  }


  /**
   * Checks all open MetaMask windows, and returns the first one it finds that is a notification window (i.e. has the
   * type 'popup')
   *
   * @private
   */
  _getPopup = async () => {
    const windows = await this.getAllWindows();
    return this._getPopupIn(windows);
  }

  /**
   * Given an array of windows, returns the 'popup' that has been opened by MetaMask, or null if no such window exists.
   * @private
   * @param {Array} windows - An array of objects containing data about the open MetaMask extension windows.
   */
  _getPopupIn = (windows) => {
    return windows
      ? windows.find((win) => {
        // Returns notification popup
        return win && win.type === "popup" && win.id === this._popupId;
      })
      : null;
  }




  /************************************ Internal Window Control Methods ************************************/
    //reload the extension
    reload() {
      Browser.runtime.reload();
    }
  
    //open tab
    async openTab(options) {
      const newTab = await Browser.tabs.create(options);
      return newTab;
    }
  
    //open window
    async openWindow(options) {
      const newWindow = await Browser.windows.create(options);
      return newWindow;
    }
  
    //close window
    async closeWindow(windowId) {
      await Browser.windows.remove(windowId);
  
    }

    //get the window using the window id
    async getWindowById(windowId) {
      try {
        const window = await Browser.windows.get(windowId);
        return window;
      } catch (err) {
        return null;
      }
    }
  
    //focus on window 
    async focusWindow(windowId) {
      await Browser.windows.update(windowId, { focused: true });
    }
  
    //update window position
    async updateWindowPosition(windowId, left, top) {
      await Browser.windows.update(windowId, { left, top });
    }
  
    //get all windows
    async getAllPopupWindows() {
      const allWindows = await Browser.windows.getAll({windowTypes: ['popup']});
      return allWindows;
    }

    //get the last focus window
    async getLastFocusedWindow() {
      const windowObject = await Browser.windows.getLastFocused();
      return windowObject;
    }
  
    //close the current window
    async closeCurrentWindow() {
      const windowDetails = await Browser.windows.getCurrent();
      Browser.windows.remove(windowDetails.id);
    }
  
    //get the app version
    getVersion() {
      const { version, version_name: versionName } =
        Browser.runtime.getManifest();
  
      const versionParts = version.split(".");
      if (versionName) {
        if (versionParts.length < 4) {
          throw new Error(`Version missing build number: '${version}'`);
        }
        // On Chrome, a more descriptive representation of the version is stored in the
        // `version_name` field for display purposes. We use this field instead of the `version`
        // field on Chrome for non-main builds (i.e. Flask, Beta) because we want to show the
        // version in the SemVer-compliant format "v[major].[minor].[patch]-[build-type].[build-number]",
        // yet Chrome does not allow letters in the `version` field.
        return versionName;
        // A fourth version part is sometimes present for "rollback" Chrome builds
      } else if (![3, 4].includes(versionParts.length)) {
        throw new Error(`Invalid version: ${version}`);
      } else if (versionParts[2].match(/[^\d]/u)) {
        // On Firefox, the build type and build version are in the third part of the version.
        const [major, minor, patchAndPrerelease] = versionParts;
        const matches = patchAndPrerelease.match(/^(\d+)([A-Za-z]+)(\d)+$/u);
        if (isNullorUndef(matches)) {
          throw new Error(`Version contains invalid prerelease: ${version}`);
        }
        const [, patch, buildType, buildVersion] = matches;
        return `${major}.${minor}.${patch}-${buildType}.${buildVersion}`;
      }
  
      // If there is no `version_name` and there are only 3 or 4 version parts, then this is not a
      // prerelease and the version requires no modification.
      return version;
    }
  
    //get the platform (os) information
    getPlatformInfo(cb) {
      try {
        const platformInfo = Browser.runtime.getPlatformInfo();
        cb(platformInfo);
        return;
      } catch (e) {
        cb(e);
        // eslint-disable-next-line no-useless-return
        return;
      }
    }
  
    //add the listner for close btn
    addOnRemovedListener(listener) {
     const hasListner = Browser.windows.onRemoved.hasListeners((id) => {log("Here is the has listner callback: ", id)})

        if(!hasListner) {
          Browser.windows.onRemoved.addListener(listener);
        }
  
    }
  
    //get all windows
    async getAllWindows() {
      const windows = await Browser.windows.getAll();
      return windows;
    }
  
    //get active tab
    async getActiveTabs() {
      const tabs = await Browser.tabs.query({ active: true });
      return tabs;
    }
  
    //get current active tab
    async currentTab() {
      const tab = await Browser.tabs.getCurrent();
      return tab;
    }
  
    //switch between tabs
    async switchToTab(tabId) {
      const tab = await Browser.tabs.update(tabId, { highlighted: true });
      return tab;
    }
  
    //close a tab using tabId
    async closeTab(tabId) {
      await Browser.tabs.remove(tabId);
    }
}

//manage the notification's and bedge's
export class NotificationAndBedgeManager {
  static instance = null;

  //get the already created instance
  static getInstance = () => {
      if(!NotificationAndBedgeManager.instance) {
        NotificationAndBedgeManager.instance = new NotificationAndBedgeManager();
        delete NotificationAndBedgeManager.constructor;
      }
      return NotificationAndBedgeManager.instance
  }

  //show extension notifications
  showNotification(message, title = "5ire", type = "basic") {
    
    if(!isString(message) && !hasLength(message)) new Error(new ErrorPayload(ERRCODES.CHECK_FAIL, ERROR_MESSAGES.INVALID_TYPE)).throw();
      
    Browser.notifications.create("", {
            iconUrl: Browser.runtime.getURL("logo192.png"),
            message,
            title,
            type,
          });
  }

  //show the bedge on extension icon
  showBedge(bedgeMessage) {
    const isNum = isNumber(bedgeMessage);
    Browser.action.setBadgeText({text: isNum ? bedgeMessage > 0 ? String(bedgeMessage) : "" : bedgeMessage });
  }
}