import { RESTRICTED_FOR_CONTENT_SCRIPT } from "../Constants";
import { InjectedScript } from "./injected-helper";

(() => {
  if(window.location.origin.includes(RESTRICTED_FOR_CONTENT_SCRIPT)) return;

  //inject the provider and setup injected stream message passing
  InjectedScript.initInjectedScript();
})();
