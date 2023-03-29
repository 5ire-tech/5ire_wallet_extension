//event emitter
export class EventEmitter {
    constructor() {
        this.eventHandler = {};
    }

    on = (eventName, handler) => {
        this.eventHandler[eventName] = handler;
    }

    emit = (eventName, ...args) => {
        this.eventHandler[eventName](...args);
    }
}