import Browser from "webextension-polyfill";
import { setUIdata } from "../Utility/redux_helper";
import { setWindowControl, closeBoth } from "../Utility/window.helper";
import { WINDOW_HEIGHT, WINDOW_WIDTH } from "../Constants";
import { log } from "../Utility/utility";
import {isNullorUndef} from "../Utility/utility";


//extension window controller
export class ExtensionPlatform {

  static windows = [];
  static instance = null;


  //get the class instance from builder function
  static getInstance = () => {
      if(!ExtensionPlatform.instance) {
        ExtensionPlatform.instance = new ExtensionPlatform();
        delete ExtensionPlatform.constructor;
      }
      return ExtensionPlatform.instance
  }

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
    ExtensionPlatform.windows.push(newWindow);
    return newWindow;
  }

  //focus on window 
  async focusWindow(windowId) {
    await Browser.windows.update(windowId, { focused: true });
  }

  //update window position
  async updateWindowPosition(windowId, left, top) {
    await Browser.windows.update(windowId, { left, top });
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
    Browser.windows.onRemoved.addListener(listener);
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



/**
 * A collection of methods for controlling the showing and hiding of the notification popup.
 */
export default class NotificationManager {

  static instance = null;

  constructor(store) {
    this.platform = ExtensionPlatform.getInstance();
    this.platform.addOnRemovedListener(this._onWindowClosed.bind(this));
    this.store = store;
  }


  //Get instance from builder function
  static getInstance(store) {
    if(!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager(store);
      delete NotificationManager.constructor;
    }
    return NotificationManager.instance
  }


  /**
   * Mark the notification popup as having been automatically closed.
   *
   * This lets us differentiate between the cases where we close the
   * notification popup v.s. when the user closes the popup window directly.
   */
  markAsAutomaticallyClosed() {
    this._popupAutomaticallyClosed = true;
  }

  /**
   * Either brings an existing MetaMask notification window into focus, or creates a new notification window. New
   * notification windows are given a 'popup' type.
   *
   */
  async showPopup(route = "") {

    route === "nativeTx" && Browser.runtime.sendMessage({ type: "CLOSEMAIN" });
    const status = await Browser.storage.local.get("popupStatus");
    const state = this.store.getState();

    if (status.popupStatus) {
      Browser.tabs.sendMessage(state?.auth?.uiData?.tabId, {
        id: state?.auth?.uiData?.id,
        response: null,
        error: "5ire extension transaction approve popup session is already active",
      });
      return;
    }

    //ensure only 1 instance of popup is opened
    //save the currently active popup route
    await setWindowControl(route, true)
    const popup = await this._getPopup();

    // Bring focus to chrome popup
    if (popup) {
      // bring focus to existing chrome popup
      await this.platform.focusWindow(popup.id);
    } else {

      //position control's
      let left = 0;
      let top = 0;
      
      try {
        const lastFocused = await this.platform.getLastFocusedWindow();

        log("Last focus window: ", lastFocused);

        // Position window in top right corner of lastFocused window.
        top = lastFocused.top;
        left = lastFocused.left + (lastFocused.width - WINDOW_WIDTH);

      } catch (_) {
        // The following properties are more than likely 0, due to being
        // opened from the background chrome process for the extension that
        // has no physical dimensions
        const { screenX, screenY, outerWidth } = window;
        top = Math.max(screenY, 0);
        left = Math.max(screenX + (outerWidth - WINDOW_WIDTH), 0);
      }
      const extensionURL = Browser.runtime.getURL("index.html");

      // create new approval window
      const popupWindow = await this.platform.openWindow({
        url: extensionURL + `?route=${route}`,
        type: "popup",
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        left,
        top
      });

      log("all window here: ", ExtensionPlatform.windows);
      log("condition to be true: ", popupWindow.left !== left && popupWindow.state !== "fullscreen")

      // Firefox currently ignores left/top for create, but it works for update
      if (popupWindow.left !== left && popupWindow.state !== "fullscreen") {
        await this.platform.updateWindowPosition(popupWindow.id, left, top);
      }

      this._popupId = popupWindow.id;
      console.log("pop id is here: ", this._popupId);
    }

  }


  //internal listner for window close
  async _onWindowClosed(windowId) {


    console.log("closed here: ", windowId);

    if (windowId === this._popupId) {

      //set the window control property
      await setWindowControl(null,false)

      this._popupId = undefined;
      this._popupAutomaticallyClosed = undefined;
      this.handleClose()

    }
  }

  //handle the window close
  handleClose() {
    const state = this.store.getState();
    const method = state?.auth.uiData?.message?.method;
    const conntectMethods = ["eth_requestAccounts",
      "eth_accounts",
      "connect"];


    //for connect permission rejection evm
    if (conntectMethods.indexOf('method') > -1) {
      Browser.tabs.sendMessage(state?.auth?.uiData?.tabId, {
        id: state?.auth.uiData?.id,
        response: null,
        error: "User rejected connect permission.",

      });

      //for transaction permission rejection evm
    } else if (method === 'eth_sendTransaction') {
      Browser.tabs.sendMessage(state?.auth?.uiData?.tabId, {
        id: state?.auth?.uiData?.id,
        response: null,
        error: "User rejected  transaction.",
      });

    }


    //for all other permission rejection
    Browser.tabs.sendMessage(state?.auth?.uiData?.tabId, {
      id: state?.auth.uiData?.id,
      response: null,
      error: "Action rejected by the user",
    });

    this.store.dispatch(setUIdata({}))

  }


  /**
   * Checks all open MetaMask windows, and returns the first one it finds that is a notification window (i.e. has the
   * type 'popup')
   *
   * @private
   */
  async _getPopup() {
    const windows = await this.platform.getAllWindows();
    return this._getPopupIn(windows);
  }

  /**
   * Given an array of windows, returns the 'popup' that has been opened by MetaMask, or null if no such window exists.
   *
   * @private
   * @param {Array} windows - An array of objects containing data about the open MetaMask extension windows.
   */
  _getPopupIn(windows) {
    return windows
      ? windows.find((win) => {
        // Returns notification popup
        return win && win.type === "popup" && win.id === this._popupId;
      })
      : null;
  }
}
