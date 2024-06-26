import stream_1 from "stream";
export default class PortDuplexStream extends stream_1.Duplex {
  /**
   * @param port - An instance of WebExtensions Runtime.Port. See:
   * {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port}
   */
  constructor(port) {
    super({ objectMode: true });
    this._port = port;
    this._port.onMessage.addListener((msg, port) => this._onMessage(msg, port));
    this._port.onDisconnect.addListener(() => this._onDisconnect());
  }
  /**
   * Callback triggered when a message is received from
   * the remote Port associated with this Stream.
   *
   * @param msg - Payload from the onMessage listener of the port
   */
  _onMessage(msg, port) {
    if (Buffer.isBuffer(msg)) {
      const data = Buffer.from(msg);
      this.push(data);
    } else {
      this.push({ message: msg, sender: port?.sender });
    }
  }
  /**
   * Callback triggered when the remote Port associated with this Stream
   * disconnects.
   */
  _onDisconnect() {
    this.destroy();
  }
  /**
   * Explicitly sets read operations to a no-op.
   */
  _read() {
    return undefined;
  }
  /**
   * Called internally when data should be written to this writable stream.
   *
   * @param msg - Arbitrary object to write
   * @param encoding - Encoding to use when writing payload
   * @param cb - Called when writing is complete or an error occurs
   */
  _write(msg, _encoding, cb) {
    try {
      if (Buffer.isBuffer(msg)) {
        const data = msg.toJSON();
        data._isBuffer = true;
        this._port.postMessage(data);
      } else {
        this._port.postMessage(msg);
      }
    } catch (error) {
      return cb(new Error("PortDuplexStream - disconnected"));
    }
    return cb();
  }
}
