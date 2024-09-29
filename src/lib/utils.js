import CryptoJS from 'crypto-js';

const KEY = process.env.ENCRYPTION_KEY || 'xK9#mP2$qL7@fR4';
const IV = CryptoJS.enc.Utf8.parse(process.env.ENCRYPTION_IV || 'Zt3*Hy6&Nw1^Ej8$');
const ITERATIONS = parseInt(process.env.PBKDF2_ITERATIONS) || 100000;
const SALT_LENGTH = parseInt(process.env.SALT_LENGTH) || 32;
const KEY_SIZE = parseInt(process.env.KEY_SIZE) || 256;

let logCallback = console.log;

export function setLogCallback(callback) {
  if (typeof callback === 'function') {
    logCallback = callback;
  } else {
    throw new Error('回调必须是一个函数');
  }
}

function log(message) {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  logCallback(`[${timestamp}] ${message}`);
}

function xorEncrypt(data, key) {
  return data.split('').map((char, index) => 
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))
  ).join('');
}

export function encodeWiFiInfo(ssid, password, encryptionType, isHidden) {
  try {
    log(`开始编码WiFi信息: SSID=${ssid}, 加密类型=${encryptionType}, 是否隐藏=${isHidden}`);
    if (!ssid || !password || !encryptionType) {
      throw new Error('缺少必要参数');
    }
    
    const info = JSON.stringify({ s: ssid, p: password, t: encryptionType, h: isHidden });
    
    const salt = CryptoJS.lib.WordArray.random(SALT_LENGTH);
    const key = CryptoJS.PBKDF2(KEY, salt, {
      keySize: KEY_SIZE / 32,
      iterations: ITERATIONS
    });
    
    // 第一层加密：AES
    const encrypted = CryptoJS.AES.encrypt(info, key, {
      iv: IV,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    
    // 第二层加密：RC4
    const rc4Key = CryptoJS.lib.WordArray.random(16);
    const rc4Encrypted = CryptoJS.RC4.encrypt(encrypted.toString(), rc4Key);
    
    // 第三层加密：XOR
    const xorKey = CryptoJS.lib.WordArray.random(8).toString();
    const xorEncrypted = xorEncrypt(rc4Encrypted.toString(), xorKey);
    
    const combinedCiphertext = salt.toString() + rc4Key.toString() + xorKey + xorEncrypted;
    log(`加密完成，密文长度: ${combinedCiphertext.length}`);
    
    // 混合编码：Base64 + URL编码 + 反转字符串
    const base64Result = btoa(combinedCiphertext);
    const reversedResult = base64Result.split('').reverse().join('');
    const result = encodeURIComponent(reversedResult);
    log(`最终编码结果长度: ${result.length}`);
    
    return result;
  } catch (error) {
    log(`编码WiFi信息时发生错误: ${error.message}`);
    throw error;
  }
}

export function decodeWiFiInfo(encodedInfo) {
  log('开始解码WiFi信息');
  try {
    if (!encodedInfo) {
      log('错误：提供的编码信息为空');
      return { error: '编码信息为空' };
    }
    
    // 解码混合编码：URL解码 + 反转字符串 + Base64解码
    const decodedInfo = decodeURIComponent(encodedInfo);
    const unreversedInfo = decodedInfo.split('').reverse().join('');
    const cleanedInfo = atob(unreversedInfo);
    
    const salt = CryptoJS.enc.Hex.parse(cleanedInfo.substr(0, SALT_LENGTH * 2));
    const rc4Key = CryptoJS.enc.Hex.parse(cleanedInfo.substr(SALT_LENGTH * 2, 32));
    const xorKey = cleanedInfo.substr(SALT_LENGTH * 2 + 32, 16);
    const ciphertext = cleanedInfo.substr(SALT_LENGTH * 2 + 32 + 16);
    
    const key = CryptoJS.PBKDF2(KEY, salt, {
      keySize: KEY_SIZE / 32,
      iterations: ITERATIONS
    });
    
    // 第一层解密：XOR
    const xorDecrypted = xorEncrypt(ciphertext, xorKey);
    
    // 第二层解密：RC4
    const rc4Decrypted = CryptoJS.RC4.decrypt(xorDecrypted, rc4Key);
    
    // 第三层解密：AES
    const decrypted = CryptoJS.AES.decrypt(rc4Decrypted.toString(CryptoJS.enc.Utf8), key, {
      iv: IV,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    }).toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      log('错误：解密失败');
      return { error: '解密失败' };
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(decrypted);
    } catch (e) {
      log('错误：解密后的数据不是有效的JSON格式');
      return { error: '无效的JSON结构' };
    }
    
    const { s: ssid, p: password, t: encryptionType, h: isHidden } = parsedData;
    if (!ssid || !password || !encryptionType) {
      log('错误：解码后的数据缺少必要字段');
      return { error: '解码数据中缺少必要字段' };
    }
    
    log(`解码成功 - SSID: ${ssid}, 加密类型: ${encryptionType}, 是否隐藏: ${isHidden}`);
    return { ssid, password, encryptionType, isHidden };
  } catch (error) {
    log(`解码WiFi信息时发生错误: ${error.message}`);
    return { error: error.message };
  }
}