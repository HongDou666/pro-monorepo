/**
 * @pro-monorepo/utils
 * 公共工具库
 */

// 浏览器存储工具
export {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  hasStorage,
  getStorageKeys,
  getStorageSize,
  createStorage,
  default as storage
} from "./storage";
export type { PrefixedStorage, StorageData, StorageOptions, StorageType } from "./storage";

// 加密解密工具
export {
  base64Encode,
  base64Decode,
  xorEncrypt,
  xorDecrypt,
  generateKey,
  aesEncrypt,
  aesDecrypt,
  sha256,
  sha512,
  md5,
  default as cryptoUtils
} from "./crypto";
