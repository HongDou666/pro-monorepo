/**
 * 浏览器存储工具。
 *
 * 封装目标：
 * 1. 统一 localStorage / sessionStorage 的访问方式。
 * 2. 提供过期时间语义，减少业务层重复包装。
 * 3. 通过带前缀实例隔离不同模块的 key 命名空间。
 */

/** 存储类型 */
export type StorageType = "local" | "session";

/** 存储配置 */
export interface StorageOptions {
  /** 存储类型：localStorage 或 sessionStorage */
  type?: StorageType;
  /** 过期时间（毫秒），不设置则永不过期 */
  expire?: number;
}

/** 存储数据结构 */
export interface StorageData<T> {
  /** 存储的值 */
  value: T;
  /** 过期时间戳 */
  expire?: number;
  /** 创建时间戳 */
  createTime: number;
}

/**
 * 根据配置返回底层存储实例。
 *
 * 这里不缓存引用，直接按需读取浏览器原生对象，保持实现简单且可预测。
 * @param type 存储类型
 */
function getStorageInstance(type: StorageType): Storage {
  return type === "session" ? sessionStorage : localStorage;
}

/**
 * 写入存储。
 *
 * 统一将 value 包装为带元信息的数据结构，后续读取时才能进行过期判断。
 * @param key 存储键名
 * @param value 存储值
 * @param options 存储配置
 */
export function setStorage<T>(key: string, value: T, options: StorageOptions = {}): void {
  const { type = "local", expire } = options;
  const storageInstance = getStorageInstance(type);

  const data: StorageData<T> = {
    value,
    createTime: Date.now(),
    expire: expire ? Date.now() + expire : undefined
  };

  try {
    storageInstance.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`[Storage] 设置存储失败: ${key}`, error);
  }
}

/**
 * 读取存储。
 *
 * 如果数据已过期，会顺手删除旧值，避免存储空间长期被无效数据占用。
 * @param key 存储键名
 * @param options 存储配置
 * @returns 存储值，不存在或已过期返回 null
 */
export function getStorage<T>(key: string, options: StorageOptions = {}): T | null {
  const { type = "local" } = options;
  const storageInstance = getStorageInstance(type);

  try {
    const rawData = storageInstance.getItem(key);

    if (!rawData) return null;

    const data: StorageData<T> = JSON.parse(rawData);

    // 过期数据在读取时做惰性清理，不额外引入定时扫描成本。
    if (data.expire && Date.now() > data.expire) {
      removeStorage(key, options);

      return null;
    }

    return data.value;
  } catch (error) {
    console.error(`[Storage] 获取存储失败: ${key}`, error);

    return null;
  }
}

/**
 * 删除单个 key。
 * @param key 存储键名
 * @param options 存储配置
 */
export function removeStorage(key: string, options: StorageOptions = {}): void {
  const { type = "local" } = options;
  const storageInstance = getStorageInstance(type);

  storageInstance.removeItem(key);
}

/**
 * 清空指定存储域。
 *
 * 注意这是全量操作，不区分是否由当前工具写入。
 * @param options 存储配置
 */
export function clearStorage(options: StorageOptions = {}): void {
  const { type = "local" } = options;
  const storageInstance = getStorageInstance(type);

  storageInstance.clear();
}

/**
 * 检查 key 是否存在且未过期。
 * @param key 存储键名
 * @param options 存储配置
 */
export function hasStorage(key: string, options: StorageOptions = {}): boolean {
  return getStorage(key, options) !== null;
}

/**
 * 返回当前存储域中的全部 key。
 *
 * 这里不做前缀过滤，调用方如需隔离应通过 createStorage 创建命名空间实例。
 * @param options 存储配置
 */
export function getStorageKeys(options: StorageOptions = {}): string[] {
  const { type = "local" } = options;
  const storageInstance = getStorageInstance(type);
  const keys: string[] = [];

  for (let i = 0; i < storageInstance.length; i++) {
    const key = storageInstance.key(i);

    if (key) keys.push(key);
  }

  return keys;
}

/**
 * 粗略估算当前存储域占用大小。
 *
 * 返回值按 UTF-16 双字节字符近似计算，适合做容量提示，不适合作精确计费。
 * @param options 存储配置
 */
export function getStorageSize(options: StorageOptions = {}): number {
  const { type = "local" } = options;
  const storageInstance = getStorageInstance(type);

  let size = 0;

  for (let i = 0; i < storageInstance.length; i++) {
    const key = storageInstance.key(i);

    if (key) {
      const value = storageInstance.getItem(key);

      if (value) {
        size += key.length + value.length;
      }
    }
  }

  return size * 2; // 字符编码占用 2 字节
}

/** 带前缀的存储实例接口 */
export interface PrefixedStorage {
  /** 设置存储 */
  set<T>(key: string, value: T, opts?: StorageOptions): void;
  /** 获取存储 */
  get<T>(key: string, opts?: StorageOptions): T | null;
  /** 移除存储 */
  remove(key: string, opts?: StorageOptions): void;
  /** 检查存储是否存在 */
  has(key: string, opts?: StorageOptions): boolean;
}

/**
 * 创建带前缀的存储实例。
 *
 * 适合业务模块、组件库或多租户场景，避免不同调用方 key 冲突。
 * @param prefix 键名前缀
 * @param options 默认配置
 */
export function createStorage(prefix: string, options: StorageOptions = {}): PrefixedStorage {
  return {
    set<T>(key: string, value: T, opts?: StorageOptions): void {
      setStorage(`${prefix}${key}`, value, { ...options, ...opts });
    },
    get<T>(key: string, opts?: StorageOptions): T | null {
      return getStorage<T>(`${prefix}${key}`, { ...options, ...opts });
    },
    remove(key: string, opts?: StorageOptions): void {
      removeStorage(`${prefix}${key}`, { ...options, ...opts });
    },
    has(key: string, opts?: StorageOptions): boolean {
      return hasStorage(`${prefix}${key}`, { ...options, ...opts });
    }
  };
}

// 默认导出保留对象式调用体验，兼容 storage.get()/set() 这类使用方式。
const storage = {
  set: setStorage,
  get: getStorage,
  remove: removeStorage,
  clear: clearStorage,
  has: hasStorage,
  keys: getStorageKeys,
  size: getStorageSize,
  create: createStorage
};

export default storage;
