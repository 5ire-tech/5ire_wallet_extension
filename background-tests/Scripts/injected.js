"use strict";

var _Constants = require("../Constants");
var _injectedHelper = require("./injected-helper");
(() => {
  if (window.location.origin.includes(_Constants.RESTRICTED_FOR_CONTENT_SCRIPT)) return;

  //inject the provider and setup injected stream message passing
  _injectedHelper.InjectedScript.initInjectedScript();
})();