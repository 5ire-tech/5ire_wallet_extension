import { InitBackground } from "./initbackground";
import { bindNoExponentWithNumber } from "./utils";

try {

  bindNoExponentWithNumber();
  
  //init the background events
  InitBackground.initBackground();

} catch (err) {
  console.log("Error in Background Worker: ", err)
}
