"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PageResponseHandler = void 0;
//page response helper class and sending the response to page
class PageResponseHandler {
  constructor() {
    this.handlers = {};
  }

  //add the resquest for handling
  addRequest(request) {
    this.handlers[request.id] = request;
  }

  //reject the request
  reject(data) {
    var _this$handlers$data$i;
    (_this$handlers$data$i = this.handlers[data.id]) === null || _this$handlers$data$i === void 0 ? void 0 : _this$handlers$data$i.reject(data.error);
    this._deleteHandler(data.id);
  }

  //resolve the requets
  resolve(data) {
    var _this$handlers$data$i2, _data$response;
    (_this$handlers$data$i2 = this.handlers[data.id]) === null || _this$handlers$data$i2 === void 0 ? void 0 : _this$handlers$data$i2.resolve((_data$response = data.response) !== null && _data$response !== void 0 && _data$response.result ? data.response.result : data.response);
    this._deleteHandler(data.id);
  }

  //get the current handler
  getHandler(id) {
    return this.handlers[id];
  }

  //delete the handler
  _deleteHandler(id) {
    delete this.handlers[id];
  }
}
exports.PageResponseHandler = PageResponseHandler;