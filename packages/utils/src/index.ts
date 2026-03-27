/**
 * @pro-monorepo/utils
 * 公共工具库出口。
 *
 * 这里保持扁平导出，方便业务层按需引入单个工具函数，
 * 同时也保留 default export 兼容对象式使用习惯。
 */

// 浏览器存储相关能力。
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

// 编码、摘要与轻量加密能力。
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
