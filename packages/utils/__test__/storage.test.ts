import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setStorage, getStorage, removeStorage, hasStorage, clearStorage, getStorageKeys } from "../src/storage";

describe("Storage Utils", () => {
  beforeEach(() => {
    // 每个测试前清空 localStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    // 每个测试后清空
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("setStorage / getStorage", () => {
    it("应该能够设置和获取 localStorage 数据", () => {
      setStorage("test-key", "test-value");
      expect(getStorage("test-key")).toBe("test-value");
    });

    it("应该能够设置和获取 sessionStorage 数据", () => {
      setStorage("test-key", "test-value", { type: "session" });
      expect(getStorage("test-key", { type: "session" })).toBe("test-value");
    });

    it("应该能够存储对象类型数据", () => {
      const obj = { name: "test", count: 123 };

      setStorage("test-obj", obj);
      expect(getStorage<typeof obj>("test-obj")).toEqual(obj);
    });

    it("应该能够存储数组类型数据", () => {
      const arr = [1, 2, 3, "test"];

      setStorage("test-arr", arr);
      expect(getStorage<typeof arr>("test-arr")).toEqual(arr);
    });

    it("获取不存在的 key 应该返回 null", () => {
      expect(getStorage("non-existent-key")).toBeNull();
    });

    it("过期数据应该返回 null 并被删除", () => {
      setStorage("expired-key", "value", { expire: 1 });

      // 等待过期
      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(getStorage("expired-key")).toBeNull();
          resolve();
        }, 10);
      });
    });
  });

  describe("removeStorage", () => {
    it("应该能够删除存储的数据", () => {
      setStorage("remove-test", "value");
      expect(getStorage("remove-test")).toBe("value");
      removeStorage("remove-test");
      expect(getStorage("remove-test")).toBeNull();
    });

    it("删除不存在的 key 不应该报错", () => {
      expect(() => removeStorage("non-existent-key")).not.toThrow();
    });
  });

  describe("hasStorage", () => {
    it("存在的 key 应该返回 true", () => {
      setStorage("exists-key", "value");
      expect(hasStorage("exists-key")).toBe(true);
    });

    it("不存在的 key 应该返回 false", () => {
      expect(hasStorage("non-existent-key")).toBe(false);
    });
  });

  describe("clearStorage", () => {
    it("应该能够清空所有存储", () => {
      setStorage("key1", "value1");
      setStorage("key2", "value2");
      setStorage("key3", "value3", { type: "session" });

      clearStorage();
      expect(hasStorage("key1")).toBe(false);
      expect(hasStorage("key2")).toBe(false);

      clearStorage({ type: "session" });
      expect(hasStorage("key3", { type: "session" })).toBe(false);
    });
  });

  describe("getStorageKeys", () => {
    it("应该能够获取所有存储的键名", () => {
      setStorage("key1", "value1");
      setStorage("key2", "value2");

      const keys = getStorageKeys();

      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
    });
  });
});
