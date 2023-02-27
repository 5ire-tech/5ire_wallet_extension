import Browser from "webextension-polyfill";
import { setUIdata } from "../Store/reducer/auth";

export class ExtensionPlatform {
  //
  // Public
  //
  reload() {
    Browser.runtime.reload();
  }

  async openTab(options) {
    const newTab = await Browser.tabs.create(options);
    return newTab;
  }

  async openWindow(options) {
    const newWindow = await Browser.windows.create(options);
    return newWindow;
  }

  async focusWindow(windowId) {
    await Browser.windows.update(windowId, { focused: true });
  }

  async updateWindowPosition(windowId, left, top) {
    await Browser.windows.update(windowId, { left, top });
  }

  async getLastFocusedWindow() {
    const windowObject = await Browser.windows.getLastFocused();
    return windowObject;
  }

  async closeCurrentWindow() {
    const windowDetails = await Browser.windows.getCurrent();
    Browser.windows.remove(windowDetails.id);
  }

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
      if (matches === null) {
        throw new Error(`Version contains invalid prerelease: ${version}`);
      }
      const [, patch, buildType, buildVersion] = matches;
      return `${major}.${minor}.${patch}-${buildType}.${buildVersion}`;
    }

    // If there is no `version_name` and there are only 3 or 4 version parts, then this is not a
    // prerelease and the version requires no modification.
    return version;
  }

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

  addOnRemovedListener(listener) {
    Browser.windows.onRemoved.addListener(listener);
  }

  async getAllWindows() {
    const windows = await Browser.windows.getAll();
    return windows;
  }

  async getActiveTabs() {
    const tabs = await Browser.tabs.query({ active: true });
    return tabs;
  }

  async currentTab() {
    const tab = await Browser.tabs.getCurrent();
    return tab;
  }

  async switchToTab(tabId) {
    const tab = await Browser.tabs.update(tabId, { highlighted: true });
    return tab;
  }

  async closeTab(tabId) {
    await Browser.tabs.remove(tabId);
  }
}

const NOTIFICATION_HEIGHT = 620;
const NOTIFICATION_WIDTH = 400;

export const NOTIFICATION_MANAGER_EVENTS = {
  POPUP_CLOSED: "onPopupClosed",
};

/**
 * A collection of methods for controlling the showing and hiding of the notification popup.
 */
export default class NotificationManager {
  constructor(store) {
    this.platform = new ExtensionPlatform();
    this.platform.addOnRemovedListener(this._onWindowClosed.bind(this));
    this.store = store;
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

    const popup = await this._getPopup();

    //ensure only 1 instance of popup is opened
    // this.store.dispatch(setTxPopup(true))
    await Browser.storage.local.set({popupStatus: true});

    // Bring focus to chrome popup
    if (popup) {
      // bring focus to existing chrome popup
      await this.platform.focusWindow(popup.id);
    } else {
      let left = 0;
      let top = 0;
      try {
        const lastFocused = await this.platform.getLastFocusedWindow();
        // Position window in top right corner of lastFocused window.
        top = lastFocused.top;
        left = lastFocused.left + (lastFocused.width - NOTIFICATION_WIDTH);
      } catch (_) {
        // The following properties are more than likely 0, due to being
        // opened from the background chrome process for the extension that
        // has no physical dimensions
        const { screenX, screenY, outerWidth } = window;
        top = Math.max(screenY, 0);
        left = Math.max(screenX + (outerWidth - NOTIFICATION_WIDTH), 0);
      }
      const extensionURL = Browser.runtime.getURL("index.html");

      // create new notification popup
      const popupWindow = await this.platform.openWindow({
        url: extensionURL + `?route=${route}`,
        type: "popup",
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        left,
        top,
      });

      // Firefox currently ignores left/top for create, but it works for update
      if (popupWindow.left !== left && popupWindow.state !== "fullscreen") {
        await this.platform.updateWindowPosition(popupWindow.id, left, top);
      }
      this._popupId = popupWindow.id;
    }
  }

  async _onWindowClosed(windowId) {
    // console.log("Yyyyyyyy", windowId, this._popupId)
    if (windowId === this._popupId) {

    //false the current popup if the close button is clicked
    // this.store.dispatch(setTxPopup(false))
    const dataHere = await Browser.storage.local.get("popupStatus");
    console.log("here is your data inside local: ", dataHere);
    await Browser.storage.local.set({popupStatus: false});
    // const hereOutput = await Browser.storage.local.get("popupStatus");

      this._popupId = undefined;
      // this.emit("POPUP_CLOSED", {
      //   automaticallyClosed: this._popupAutomaticallyClosed,
      // });
      this._popupAutomaticallyClosed = undefined;
      this.handleClose()

    }
  }

  handleClose() {
    const state = this.store.getState();
    const method = state?.auth.uiData?.message?.method;
    const conntectMethods = ["eth_requestAccounts",
      "eth_accounts",
      "connect"];
    // console.log("I WAS WAITING FOR MESSAGE")

    if (conntectMethods.indexOf('method') > -1) {
      Browser.tabs.sendMessage(state?.auth?.uiData?.tabId, {
        id: state?.auth.uiData?.id,
        response: null,
        error: "User rejected connect permission.",

      });

    } else if (method === 'eth_sendTransaction') {
      Browser.tabs.sendMessage(state?.auth?.uiData?.tabId, {
        id: state?.auth?.uiData?.id,
        response: null,
        error: "User rejected  transactoin.",
      });

    }
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
