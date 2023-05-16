//page response helper class and sending the response to page
export class PageResponseHandler {

    constructor() {
        this.handlers = {};
    }

    //add the resquest for handling
    addRequest(request) {
    this.handlers[request.id] = request;
    }

    //reject the request
    reject(data) {
        this.handlers[data.id].reject(data.error);
        this._deleteHandler(data.id);
    }

    //resolve the requets
    resolve(data) {
        console.log("here is some data: ", this.handlers, data);
        this.handlers[data.id]?.resolve(data.response?.result ? data.response.result : data.response);
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