import crypto from "crypto-browserify/index";
import { Buffer } from "buffer/";

const algorithm = "aes-256-ctr";
const IV_LENGTH = 16;

const unpack = (str) => {
  try {
    const toBytes = Array.from(Buffer.from(str, "utf8"));
    const bytes = toBytes.slice(0, 32);
    return bytes;
  } catch (error) {
    console.log("erorr : ", error);
  }
};

export function encryptor(text, key) {
  try {
    const ENCRYPTION_KEY = Buffer.from(key.toString(), "base64");
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(unpack(ENCRYPTION_KEY), "hex"),
      iv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error(error);
  }
}

export function decryptor(text, key) {
  try {
    const ENCRYPTION_KEY = Buffer.from(key.toString(), "base64");
    let textParts = text.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(unpack(ENCRYPTION_KEY), "hex"),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error(error);
  }
}
