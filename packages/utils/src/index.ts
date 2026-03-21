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
