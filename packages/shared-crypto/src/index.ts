import nacl from "tweetnacl";

const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Pure JavaScript Base64 encoder that works identically across Browser, Node.js, and React Native.
 */
export function encodeBase64(bytes: Uint8Array): string {
  let result = "";
  const l = bytes.length;
  for (let i = 0; i < l; i += 3) {
    const c1 = bytes[i];
    const c2 = i + 1 < l ? bytes[i + 1] : NaN;
    const c3 = i + 2 < l ? bytes[i + 2] : NaN;
    const byte1 = c1 >> 2;
    const byte2 = ((c1 & 3) << 4) | (isNaN(c2) ? 0 : c2 >> 4);
    const byte3 = isNaN(c2) ? 64 : ((c2 & 15) << 2) | (isNaN(c3) ? 0 : c3 >> 6);
    const byte4 = isNaN(c3) ? 64 : c3 & 63;
    result +=
      base64Chars[byte1] +
      base64Chars[byte2] +
      (byte3 === 64 ? "=" : base64Chars[byte3]) +
      (byte4 === 64 ? "=" : base64Chars[byte4]);
  }
  return result;
}

/**
 * Pure JavaScript Base64 decoder that works identically across Browser, Node.js, and React Native.
 */
export function decodeBase64(str: string): Uint8Array {
  // Remove padding for length calculation
  const cleanStr = str.replace(/=+$/, "");
  const len = cleanStr.length;
  const bufferLength = Math.floor(len * 0.75);
  const bytes = new Uint8Array(bufferLength);
  
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const encoded1 = base64Chars.indexOf(cleanStr[i]);
    const encoded2 = i + 1 < len ? base64Chars.indexOf(cleanStr[i + 1]) : 0;
    const encoded3 = i + 2 < len ? base64Chars.indexOf(cleanStr[i + 2]) : 0;
    const encoded4 = i + 3 < len ? base64Chars.indexOf(cleanStr[i + 3]) : 0;

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
    }
  }
  return bytes;
}

/**
 * Helper to convert UTF-8 string to Uint8Array (works in all JS environments).
 */
export function stringToBytes(str: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str);
  }
  // Fallback for older JS engines if TextEncoder is absent (e.g. some React Native versions)
  const utf8 = unescape(encodeURIComponent(str));
  const arr = new Uint8Array(utf8.length);
  for (let i = 0; i < utf8.length; i++) {
    arr[i] = utf8.charCodeAt(i);
  }
  return arr;
}

/**
 * Helper to convert Uint8Array to UTF-8 string (works in all JS environments).
 */
export function bytesToString(bytes: Uint8Array): string {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(bytes);
  }
  // Fallback for older JS engines if TextDecoder is absent
  let encoded = "";
  for (let i = 0; i < bytes.length; i++) {
    encoded += String.fromCharCode(bytes[i]);
  }
  return decodeURIComponent(escape(encoded));
}

/**
 * Generates a new cryptographically secure asymmetric KeyPair for end-to-end encryption.
 * Private keys are generated on-device and never transmitted. The server only stores 
 * encrypted payloads and public keys. Even ClipStream cannot read clipboard contents.
 */
export function generateKeyPair(): { publicKey: Uint8Array; privateKey: Uint8Array } {
  const pair = nacl.box.keyPair();
  return {
    publicKey: pair.publicKey,
    privateKey: pair.secretKey
  };
}

/**
 * Base64 encodes a Uint8Array key for storage or network transport.
 */
export function exportKey(key: Uint8Array): string {
  return encodeBase64(key);
}

/**
 * Base64 decodes a string back into a Uint8Array key.
 */
export function importKey(str: string): Uint8Array {
  return decodeBase64(str);
}

/**
 * Encrypts a plaintext string for a specific recipient device using their public key and the sender's private key.
 * Private keys are generated on-device and never transmitted. The server only stores 
 * encrypted payloads and public keys. Even ClipStream cannot read clipboard contents.
 * 
 * @param plaintext The secret content to encrypt
 * @param theirPublicKey Base64 encoded public key of the recipient device
 * @param myPrivateKey Base64 encoded private key of the sender device
 * @returns Base64 encoded ciphertext and nonce
 */
export function encryptForDevice(
  plaintext: string,
  theirPublicKey: string,
  myPrivateKey: string
): { ciphertext: string; nonce: string } {
  const plaintextBytes = stringToBytes(plaintext);
  const recipientPublicKeyBytes = importKey(theirPublicKey);
  const senderPrivateKeyBytes = importKey(myPrivateKey);
  
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const encrypted = nacl.box(
    plaintextBytes,
    nonce,
    recipientPublicKeyBytes,
    senderPrivateKeyBytes
  );

  return {
    ciphertext: encodeBase64(encrypted),
    nonce: encodeBase64(nonce)
  };
}

/**
 * Decrypts a ciphertext payload received from a sending device using the sender's public key and my private key.
 * Private keys are generated on-device and never transmitted. The server only stores 
 * encrypted payloads and public keys. Even ClipStream cannot read clipboard contents.
 * 
 * @param ciphertext Base64 encoded encrypted payload
 * @param nonce Base64 encoded unique nonce
 * @param theirPublicKey Base64 encoded public key of the sender device
 * @param myPrivateKey Base64 encoded private key of the recipient device
 * @returns Plaintext string if successful; throws otherwise
 */
export function decryptFromDevice(
  ciphertext: string,
  nonce: string,
  theirPublicKey: string,
  myPrivateKey: string
): string {
  const ciphertextBytes = importKey(ciphertext);
  const nonceBytes = importKey(nonce);
  const senderPublicKeyBytes = importKey(theirPublicKey);
  const recipientPrivateKeyBytes = importKey(myPrivateKey);

  const decrypted = nacl.box.open(
    ciphertextBytes,
    nonceBytes,
    senderPublicKeyBytes,
    recipientPrivateKeyBytes
  );

  if (!decrypted) {
    throw new Error("Decryption failed. Invalid keys, corrupted payload, or invalid nonce.");
  }

  return bytesToString(decrypted);
}

/**
 * Encrypts a plaintext payload uniquely for multiple recipient devices.
 * Private keys are generated on-device and never transmitted. The server only stores 
 * encrypted payloads and public keys. Even ClipStream cannot read clipboard contents.
 * 
 * @param plaintext The secret content to encrypt
 * @param devices List of devices with their deviceIds and public keys
 * @param myPrivateKey Base64 encoded private key of the sender device
 * @returns Array of encrypted payloads for each device
 */
export function encryptForMultipleDevices(
  plaintext: string,
  devices: Array<{ deviceId: string; publicKey: string }>,
  myPrivateKey: string
): Array<{ deviceId: string; ciphertext: string; nonce: string }> {
  return devices.map(device => {
    const { ciphertext, nonce } = encryptForDevice(plaintext, device.publicKey, myPrivateKey);
    return {
      deviceId: device.deviceId,
      ciphertext,
      nonce
    };
  });
}
