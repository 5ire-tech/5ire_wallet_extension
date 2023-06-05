"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.NotificationAndBedgeManager = void 0;
var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));
var _utility = require("../Utility/utility");
var _error_helper = require("../Utility/error_helper");
var _Constants = require("../Constants");
var _utils = require("./utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
//Handle the window and notification creation
class WindowManager {
  constructor(windowCloseCallback, windowCreateCallback, windowFocusChangeEvent, tabsChangeEvent, tabUpdateEvent) {
    var _this = this;
    /**
     * Mark the notification popup as having been automatically closed.
     *
     * This lets us differentiate between the cases where we close the
     * notification popup v.s. when the user closes the popup window directly.
     */
    _defineProperty(this, "markAsAutomaticallyClosed", () => {
      this._popupAutomaticallyClosed = true;
    });
    /**
     * Either brings an existing MetaMask notification window into focus, or creates a new notification window. New
     * notification windows are given a 'popup' type.
     *
     */
    _defineProperty(this, "showPopup", async function () {
      let route = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      console.log("Route", route);
      //position control's
      let left = 0;
      let top = 0;
      if (_this.popupId) {
        _this.focusWindow(_this.popupId);
        return;
      }
      try {
        const lastFocused = await _this.getLastFocusedWindow();

        // Position window in top right corner of lastFocused window.
        top = lastFocused.top;
        left = lastFocused.left + (lastFocused.width - _Constants.WINDOW_WIDTH);
      } catch (e) {
        // The following properties are more than likely 0, due to being
        // opened from the background chrome process for the extension that
        // has no physical dimensions
        const {
          screenX,
          screenY,
          outerWidth
        } = window;
        top = Math.max(screenY, 0);
        left = Math.max(screenX + (outerWidth - _Constants.WINDOW_WIDTH), 0);
      }
      const extensionURL = _webextensionPolyfill.default.runtime.getURL("index.html");

      // create new approval window
      const popupWindow = await _this.openWindow({
        url: extensionURL,
        type: "popup",
        width: _Constants.WINDOW_WIDTH,
        height: _Constants.WINDOW_HEIGHT,
        left,
        top
      });

      // Firefox currently ignores left/top for create, but it works for update
      if (popupWindow.left !== left && popupWindow.state !== "fullscreen") {
        await _this.updateWindowPosition(popupWindow.id, left, top);
      }

      // Firefox currently ignores left/top for create, but it works for update
      if (popupWindow.left !== left && popupWindow.state !== "fullscreen") {
        await _this.updateWindowPosition(popupWindow.id, left, top);
      }
      return popupWindow.id;
    });
    /**
     * get all currently opened window and remove extra windows
     */
    _defineProperty(this, "filterAndRemoveWindows", async (filterId, isRemoveAll) => {
      const allPopupWindows = await this.getAllPopupWindows();
      if (isRemoveAll) {
        for (let itemWindow of allPopupWindows) await this.closePopup(itemWindow.id);
        return;
      }
      const otherWindowThanTask = allPopupWindows.filter(item => item.id !== filterId);
      for (let itemWindow of otherWindowThanTask) await this.closePopup(itemWindow.id);
    });
    /**
     * close the current active popup
     * @param {*} popupId
     */
    _defineProperty(this, "closePopup", async popupId => {
      await this.closeWindow(popupId);
    });
    /**
     * Checks all open MetaMask windows, and returns the first one it finds that is a notification window (i.e. has the
     * type 'popup')
     *
     * @private
     */
    _defineProperty(this, "_getPopup", async () => {
      const windows = await this.getAllWindows();
      return this._getPopupIn(windows);
    });
    /**
     * Given an array of windows, returns the 'popup' that has been opened by MetaMask, or null if no such window exists.
     * @private
     * @param {Array} windows - An array of objects containing data about the open MetaMask extension windows.
     */
    _defineProperty(this, "_getPopupIn", windows => {
      return windows ? windows.find(win => {
        // Returns notification popup
        return win && win.type === "popup" && win.id === this._popupId;
      }) : null;
    });
    this.addOnRemovedListener(windowCloseCallback);
    this.addOnWindowCreateListner(windowCreateCallback);
    this.addWindowFocusChangeListner(windowFocusChangeEvent);
    this.addTabChangeListner(tabsChangeEvent);
    this.addTabUpdateListner(tabUpdateEvent);
  }

  //Get instance from builder function
  static getInstance(windowCloseCallback, windowCreateCallback, windowFocusChangeEvent, tabsChangeEvent, tabUpdateEvent) {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager(windowCloseCallback, windowCreateCallback, windowFocusChangeEvent, tabsChangeEvent, tabUpdateEvent);
      delete WindowManager.constructor;
    }
    return WindowManager.instance;
  }
  /************************************ Internal Window Control Methods ************************************/ //reload the extension
  reload() {
    _webextensionPolyfill.default.runtime.reload();
  }

  //open tab
  async openTab(options) {
    const newTab = await _webextensionPolyfill.default.tabs.create(options);
    return newTab;
  }

  //open window
  async openWindow(options) {
    const newWindow = await _webextensionPolyfill.default.windows.create(options);
    return newWindow;
  }

  //close window
  async closeWindow(windowId) {
    await _webextensionPolyfill.default.windows.remove(windowId);
  }

  //get the window using the window id
  async getWindowById(windowId) {
    try {
      const window = await _webextensionPolyfill.default.windows.get(windowId);
      return window;
    } catch (err) {
      return null;
    }
  }

  //focus on window
  async focusWindow(windowId) {
    await _webextensionPolyfill.default.windows.update(windowId, {
      focused: true
    });
  }

  //update window position
  async updateWindowPosition(windowId, left, top) {
    await _webextensionPolyfill.default.windows.update(windowId, {
      left,
      top
    });
  }

  //get all windows
  async getAllPopupWindows() {
    const allWindows = await _webextensionPolyfill.default.windows.getAll({
      windowTypes: ["popup"]
    });
    return allWindows;
  }

  //get the last focus window
  async getLastFocusedWindow() {
    const windowObject = await _webextensionPolyfill.default.windows.getLastFocused();
    return windowObject;
  }

  //close the current window
  async closeCurrentWindow() {
    const windowDetails = await _webextensionPolyfill.default.windows.getCurrent();
    _webextensionPolyfill.default.windows.remove(windowDetails.id);
  }

  //get the app version
  getVersion() {
    const {
      version,
      version_name: versionName
    } = _webextensionPolyfill.default.runtime.getManifest();
    const versionParts = version.split(".");
    if (versionName) {
      if (versionParts.length < 4) {
        throw new _error_helper.Error(`Version missing build number: '${version}'`);
      }
      // On Chrome, a more descriptive representation of the version is stored in the
      // `version_name` field for display purposes. We use this field instead of the `version`
      // field on Chrome for non-main builds (i.e. Flask, Beta) because we want to show the
      // version in the SemVer-compliant format "v[major].[minor].[patch]-[build-type].[build-number]",
      // yet Chrome does not allow letters in the `version` field.
      return versionName;
      // A fourth version part is sometimes present for "rollback" Chrome builds
    } else if (![3, 4].includes(versionParts.length)) {
      throw new _error_helper.Error(`Invalid version: ${version}`);
    } else if (versionParts[2].match(/[^\d]/u)) {
      // On Firefox, the build type and build version are in the third part of the version.
      const [major, minor, patchAndPrerelease] = versionParts;
      const matches = patchAndPrerelease.match(/^(\d+)([A-Za-z]+)(\d)+$/u);
      if ((0, _utility.isNullorUndef)(matches)) {
        throw new _error_helper.Error(`Version contains invalid prerelease: ${version}`);
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
      const platformInfo = _webextensionPolyfill.default.runtime.getPlatformInfo();
      cb(platformInfo);
      return;
    } catch (e) {
      cb(e);
      // eslint-disable-next-line no-useless-return
      return;
    }
  }

  //add the listner for close btn
  addOnRemovedListener(cb) {
    _webextensionPolyfill.default.windows.onRemoved.addListener(cb);
  }

  //add the listner for create window event
  addOnWindowCreateListner(cb) {
    _webextensionPolyfill.default.windows.onCreated.addListener(cb);
  }

  //add window focus change listner
  addWindowFocusChangeListner(cb) {
    _webextensionPolyfill.default.windows.onFocusChanged.addListener(cb);
  }

  //add Tab change listner
  addTabChangeListner(cb) {
    _webextensionPolyfill.default.tabs.onActivated.addListener(cb);
  }

  //add event for tab update event
  addTabUpdateListner(cb) {
    _webextensionPolyfill.default.tabs.onUpdated.addListener(cb);
  }

  //get all windows
  async getAllWindows() {
    const windows = await _webextensionPolyfill.default.windows.getAll();
    return windows;
  }

  //get active tab
  async getActiveTabs() {
    const tabs = await _webextensionPolyfill.default.tabs.query({
      active: true
    });
    return tabs;
  }

  //get current active tab
  async currentTab() {
    const tab = await _webextensionPolyfill.default.tabs.getCurrent();
    return tab;
  }

  //switch between tabs
  async switchToTab(tabId) {
    const tab = await _webextensionPolyfill.default.tabs.update(tabId, {
      highlighted: true
    });
    return tab;
  }

  //close a tab using tabId
  async closeTab(tabId) {
    await _webextensionPolyfill.default.tabs.remove(tabId);
  }
}

//manage the notification's and bedge's
exports.default = WindowManager;
_defineProperty(WindowManager, "instance", null);
class NotificationAndBedgeManager {
  //show extension notifications
  showNotification(message) {
    let title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "5ire";
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "basic";
    if (!(0, _utility.isString)(message) && !(0, _utility.hasLength)(message)) new _error_helper.Error(new _error_helper.ErrorPayload(_Constants.ERRCODES.CHECK_FAIL, _Constants.ERROR_MESSAGES.INVALID_TYPE)).throw();
    _webextensionPolyfill.default.notifications.create("", {
      iconUrl: _webextensionPolyfill.default.runtime.getURL("logo192.png"),
      message,
      title,
      type
    });
  }

  //show the bedge on extension icon
  showBedge(bedgeMessage) {
    const isNum = (0, _utility.isNumber)(bedgeMessage);
    const actionKey = _utils.isManifestV3 ? "action" : "browserAction";
    _webextensionPolyfill.default[actionKey].setBadgeText({
      text: isNum ? bedgeMessage > 0 ? String(bedgeMessage) : "" : bedgeMessage
    });
  }
}
exports.NotificationAndBedgeManager = NotificationAndBedgeManager;
_defineProperty(NotificationAndBedgeManager, "instance", null);
//get the already created instance
_defineProperty(NotificationAndBedgeManager, "getInstance", () => {
  if (!NotificationAndBedgeManager.instance) {
    NotificationAndBedgeManager.instance = new NotificationAndBedgeManager();
    delete NotificationAndBedgeManager.constructor;
  }
  return NotificationAndBedgeManager.instance;
});