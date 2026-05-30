import { describe, it, expect } from "vitest";
import {
  generateKeyPair,
  exportKey,
  importKey,
  encryptForDevice,
  decryptFromDevice,
  encryptForMultipleDevices,
  encodeBase64,
  decodeBase64
} from "./index.js";

describe("Base64 Utilities", () => {
  it("should encode and decode bytes to base64 correctly", () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const encoded = encodeBase64(bytes);
    expect(encoded).toBe("SGVsbG8=");
    
    const decoded = decodeBase64(encoded);
    expect(decoded).toEqual(bytes);
  });

  it("should handle empty byte array", () => {
    const bytes = new Uint8Array([]);
    const encoded = encodeBase64(bytes);
    expect(encoded).toBe("");
    
    const decoded = decodeBase64(encoded);
    expect(decoded).toEqual(bytes);
  });
});

describe("End-to-End Encryption Layer", () => {
  it("should generate valid keys and perform a successful round-trip E2EE", () => {
    const alice = generateKeyPair();
    const bob = generateKeyPair();

    const alicePubBase64 = exportKey(alice.publicKey);
    const alicePrivBase64 = exportKey(alice.privateKey);
    const bobPubBase64 = exportKey(bob.publicKey);
    const bobPrivBase64 = exportKey(bob.privateKey);

    const plaintext = "This is a highly confidential clipboard snippet!";

    // Alice encrypts for Bob
    const { ciphertext, nonce } = encryptForDevice(plaintext, bobPubBase64, alicePrivBase64);

    // Bob decrypts from Alice
    const decrypted = decryptFromDevice(ciphertext, nonce, alicePubBase64, bobPrivBase64);

    expect(decrypted).toBe(plaintext);
  });

  it("should throw an error if decrypting with the wrong keys", () => {
    const alice = generateKeyPair();
    const bob = generateKeyPair();
    const eve = generateKeyPair();

    const alicePrivBase64 = exportKey(alice.privateKey);
    const bobPubBase64 = exportKey(bob.publicKey);
    const evePrivBase64 = exportKey(eve.privateKey);
    const alicePubBase64 = exportKey(alice.publicKey);

    const plaintext = "Top secret data";

    // Alice encrypts for Bob
    const { ciphertext, nonce } = encryptForDevice(plaintext, bobPubBase64, alicePrivBase64);

    // Eve attempts to decrypt from Alice (using Eve's private key instead of Bob's)
    expect(() => {
      decryptFromDevice(ciphertext, nonce, alicePubBase64, evePrivBase64);
    }).toThrow();
  });

  it("should support E2EE for multiple devices", () => {
    const sender = generateKeyPair();
    const device1 = generateKeyPair();
    const device2 = generateKeyPair();

    const senderPrivBase64 = exportKey(sender.privateKey);
    const senderPubBase64 = exportKey(sender.publicKey);

    const dev1PubBase64 = exportKey(device1.publicKey);
    const dev2PubBase64 = exportKey(device2.publicKey);

    const plaintext = "Shared among devices";

    const devices = [
      { deviceId: "device-1", publicKey: dev1PubBase64 },
      { deviceId: "device-2", publicKey: dev2PubBase64 }
    ];

    // Encrypt for all devices
    const encryptedPayloads = encryptForMultipleDevices(plaintext, devices, senderPrivBase64);

    expect(encryptedPayloads).toHaveLength(2);
    expect(encryptedPayloads[0].deviceId).toBe("device-1");
    expect(encryptedPayloads[1].deviceId).toBe("device-2");

    // Device 1 decrypts its payload
    const decrypted1 = decryptFromDevice(
      encryptedPayloads[0].ciphertext,
      encryptedPayloads[0].nonce,
      senderPubBase64,
      exportKey(device1.privateKey)
    );
    expect(decrypted1).toBe(plaintext);

    // Device 2 decrypts its payload
    const decrypted2 = decryptFromDevice(
      encryptedPayloads[1].ciphertext,
      encryptedPayloads[1].nonce,
      senderPubBase64,
      exportKey(device2.privateKey)
    );
    expect(decrypted2).toBe(plaintext);
  });

  it("should correctly handle Unicode, emojis, and special code characters", () => {
    const alice = generateKeyPair();
    const bob = generateKeyPair();

    const alicePrivBase64 = exportKey(alice.privateKey);
    const alicePubBase64 = exportKey(alice.publicKey);
    const bobPrivBase64 = exportKey(bob.privateKey);
    const bobPubBase64 = exportKey(bob.publicKey);

    const unicodeText = "Hello 🌍! Code: const key = 🔑 => { return '🔓'; }; 🚀 日本語, 中文, dynamically-typed code.";

    const { ciphertext, nonce } = encryptForDevice(unicodeText, bobPubBase64, alicePrivBase64);
    const decrypted = decryptFromDevice(ciphertext, nonce, alicePubBase64, bobPrivBase64);

    expect(decrypted).toBe(unicodeText);
  });
});
