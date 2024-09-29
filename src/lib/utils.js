import CryptoJS from 'crypto-js';

const SALT = 'QRConnectWeb';
const KEY_MATERIAL = 'FixedKeyMaterial';

function deriveKey(salt, keyMaterial) {
  const key = CryptoJS.PBKDF2(keyMaterial, salt, {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256
  });
  return key;
}

export function encodeWiFiInfo(ssid, password, encryptionType, isHidden) {
  const info = JSON.stringify({ s: ssid, p: password, t: encryptionType, h: isHidden });
  const key = deriveKey(SALT, KEY_MATERIAL);
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const encrypted = CryptoJS.AES.encrypt(info, key, { iv: iv });
  const combinedData = iv.concat(encrypted.ciphertext);
  return CryptoJS.enc.Base64.stringify(combinedData)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function decodeWiFiInfo(encodedInfo) {
  try {
    const combinedData = CryptoJS.enc.Base64.parse(
      encodedInfo.replace(/-/g, '+').replace(/_/g, '/')
    );
    const iv = CryptoJS.lib.WordArray.create(combinedData.words.slice(0, 4));
    const ciphertext = CryptoJS.lib.WordArray.create(combinedData.words.slice(4));
    
    const key = deriveKey(SALT, KEY_MATERIAL);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      key,
      { iv: iv }
    );
    
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    const { s: ssid, p: password, t: encryptionType, h: isHidden } = JSON.parse(decryptedText);
    return { ssid, password, encryptionType, isHidden };
  } catch (error) {
    console.error('Failed to decode WiFi info:', error);
    return { error: error.message };
  }
}