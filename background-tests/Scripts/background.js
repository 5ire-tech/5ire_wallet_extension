"use strict";

var _initbackground = require("./initbackground");
var _utils = require("./utils");
var _Constants = require("../Constants");
var _error_helper = require("../Utility/error_helper");
try {
  (0, _utils.bindNoExponentWithNumber)();
  //init the background events
  _initbackground.InitBackground.initBackground();
} catch (err) {
  console.log("Error in Background Worker: ", err);
  _initbackground.ExtensionEventHandle.eventEmitter.emit(_Constants.INTERNAL_EVENT_LABELS.ERROR, new _error_helper.ErrorPayload(_Constants.ERRCODES.INTERNAL, err.message));
}