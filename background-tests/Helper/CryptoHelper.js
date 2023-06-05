"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decryptor = decryptor;
exports.encryptor = encryptor;
var _index = _interopRequireDefault(require("crypto-browserify/index"));
var _buffer = require("buffer/");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const algorithm = "aes-256-ctr";
const IV_LENGTH = 16;
const unpack = str => {
  try {
    const toBytes = Array.from(_buffer.Buffer.from(str, "utf8"));
    const bytes = toBytes.slice(0, 32);
    return bytes;
  } catch (error) {
    console.log("Error under unpack", error);
  }
};
function encryptor(text, key) {
  try {
    const ENCRYPTION_KEY = _buffer.Buffer.from(key.toString(), "base64");
    let iv = _index.default.randomBytes(IV_LENGTH);
    let cipher = _index.default.createCipheriv(algorithm, _buffer.Buffer.from(unpack(ENCRYPTION_KEY), "hex"), iv);
    let encrypted = cipher.update(text);
    encrypted = _buffer.Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("Error : ", error);
  }
}
function decryptor(text, key) {
  try {
    const ENCRYPTION_KEY = _buffer.Buffer.from(key.toString(), "base64");
    let textParts = text.split(":");
    let iv = _buffer.Buffer.from(textParts.shift(), "hex");
    let encryptedText = _buffer.Buffer.from(textParts.join(":"), "hex");
    let decipher = _index.default.createDecipheriv(algorithm, _buffer.Buffer.from(unpack(ENCRYPTION_KEY), "hex"), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = _buffer.Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("error : ", error);
  }
}