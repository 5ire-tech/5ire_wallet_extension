import { Duplex } from "readable-stream";

export function isValidStreamMessage(message) {
  return (
    Object.entries(message).length > 0 &&
    Boolean(message.data) &&
    (typeof message.data === "number" ||
      typeof message.data === "object" ||
      typeof message.data === "string")
  );
}

const noop = () => undefined;

const SYN = "SYN";
const ACK = "ACK";

/**
 * Abstract base class for postMessage streams.
 */
export class BasePostMessageStream extends Duplex {
  _init;

  _haveSyn;

  constructor() {
    super({
      objectMode: true,
    });

    // Initialization flags
    this._init = false;
    this._haveSyn = false;
  }

  /**
   * Must be called at end of child constructor to initiate
   * communication with other end.
   */
  _handshake() {
    // Send synchronization message
    this._write(SYN, null, noop);
    this.cork();
  }

  _onData(data) {
    if (this._init) {
      // Forward message
      try {
        this.push(data);
      } catch (err) {
        this.emit("error", err);
      }
    } else if (data === SYN) {
      // Listen for handshake
      this._haveSyn = true;
      this._write(ACK, null, noop);
    } else if (data === ACK) {
      this._init = true;
      if (!this._haveSyn) {
        this._write(ACK, null, noop);
      }
      this.uncork();
    }
  }

  /**
   * Child classes must implement this function.
   */

  _read() {
    return undefined;
  }

  _write(data, _encoding, cb) {
    this._postMessage(data);
    cb();
  }
}

export class WindowPostMessageStream extends BasePostMessageStream {
  _name;

  _target;

  _targetOrigin;

  _targetWindow;

  /**
   * Creates a stream for communicating with other streams across the same or
   * different `window` objects.
   *
   * @param args - Options bag.
   * @param args.name - The name of the stream. Used to differentiate between
   * multiple streams sharing the same window object.
   * @param args.target - The name of the stream to exchange messages with.
   * @param args.targetOrigin - The origin of the target. Defaults to
   * `location.origin`, '*' is permitted.
   * @param args.targetWindow - The window object of the target stream. Defaults
   * to `window`.
   */
  constructor({
    name,
    target,
    targetOrigin = window.location.origin,
    targetWindow = window,
  }) {
    super();

    if (
      typeof window === "undefined" ||
      typeof window.postMessage !== "function"
    ) {
      throw new Error(
        "window.postMessage is not a function. This class should only be instantiated in a Window."
      );
    }

    this._name = name;
    this._target = target;
    this._targetOrigin = targetOrigin;
    this._targetWindow = targetWindow;
    this._onMessage = this._onMessage.bind(this);

    window.addEventListener("message", this._onMessage, false);

    this._handshake();
  }

  _postMessage(data) {
    this._targetWindow.postMessage(
      {
        target: this._target,
        data,
      },
      this._targetOrigin
    );
  }

  _onMessage(event) {
    const message = event.data;

    if (
      (this._targetOrigin !== "*" && event.origin !== this._targetOrigin) ||
      event.source !== this._targetWindow ||
      !isValidStreamMessage(message) ||
      message.target !== this._name
    ) {
      return;
    }

    this._onData(message.data);
  }

  _destroy() {
    window.removeEventListener("message", this._onMessage, false);
  }
}
