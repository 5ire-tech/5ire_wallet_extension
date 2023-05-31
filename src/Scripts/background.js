import { InitBackground } from "./initbackground";
import { bindNoExponentWithNumber } from "./utils";
import { ExtensionEventHandle } from "./initbackground";
import { ERRCODES, INTERNAL_EVENT_LABELS } from "../Constants";
import { ErrorPayload } from "../Utility/error_helper";

try {
  bindNoExponentWithNumber();
  //init the background events
  InitBackground.initBackground();
} catch (err) {
  console.log("Error in Background Worker: ", err);
  ExtensionEventHandle.eventEmitter.emit(
    INTERNAL_EVENT_LABELS.ERROR,
    new ErrorPayload(ERRCODES.INTERNAL, err.message)
  );
}
