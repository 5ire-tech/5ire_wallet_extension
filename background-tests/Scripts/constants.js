"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.INPAGE = exports.CONTENT_SCRIPT = exports.BACKGROUND = exports.ACCOUNT_CHANGED_EVENT = void 0;
exports.getId = getId;
const CONTENT_SCRIPT = "fire-contentscript";
exports.CONTENT_SCRIPT = CONTENT_SCRIPT;
const INPAGE = "fire-inpage";
exports.INPAGE = INPAGE;
const BACKGROUND = "fire-background";
exports.BACKGROUND = BACKGROUND;
const ACCOUNT_CHANGED_EVENT = "accountChanged";
exports.ACCOUNT_CHANGED_EVENT = ACCOUNT_CHANGED_EVENT;
let counter = 0;
function getId() {
  return `5IRE.${Date.now()}.${++counter}`;
}