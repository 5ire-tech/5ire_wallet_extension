import { RESTRICTED_FOR_CONTENT_SCRIPT } from "../Constants";
import { ContentJS } from "./contentjs-helper";

(() => {
  /**
   * content-script is injected inside the extension popup also and it subscribe to all event
   * eg window.onMessage events throw WindowPostMessageStream and when someone opned the main
   * extension popup and perform some operation that include approval window then the extension event handler
   * and the page event handler both send the same message to background due to this background open
   * open double popup approval window that cause some unwanted bugs inside extension
   */
  if (window.location.origin.includes(RESTRICTED_FOR_CONTENT_SCRIPT)) return;

  //init the content-script
  ContentJS.initContentScript();
})();
