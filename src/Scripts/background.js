import { InitBackground } from "./initbackground";

try {
  //init the background events
  InitBackground.initBackground();

} catch (err) {
  console.log("Error in Background Worker: ", err)
}
